"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import type { ProductVariantSummary } from "@/lib/types";

type StickyCartBarProps = {
  productId: number;
  name: string;
  image: string | null;
  variants: ProductVariantSummary[];
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

export default function StickyCartBar({ productId, name, image, variants }: StickyCartBarProps) {
  const { addItem, openCart, mutating } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(variants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? null,
    [selectedVariantId, variants]
  );

  const inStock = (selectedVariant?.stock ?? 0) > 0;

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > 520);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed right-0 bottom-0 left-0 z-50 border-t border-gray-300 bg-white shadow-lg transition duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-6 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-14 w-14 rounded-none border border-gray-300 object-cover"
            />
          ) : (
            <div className="h-14 w-14 animate-pulse rounded-none border border-gray-300 bg-gray-100" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">{name}</p>
            <p className="text-sm text-gray-600">{currency.format(selectedVariant?.price ?? 0)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedVariantId ?? ""}
            onChange={(event) => {
              const nextId = Number(event.target.value);
              setSelectedVariantId(Number.isFinite(nextId) ? nextId : null);
              setQuantity(1);
            }}
            className="h-10 rounded-none border border-gray-300 px-3 text-sm text-gray-700 outline-none transition focus:border-gray-500"
          >
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.title} ({variant.stock} left)
              </option>
            ))}
          </select>

          <div className="inline-flex h-10 items-center overflow-hidden rounded-none border border-gray-300">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="h-full px-3 text-base text-gray-700 transition hover:bg-gray-100"
            >
              -
            </button>
            <span className="inline-flex h-full min-w-10 items-center justify-center border-x border-gray-300 text-sm text-gray-900">
              {quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={() => {
                const limit = Math.max(selectedVariant?.stock ?? 1, 1);
                setQuantity((prev) => Math.min(limit, prev + 1));
              }}
              className="h-full px-3 text-base text-gray-700 transition hover:bg-gray-100"
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
            className="h-10 rounded-none border border-black bg-black px-6 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {inStock ? "Add to cart" : "Out of stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
