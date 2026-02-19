import { NextResponse } from "next/server";
import { getCategoriesSummary } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const payload = await getCategoriesSummary();
  return NextResponse.json(payload);
}
