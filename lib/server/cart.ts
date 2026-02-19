import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CartSummary } from "@/lib/types";

export const CART_COOKIE_NAME = "cart_session";

const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

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
