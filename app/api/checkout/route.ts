import { NextRequest, NextResponse } from "next/server";
import { CartError, attachCartCookie, ensureCartFromRequest } from "@/lib/server/cart";
import { createOrderFromCart, validateCheckoutInput } from "@/lib/server/checkout";
import type { CheckoutInput } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function handleError(error: unknown) {
  if (error instanceof CartError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ error: "Unexpected checkout error." }, { status: 500 });
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Partial<CheckoutInput>;
    const input = validateCheckoutInput(payload);

    const cart = await ensureCartFromRequest(request);
    const order = await createOrderFromCart(cart.cartId, input);

    const response = NextResponse.json(
      {
        message: "Order placed successfully.",
        order
      },
      { status: 201 }
    );

    if (cart.shouldSetCookie) {
      attachCartCookie(response, cart.sessionToken);
    }

    return response;
  } catch (error) {
    return handleError(error);
  }
}
