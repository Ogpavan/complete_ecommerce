import { NextRequest, NextResponse } from "next/server";
import {
  CartError,
  attachCartCookie,
  clearCart,
  ensureCartFromRequest
} from "@/lib/server/cart";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function handleError(error: unknown) {
  if (error instanceof CartError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json(
    { error: "Unexpected cart error." },
    { status: 500 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const cart = await ensureCartFromRequest(request);
    const response = NextResponse.json(cart.summary);
    if (cart.shouldSetCookie) {
      attachCartCookie(response, cart.sessionToken);
    }
    return response;
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cart = await ensureCartFromRequest(request);
    const summary = await clearCart(cart.cartId);
    const response = NextResponse.json(summary);
    if (cart.shouldSetCookie) {
      attachCartCookie(response, cart.sessionToken);
    }
    return response;
  } catch (error) {
    return handleError(error);
  }
}
