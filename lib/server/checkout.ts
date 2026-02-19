import { prisma } from "@/lib/prisma";
import { CartError } from "@/lib/server/cart";
import type { CheckoutInput, OrderSummary } from "@/lib/types";

const TAX_RATE = 0.1;
const FREE_SHIPPING_THRESHOLD = 75;
const STANDARD_SHIPPING = 8;

function toNumber(value: unknown) {
  return Number(value ?? 0);
}

function normalizeString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizePhone(value: unknown) {
  const compact = normalizeString(value).replace(/\s+/g, "");
  if (compact.startsWith("+")) {
    return `+${compact.slice(1).replace(/\D/g, "")}`;
  }
  return compact.replace(/\D/g, "");
}

function splitName(fullName: string) {
  const normalized = normalizeString(fullName).replace(/\s+/g, " ");
  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...rest] = normalized.split(" ");
  return {
    firstName: firstName ?? "",
    lastName: rest.join(" ")
  };
}

function isValidUpiId(value: string) {
  return /^[A-Za-z0-9._-]{2,}@[A-Za-z][A-Za-z0-9.-]{1,}$/.test(value);
}

export function validateCheckoutInput(input: Partial<CheckoutInput>): CheckoutInput {
  const fullNameInput = normalizeString(input.fullName || `${input.firstName ?? ""} ${input.lastName ?? ""}`);
  const phone = normalizePhone(input.phone);
  const { firstName: splitFirstName, lastName: splitLastName } = splitName(fullNameInput);
  const firstName = normalizeString(input.firstName) || splitFirstName || "Guest";
  const lastName = normalizeString(input.lastName) || splitLastName || "Customer";

  if (fullNameInput.length < 2) {
    throw new CartError(400, "VALIDATION_ERROR", "Name is required.");
  }

  if (phone.length < 10) {
    throw new CartError(400, "VALIDATION_ERROR", "Phone number is required.");
  }

  const shippingMethod = normalizeString(input.shippingMethod || "standard").toLowerCase();
  const normalizedShippingMethod =
    shippingMethod === "express" || shippingMethod === "standard" ? shippingMethod : "standard";

  const paymentMethod = normalizeString(input.paymentMethod || "upi").toLowerCase();
  if (paymentMethod !== "upi" && paymentMethod !== "card") {
    throw new CartError(400, "VALIDATION_ERROR", "Invalid payment method.");
  }

  const sanitizedCardNumber = normalizeString(input.cardNumber).replace(/\D/g, "");
  const sanitizedCardCvv = normalizeString(input.cardCvv).replace(/\D/g, "");
  const normalizedCardExpiry = normalizeString(input.cardExpiry);
  const normalizedCardName = normalizeString(input.cardName) || fullNameInput;
  const normalizedUpiId = normalizeString(input.upiId).toLowerCase();

  if (paymentMethod === "upi") {
    if (!normalizedUpiId || !isValidUpiId(normalizedUpiId)) {
      throw new CartError(400, "VALIDATION_ERROR", "Enter a valid UPI ID.");
    }
  }

  if (paymentMethod === "card") {
    if (sanitizedCardNumber.length < 12 || sanitizedCardNumber.length > 19) {
      throw new CartError(400, "VALIDATION_ERROR", "Enter a valid card number.");
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(normalizedCardExpiry)) {
      throw new CartError(400, "VALIDATION_ERROR", "Enter a valid card expiry in MM/YY format.");
    }

    if (sanitizedCardCvv.length < 3 || sanitizedCardCvv.length > 4) {
      throw new CartError(400, "VALIDATION_ERROR", "Enter a valid card CVV.");
    }

    if (normalizedCardName.length < 2) {
      throw new CartError(400, "VALIDATION_ERROR", "Name on card is required.");
    }
  }

  const emailInput = normalizeString(input.email);
  const guestEmail = `guest-${phone.replace(/\D/g, "")}@quickcheckout.local`;
  const email = emailInput.includes("@") ? emailInput : guestEmail;

  const payload: CheckoutInput = {
    fullName: fullNameInput,
    email,
    phone,
    firstName,
    lastName,
    address1: normalizeString(input.address1) || "Address will be confirmed by phone",
    address2: normalizeString(input.address2),
    city: normalizeString(input.city) || "N/A",
    state: normalizeString(input.state),
    postalCode: normalizeString(input.postalCode) || "000000",
    country: normalizeString(input.country || "India"),
    shippingMethod: normalizedShippingMethod,
    paymentMethod: paymentMethod as "upi" | "card",
    upiId: paymentMethod === "upi" ? normalizedUpiId : "",
    cardNumber: paymentMethod === "card" ? sanitizedCardNumber : "",
    cardExpiry: paymentMethod === "card" ? normalizedCardExpiry : "",
    cardCvv: paymentMethod === "card" ? sanitizedCardCvv : "",
    cardName: paymentMethod === "card" ? normalizedCardName : "",
    notes: normalizeString(input.notes)
  };

  return payload;
}

function createOrderNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${date}-${random}`;
}

function mapOrderSummary(order: {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  currency: string;
  subtotal: unknown;
  tax: unknown;
  shipping: unknown;
  total: unknown;
  email: string;
  customerFirstName: string;
  customerLastName: string;
  shippingAddress1: string;
  shippingAddress2: string | null;
  shippingCity: string;
  shippingState: string | null;
  shippingPostalCode: string;
  shippingCountry: string;
  shippingMethod: string;
  createdAt: Date;
  items: Array<{
    id: number;
    productId: number;
    variantId: number;
    productName: string;
    variantName: string;
    sku: string;
    quantity: number;
    unitPrice: unknown;
    lineTotal: unknown;
    productImage: string | null;
  }>;
}): OrderSummary {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    currency: order.currency,
    subtotal: toNumber(order.subtotal),
    tax: toNumber(order.tax),
    shipping: toNumber(order.shipping),
    total: toNumber(order.total),
    email: order.email,
    customerFirstName: order.customerFirstName,
    customerLastName: order.customerLastName,
    shippingAddress1: order.shippingAddress1,
    shippingAddress2: order.shippingAddress2 ?? null,
    shippingCity: order.shippingCity,
    shippingState: order.shippingState ?? null,
    shippingPostalCode: order.shippingPostalCode,
    shippingCountry: order.shippingCountry,
    shippingMethod: order.shippingMethod,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.productName,
      variantName: item.variantName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      lineTotal: toNumber(item.lineTotal),
      image: item.productImage ?? null
    }))
  };
}

export async function createOrderFromCart(cartId: number, payload: CheckoutInput) {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
          variant: true
        }
      }
    }
  });

  if (!cart) {
    throw new CartError(404, "CART_NOT_FOUND", "Cart not found.");
  }

  if (cart.items.length === 0) {
    throw new CartError(400, "EMPTY_CART", "Your cart is empty.");
  }

  for (const item of cart.items) {
    if (!item.product.isActive || !item.variant.isActive) {
      throw new CartError(409, "PRODUCT_UNAVAILABLE", `${item.productName} is no longer available.`);
    }

    if (item.variant.stock < item.quantity) {
      throw new CartError(409, "INSUFFICIENT_STOCK", `${item.productName} is low on stock.`);
    }
  }

  const subtotal = Number(
    cart.items.reduce((sum, item) => sum + toNumber(item.lineTotal), 0).toFixed(2)
  );
  const shipping =
    payload.shippingMethod.toLowerCase() === "express"
      ? 15
      : subtotal >= FREE_SHIPPING_THRESHOLD
        ? 0
        : STANDARD_SHIPPING;
  const tax = Number((subtotal * TAX_RATE).toFixed(2));
  const total = Number((subtotal + shipping + tax).toFixed(2));
  const paymentDetails =
    payload.paymentMethod === "card"
      ? `Payment: CARD (****${(payload.cardNumber || "").slice(-4)})`
      : `Payment: UPI (${payload.upiId || "N/A"})`;
  const mergedNotes = [paymentDetails, payload.notes].filter(Boolean).join(" | ");

  const order = await prisma.$transaction(async (tx) => {
    for (const item of cart.items) {
      const latestVariant = await tx.productVariant.findUnique({
        where: { id: item.variantId }
      });

      if (!latestVariant || !latestVariant.isActive || latestVariant.stock < item.quantity) {
        throw new CartError(409, "INSUFFICIENT_STOCK", `${item.productName} is low on stock.`);
      }
    }

    const created = await tx.order.create({
      data: {
        orderNumber: createOrderNumber(),
        cartId: cart.id,
        status: "PLACED",
        paymentStatus: "PAID",
        fulfillmentStatus: "UNFULFILLED",
        currency: cart.currency,
        subtotal,
        tax,
        shipping,
        total,
        email: payload.email,
        phone: payload.phone || null,
        customerFirstName: payload.firstName,
        customerLastName: payload.lastName,
        shippingMethod: payload.shippingMethod || "standard",
        shippingAddress1: payload.address1,
        shippingAddress2: payload.address2 || null,
        shippingCity: payload.city,
        shippingState: payload.state || null,
        shippingPostalCode: payload.postalCode,
        shippingCountry: payload.country,
        notes: mergedNotes || null,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.lineTotal,
            productName: item.productName,
            variantName: item.variantName,
            sku: item.variant.sku,
            productImage: item.productImage ?? null
          }))
        }
      },
      include: {
        items: {
          orderBy: { id: "asc" }
        }
      }
    });

    for (const item of cart.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
    }

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    await tx.cart.update({
      where: { id: cart.id },
      data: {
        subtotal: 0,
        itemCount: 0
      }
    });

    return created;
  });

  return mapOrderSummary(order);
}

export async function getOrderByNumber(orderNumber: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        orderBy: { id: "asc" }
      }
    }
  });

  if (!order) {
    return null;
  }

  return mapOrderSummary(order);
}
