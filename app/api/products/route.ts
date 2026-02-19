import { NextRequest, NextResponse } from "next/server";
import { getProductsPayload } from "@/lib/server/catalog";
import type { ProductsSort } from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toNumber(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}

function toSort(value: string | null): ProductsSort | undefined {
  const allowed: ProductsSort[] = ["newest", "name-asc", "name-desc", "price-asc", "price-desc"];
  if (!value) {
    return undefined;
  }
  return allowed.includes(value as ProductsSort) ? (value as ProductsSort) : undefined;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = toNumber(searchParams.get("page"), 1);
  const pageSize = toNumber(searchParams.get("pageSize") ?? searchParams.get("limit"), 12);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const inStockOnly = ["1", "true", "yes"].includes(
    String(searchParams.get("inStock") ?? "").toLowerCase()
  );
  const sort = toSort(searchParams.get("sort"));

  const payload = await getProductsPayload({
    page,
    pageSize,
    category,
    search,
    inStockOnly,
    sort
  });

  return NextResponse.json(payload);
}
