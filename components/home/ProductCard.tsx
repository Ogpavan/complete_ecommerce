"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { ProductCardSummary } from "@/lib/types";

export type HomeProduct = ProductCardSummary;

type ProductCardProps = {
  product: HomeProduct;
  compact?: boolean;
  showQuickAdd?: boolean;
  animationDelayMs?: number;
};

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function normalizeImageUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export default function ProductCard({
  product,
  compact = false,
  showQuickAdd = false,
  animationDelayMs = 0
}: ProductCardProps) {
  const { addItem, openCart, mutating } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const primaryImage = normalizeImageUrl(product.images[0] ?? product.image);
  const secondaryImageCandidate = normalizeImageUrl(product.images[1]);
  const secondaryImage = secondaryImageCandidate && secondaryImageCandidate !== primaryImage
    ? secondaryImageCandidate
    : null;
  const canQuickAdd = Boolean(product.defaultVariantId) && product.inStock;
  const maxQuantity = Math.max(product.stock, 1);
  const inWishlist = isInWishlist(product.id);

  return (
    <article
      className="group animate-fade-up-in overflow-hidden border border-gray-200 bg-white transition duration-300 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none"
      style={{ animationDelay: `${animationDelayMs}ms` }}
    >
      <div className={`relative overflow-hidden ${compact ? "aspect-square" : "aspect-[4/5]"}`}>
        <Link href={`/product/${encodeURIComponent(product.slug)}`} className="block h-full w-full">
          {primaryImage ? (
            <>
              <img
                src={primaryImage}
                alt={product.name}
                className={`h-full w-full object-cover transition duration-500 ${
                  secondaryImage ? "group-hover:opacity-0" : "group-hover:scale-[1.03]"
                }`}
              />
              {secondaryImage ? (
                <img
                  src={secondaryImage}
                  alt={`${product.name} alternate`}
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
                />
              ) : null}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#eef1ec] text-xs font-medium tracking-wide text-gray-500 uppercase">
              No image
            </div>
          )}
        </Link>

        {product.badge ? (
          <span
            className="absolute left-3 top-3 bg-[#dce7dc] px-2 py-1 text-[10px] font-medium tracking-wide text-gray-800 uppercase"
          >
            {product.badge}
          </span>
        ) : null}
        <button
          type="button"
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleItem(product)}
          className={`absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center border bg-white/95 transition duration-300 hover:scale-105 active:scale-[0.98] ${
            inWishlist
              ? "border-rose-200 text-rose-500 hover:text-rose-600"
              : "border-gray-300 text-gray-700 hover:text-black"
          }`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} strokeWidth={1.8} />
        </button>

        {showQuickAdd ? (
          <div className="pointer-events-none absolute inset-x-4 bottom-4 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="pointer-events-auto flex items-stretch gap-2">
              <div className="inline-flex h-11 items-center border border-gray-300 bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={!canQuickAdd || mutating}
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="h-full px-3 text-sm text-gray-700 transition duration-300 hover:bg-gray-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  -
                </button>
                <span className="inline-flex h-full min-w-10 items-center justify-center border-x border-gray-300 text-xs font-medium text-gray-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={!canQuickAdd || mutating || quantity >= maxQuantity}
                  onClick={() => setQuantity((prev) => Math.min(maxQuantity, prev + 1))}
                  className="h-full px-3 text-sm text-gray-700 transition duration-300 hover:bg-gray-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={!canQuickAdd || mutating}
                onClick={async () => {
                  if (!product.defaultVariantId) {
                    return;
                  }

                  try {
                    await addItem({
                      productId: product.id,
                      variantId: product.defaultVariantId,
                      quantity
                    });
                    openCart();
                  } catch {
                    // error state is handled in cart context
                  }
                }}
                className="h-11 flex-1 border border-black bg-black px-3 text-sm font-medium text-white transition duration-300 hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-white disabled:text-gray-400"
              >
                {canQuickAdd ? "Add to cart" : "Out of stock"}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="space-y-2 p-4">
        <Link
          href={`/product/${encodeURIComponent(product.slug)}`}
          className="block text-sm font-medium text-gray-900"
        >
          {product.name}
        </Link>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-gray-900">{priceFormatter.format(product.price)}</span>
        </div>
      </div>
    </article>
  );
}
