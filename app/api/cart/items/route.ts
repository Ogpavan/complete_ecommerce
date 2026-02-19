import { NextRequest, NextResponse } from "next/server";
import {
  CartError,
  addItemToCart,
  attachCartCookie,
  ensureCartFromRequest
} from "@/lib/server/cart";
import type { AddCartItemInput } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function handleError(error: unknown) {
  if (error instanceof CartError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ error: "Unexpected cart error." }, { status: 500 });
}

function toPositiveInt(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as AddCartItemInput;
    const productId = toPositiveInt(payload.productId);
    const variantId = toPositiveInt(payload.variantId);
    const quantity = payload.quantity ? toPositiveInt(payload.quantity) : 1;

    if (!productId) {
      return NextResponse.json(
        { error: "Invalid productId.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    if (!variantId) {
      return NextResponse.json(
        { error: "Invalid variantId.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    if (!quantity) {
      return NextResponse.json(
        { error: "Invalid quantity.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const cart = await ensureCartFromRequest(request);
    const summary = await addItemToCart({
      cartId: cart.cartId,
      productId,
      variantId,
      quantity
    });

    const response = NextResponse.json(summary);
    if (cart.shouldSetCookie) {
      attachCartCookie(response, cart.sessionToken);
    }

    return response;
  } catch (error) {
    return handleError(error);
  }
}
