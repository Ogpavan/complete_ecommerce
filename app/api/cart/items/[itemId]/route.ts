import { NextRequest, NextResponse } from "next/server";
import {
  CartError,
  attachCartCookie,
  ensureCartFromRequest,
  removeCartItem,
  updateCartItemQuantity
} from "@/lib/server/cart";
import type { UpdateCartItemInput } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function handleError(error: unknown) {
  if (error instanceof CartError) {
    return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json({ error: "Unexpected cart error." }, { status: 500 });
}

function parseItemId(itemIdParam: string) {
  const itemId = Number(itemIdParam);
  if (!Number.isInteger(itemId) || itemId < 1) {
    return null;
  }
  return itemId;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId: itemIdParam } = await params;
    const itemId = parseItemId(itemIdParam);
    if (!itemId) {
      return NextResponse.json(
        { error: "Invalid itemId.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const payload = (await request.json()) as UpdateCartItemInput;
    const quantity = Number(payload.quantity);
    if (!Number.isInteger(quantity)) {
      return NextResponse.json(
        { error: "Invalid quantity.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const cart = await ensureCartFromRequest(request);
    const summary = await updateCartItemQuantity({
      cartId: cart.cartId,
      itemId,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId: itemIdParam } = await params;
    const itemId = parseItemId(itemIdParam);
    if (!itemId) {
      return NextResponse.json(
        { error: "Invalid itemId.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const cart = await ensureCartFromRequest(request);
    const summary = await removeCartItem({
      cartId: cart.cartId,
      itemId
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
