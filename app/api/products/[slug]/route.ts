import { NextRequest, NextResponse } from "next/server";
import { getProductDetailPayload } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const payload = await getProductDetailPayload(slug);

  if (!payload) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json(payload);
}
