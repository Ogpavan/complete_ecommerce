import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isFrontendOnly } from "@/lib/server/frontendOnly";
import { storefrontProducts } from "@/data/products";
import type { CartSummary } from "@/lib/types";

export const CART_COOKIE_NAME = "cart_session";

const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const FRONTEND_ONLY_STOCK = 20;
const FRONTEND_ONLY_CURRENCY = "USD";
const FRONTEND_ONLY_VARIANT_TITLE = "Default";

type FrontendCart = {
  id: number;
  sessionToken: string;
  currency: string;
  items: CartSummary["items"];
};

const frontendCartsByToken = new Map<string, FrontendCart>();
const frontendCartsById = new Map<number, FrontendCart>();
let frontendCartId = 1;
let frontendItemId = 1;

export class CartError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function sanitizeQuantity(value: number | undefined) {
  if (!value || Number.isNaN(value)) {
    return 1;
  }

  return Math.max(1, Math.floor(value));
}

function toFrontendVariantId(productId: number) {
  return productId * 10;
}

function getFrontendProductById(productId: number) {
  return storefrontProducts.find((product) => product.id === productId) ?? null;
}

function getOrCreateFrontendCart(sessionToken: string) {
  const existing = frontendCartsByToken.get(sessionToken);
  if (existing) {
    return existing;
  }

  const cart: FrontendCart = {
    id: frontendCartId++,
    sessionToken,
    currency: FRONTEND_ONLY_CURRENCY,
    items: []
  };

  frontendCartsByToken.set(sessionToken, cart);
  frontendCartsById.set(cart.id, cart);
  return cart;
}

function getFrontendCartById(cartId: number) {
  return frontendCartsById.get(cartId) ?? null;
}

function buildFrontendCartSummary(cart: FrontendCart): CartSummary {
  const subtotal = Number(
    cart.items.reduce((sum, item) => sum + Number(item.lineTotal ?? 0), 0).toFixed(2)
  );
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cart.id,
    currency: cart.currency,
    subtotal,
    itemCount,
    items: cart.items.map((item) => ({
      ...item,
      stock: FRONTEND_ONLY_STOCK,
      inStock: FRONTEND_ONLY_STOCK >= item.quantity
    }))
  };
}

export function attachCartCookie(response: NextResponse, sessionToken: string) {
  response.cookies.set(CART_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE_SECONDS
  });
}

async function getOrCreateCart(sessionToken: string) {
  const existing = await prisma.cart.findUnique({
    where: { sessionToken }
  });

  if (existing) {
    return existing;
  }

  return prisma.cart.create({
    data: {
      sessionToken
    }
  });
}

async function loadCartSummary(cartId: number): Promise<CartSummary> {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        orderBy: { id: "asc" },
        include: {
          product: {
            select: {
              slug: true
            }
          },
          variant: {
            select: {
              stock: true,
              isActive: true
            }
          }
        }
      }
    }
  });

  if (!cart) {
    throw new CartError(404, "CART_NOT_FOUND", "Cart not found.");
  }

  const items = cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    productSlug: item.product.slug,
    variantId: item.variantId,
    name: item.productName,
    variantName: item.variantName,
    image: item.productImage ?? "",
    quantity: item.quantity,
    unitPrice: toNumber(item.unitPrice),
    lineTotal: toNumber(item.lineTotal),
    stock: Math.max(0, item.variant.stock),
    inStock: item.variant.isActive && item.variant.stock >= item.quantity
  }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (toNumber(cart.subtotal) !== subtotal || cart.itemCount !== itemCount) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        subtotal,
        itemCount
      }
    });
  }

  return {
    id: cart.id,
    currency: cart.currency,
    subtotal,
    itemCount,
    items
  };
}

