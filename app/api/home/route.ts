import { NextResponse } from "next/server";
import { getHomePayload } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const payload = await getHomePayload();
  return NextResponse.json(payload);
}
