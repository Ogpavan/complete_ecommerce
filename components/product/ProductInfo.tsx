"use client";

import { Heart, Share2, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import type { ProductCardSummary, ProductVariantSummary } from "@/lib/types";

type ProductInfoProps = {
  productId: number;
  name: string;
  categoryName: string;
  variants: ProductVariantSummary[];
  wishlistItem: ProductCardSummary;
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

export default function ProductInfo({
  productId,
  name,
  categoryName,
  variants,
  wishlistItem
}: ProductInfoProps) {
  const { addItem, openCart, mutating } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? null,
    [selectedVariantId, variants]
  );

  const inStock = (selectedVariant?.stock ?? 0) > 0;
  const maxQuantity = Math.max(selectedVariant?.stock ?? 1, 1);
  const price = selectedVariant?.price ?? 0;
  const inWishlist = isInWishlist(wishlistItem.id);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-lg font-medium text-gray-900">{currency.format(price)}</p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">{name}</h1>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700">Variant</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {variants.map((variant) => {
            const isSelected = selectedVariantId === variant.id;
            const variantInStock = variant.stock > 0;
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => {
                  setSelectedVariantId(variant.id);
                  setQuantity(1);
                }}
                className={`rounded-none border px-3 py-2 text-sm transition ${
                  isSelected
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                } ${!variantInStock ? "opacity-50" : ""}`}
              >
                {variant.title}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-600">
          {selectedVariant ? `${selectedVariant.stock} left in stock` : "No variant available"}
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-gray-700">Quantity</p>
        <div className="flex items-stretch gap-3">
          <div className="inline-flex h-12 items-center overflow-hidden rounded-none border border-gray-300">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="h-full px-4 text-lg text-gray-700 transition hover:bg-gray-100"
            >
              -
            </button>
            <span className="inline-flex h-full min-w-14 items-center justify-center border-x border-gray-300 text-sm text-gray-900">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => setQuantity((prev) => Math.min(maxQuantity, prev + 1))}
              className="h-full px-4 text-lg text-gray-700 transition hover:bg-gray-100"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={!selectedVariant || !inStock || mutating}
            onClick={async () => {
              if (!selectedVariant) {
                return;
              }

              try {
                await addItem({
                  productId,
                  variantId: selectedVariant.id,
                  quantity
                });
                openCart();
              } catch {
                // error state is handled in cart context
              }
            }}
            className="h-12 flex-1 rounded-none border border-gray-300 px-6 text-sm font-medium text-gray-900 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          >
            {inStock ? "Add to cart" : "Out of stock"}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          disabled
          className="h-12 w-full rounded-none border border-black bg-black text-sm font-medium text-white opacity-50"
        >
          Buy it now
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-5 text-sm text-gray-600">
        <button type="button" className="inline-flex items-center gap-2 transition hover:text-gray-900">
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
          Compare
        </button>
        <button
          type="button"
          onClick={() => toggleItem(wishlistItem)}
          className={`inline-flex items-center gap-2 transition hover:text-gray-900 ${
            inWishlist ? "text-gray-900" : ""
          }`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} strokeWidth={1.5} />
          {inWishlist ? "Saved to wishlist" : "Add to wishlist"}
        </button>
        <button type="button" className="inline-flex items-center gap-2 transition hover:text-gray-900">
          <Share2 className="h-4 w-4" strokeWidth={1.5} />
          Share
        </button>
      </div>

      <div className="space-y-2 border-t border-gray-300 pt-6 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-800">Estimated Delivery:</span> 3-6 business days
        </p>
        <p>
          <span className="font-medium text-gray-800">Free Shipping:</span> On all orders over $75
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-gray-300 pb-6">
        {["VISA", "MC", "AMEX", "PAYPAL", "APPLE PAY"].map((method) => (
          <span
            key={method}
            className="inline-flex h-8 items-center rounded-none border border-gray-300 px-3 text-xs font-medium tracking-wide text-gray-700"
          >
            {method}
          </span>
        ))}
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-800">Category:</span> {categoryName}
        </p>
        <p>
          <span className="font-medium text-gray-800">SKU:</span> {selectedVariant?.sku ?? "N/A"}
        </p>
      </div>
    </div>
  );
}
