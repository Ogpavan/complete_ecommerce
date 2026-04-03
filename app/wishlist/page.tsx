"use client";

import Link from "next/link";
import Navbar from "@/components/home/Navbar";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

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

export default function WishlistPage() {
  const { items, loading, removeItem, clearWishlist } = useWishlist();
  const { addItem, openCart, mutating } = useCart();

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="mx-auto max-w-[1320px] px-6 py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Saved products</p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-900">Your wishlist</h1>
          </div>
          <Link href="/products" className="text-sm font-medium text-gray-700 transition hover:text-black">
            Continue shopping
          </Link>
        </div>

        {loading ? (
          <div className="border border-gray-200 px-6 py-12 text-center">
            <p className="text-lg font-medium text-gray-900">Loading your wishlist...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="border border-gray-200 px-6 py-14 text-center">
            <p className="text-lg font-medium text-gray-900">Your wishlist is empty.</p>
            <p className="mt-2 text-sm text-gray-600">Save items you like to revisit them quickly.</p>
            <Link
              href="/products"
              className="mt-6 inline-flex border border-black px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-black hover:text-white"
            >
              Explore products
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                {items.length} item{items.length === 1 ? "" : "s"} saved
              </p>
              <button
                type="button"
                onClick={clearWishlist}
                className="text-sm font-medium text-gray-600 transition duration-200 hover:text-black"
              >
                Clear wishlist
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => {
                const image = normalizeImageUrl(item.images[0] ?? item.image);
                const canAddToCart = Boolean(item.defaultVariantId) && item.inStock;

                return (
                  <article key={item.id} className="overflow-hidden border border-gray-200">
                    <Link href={`/product/${encodeURIComponent(item.slug)}`} className="block aspect-[4/5] overflow-hidden">
                      {image ? (
                        <img
                          src={image}
                          alt={item.name}
                          className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[#eef1ec] text-xs font-medium tracking-wide text-gray-500 uppercase">
                          No image
                        </div>
                      )}
                    </Link>

                    <div className="space-y-2 p-4">
                      <p className="text-xs tracking-wide text-gray-500 uppercase">{item.category}</p>
                      <Link
                        href={`/product/${encodeURIComponent(item.slug)}`}
                        className="block text-base font-medium text-gray-900"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm font-semibold text-gray-900">{priceFormatter.format(item.price)}</p>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="h-10 flex-1 border border-gray-300 text-sm font-medium text-gray-700 transition duration-200 hover:-translate-y-0.5 hover:bg-gray-100 active:translate-y-0"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          disabled={!canAddToCart || mutating}
                          onClick={async () => {
                            if (!item.defaultVariantId) {
                              return;
                            }

                            try {
                              await addItem({
                                productId: item.id,
                                variantId: item.defaultVariantId,
                                quantity: 1
                              });
                              openCart();
                            } catch {
                              // error state is handled in cart context
                            }
                          }}
                          className="h-10 flex-1 border border-black bg-black text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-white disabled:text-gray-400 disabled:hover:translate-y-0"
                        >
                          {canAddToCart ? "Add to cart" : "Out of stock"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