export async function ensureCartFromRequest(request: NextRequest) {
  if (isFrontendOnly()) {
    const existingToken = request.cookies.get(CART_COOKIE_NAME)?.value;
    const sessionToken = existingToken || randomUUID();
    const shouldSetCookie = !existingToken;
    const cart = getOrCreateFrontendCart(sessionToken);
    const summary = buildFrontendCartSummary(cart);

    return {
      cartId: cart.id,
      sessionToken,
      shouldSetCookie,
      summary
    };
  }

  const existingToken = request.cookies.get(CART_COOKIE_NAME)?.value;
  const sessionToken = existingToken || randomUUID();
  const shouldSetCookie = !existingToken;
  const cart = await getOrCreateCart(sessionToken);
  const summary = await loadCartSummary(cart.id);

  return {
    cartId: cart.id,
    sessionToken,
    shouldSetCookie,
    summary
  };
}

async function resolveVariantForCart(productId: number, variantId: number) {
  const variant = await prisma.productVariant.findFirst({
    where: {
      id: variantId,
      productId,
      isActive: true,
      product: {
        isActive: true
      }
    },
    include: {
      product: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1
          }
        }
      }
    }
  });

  if (!variant) {
    throw new CartError(404, "VARIANT_NOT_FOUND", "Product variant not found.");
  }

  return variant;
}

export async function addItemToCart(input: {
  cartId: number;
  productId: number;
  variantId: number;
  quantity?: number;
}) {
  if (isFrontendOnly()) {
    const cart = getFrontendCartById(input.cartId);
    if (!cart) {
      throw new CartError(404, "CART_NOT_FOUND", "Cart not found.");
    }

    const product = getFrontendProductById(input.productId);
    if (!product) {
      throw new CartError(404, "VARIANT_NOT_FOUND", "Product variant not found.");
    }

    const expectedVariantId = toFrontendVariantId(product.id);
    if (input.variantId !== expectedVariantId) {
      throw new CartError(404, "VARIANT_NOT_FOUND", "Product variant not found.");
    }

    const quantity = sanitizeQuantity(input.quantity);
    const existing = cart.items.find((item) => item.variantId === expectedVariantId);
    const nextQuantity = (existing?.quantity ?? 0) + quantity;

    if (nextQuantity > FRONTEND_ONLY_STOCK) {
      throw new CartError(409, "INSUFFICIENT_STOCK", "Requested quantity exceeds available stock.");
    }

    const unitPrice = Number(product.price);
    const lineTotal = Number((unitPrice * nextQuantity).toFixed(2));

    if (existing) {
      existing.quantity = nextQuantity;
      existing.unitPrice = unitPrice;
      existing.lineTotal = lineTotal;
      existing.inStock = true;
      existing.stock = FRONTEND_ONLY_STOCK;
    } else {
      cart.items.push({
        id: frontendItemId++,
        productId: product.id,
        productSlug: product.slug,
        variantId: expectedVariantId,
        name: product.name,
        variantName: FRONTEND_ONLY_VARIANT_TITLE,
        image: product.image,
        quantity: nextQuantity,
        unitPrice,
        lineTotal,
        stock: FRONTEND_ONLY_STOCK,
        inStock: true
      });
    }

    return buildFrontendCartSummary(cart);
  }

  const quantity = sanitizeQuantity(input.quantity);
  const variant = await resolveVariantForCart(input.productId, input.variantId);
  const unitPrice = toNumber(variant.price);

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId: input.cartId,
        variantId: input.variantId
      }
    }
  });

  const nextQuantity = (existing?.quantity ?? 0) + quantity;
  if (nextQuantity > variant.stock) {
    throw new CartError(409, "INSUFFICIENT_STOCK", "Requested quantity exceeds available stock.");
  }

  const lineTotal = Number((unitPrice * nextQuantity).toFixed(2));

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: nextQuantity,
        unitPrice,
        lineTotal
      }
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: input.cartId,
        productId: input.productId,
        variantId: input.variantId,
        quantity: nextQuantity,
        unitPrice,
        lineTotal,
        productName: variant.product.name,
        productImage: variant.product.images[0]?.url ?? null,
        variantName: variant.title
      }
    });
  }

  return loadCartSummary(input.cartId);
}

export async function updateCartItemQuantity(input: {
  cartId: number;
  itemId: number;
  quantity: number;
}) {
  if (isFrontendOnly()) {
    const cart = getFrontendCartById(input.cartId);
    if (!cart) {
      throw new CartError(404, "CART_NOT_FOUND", "Cart not found.");
    }

    const item = cart.items.find((entry) => entry.id === input.itemId);
    if (!item) {
      throw new CartError(404, "ITEM_NOT_FOUND", "Cart item not found.");
    }

    if (input.quantity <= 0) {
      cart.items = cart.items.filter((entry) => entry.id !== input.itemId);
      return buildFrontendCartSummary(cart);
    }

    const quantity = Math.floor(input.quantity);
    if (quantity > FRONTEND_ONLY_STOCK) {
      throw new CartError(409, "INSUFFICIENT_STOCK", "Requested quantity exceeds available stock.");
    }

    item.quantity = quantity;
    item.lineTotal = Number((item.unitPrice * quantity).toFixed(2));
    item.stock = FRONTEND_ONLY_STOCK;
    item.inStock = true;
    return buildFrontendCartSummary(cart);
  }

  const item = await prisma.cartItem.findFirst({
    where: {
      id: input.itemId,
      cartId: input.cartId
    },
    include: {
      variant: true
    }
  });

  if (!item) {
    throw new CartError(404, "ITEM_NOT_FOUND", "Cart item not found.");
  }

  if (input.quantity <= 0) {
    await prisma.cartItem.delete({
      where: { id: item.id }
    });
    return loadCartSummary(input.cartId);
  }

  const quantity = Math.floor(input.quantity);
  if (quantity > item.variant.stock) {
    throw new CartError(409, "INSUFFICIENT_STOCK", "Requested quantity exceeds available stock.");
  }

  const unitPrice = toNumber(item.unitPrice);
  const lineTotal = Number((unitPrice * quantity).toFixed(2));

  await prisma.cartItem.update({
    where: { id: item.id },
    data: {
      quantity,
      lineTotal
    }
  });

  return loadCartSummary(input.cartId);
}

export async function removeCartItem(input: { cartId: number; itemId: number }) {
  if (isFrontendOnly()) {
    const cart = getFrontendCartById(input.cartId);
    if (!cart) {
      throw new CartError(404, "CART_NOT_FOUND", "Cart not found.");
    }

    const previousLength = cart.items.length;
    cart.items = cart.items.filter((entry) => entry.id !== input.itemId);
    if (cart.items.length === previousLength) {
      throw new CartError(404, "ITEM_NOT_FOUND", "Cart item not found.");
    }
    return buildFrontendCartSummary(cart);
  }

  const removed = await prisma.cartItem.deleteMany({
    where: {
      id: input.itemId,
      cartId: input.cartId
    }
  });

  if (removed.count === 0) {
    throw new CartError(404, "ITEM_NOT_FOUND", "Cart item not found.");
  }

  return loadCartSummary(input.cartId);
}

export async function clearCart(cartId: number) {
  if (isFrontendOnly()) {
    const cart = getFrontendCartById(cartId);
    if (!cart) {
      throw new CartError(404, "CART_NOT_FOUND", "Cart not found.");
    }
    cart.items = [];
    return buildFrontendCartSummary(cart);
  }

  await prisma.cartItem.deleteMany({
    where: { cartId }
  });

  await prisma.cart.update({
    where: { id: cartId },
    data: {
      subtotal: 0,
      itemCount: 0
    }
  });

  return loadCartSummary(cartId);
}

export function getFrontendCartSummaryById(cartId: number) {
  if (!isFrontendOnly()) {
    return null;
  }
  const cart = getFrontendCartById(cartId);
  return cart ? buildFrontendCartSummary(cart) : null;
}

export function clearFrontendCartById(cartId: number) {
  if (!isFrontendOnly()) {
    return null;
  }
  const cart = getFrontendCartById(cartId);
  if (!cart) {
    return null;
  }
  cart.items = [];
  return buildFrontendCartSummary(cart);
}
