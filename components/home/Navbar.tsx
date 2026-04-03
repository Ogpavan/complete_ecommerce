"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useQuickAuth } from "@/context/QuickAuthContext";
import { useWishlist } from "@/context/WishlistContext";
import type { ProductCardSummary } from "@/lib/types";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "PRODUCTS", href: "/products" },
  { label: "BLOG", href: "/blog" },
  { label: "ADMIN", href: "/admin" }
];

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

export default function Navbar() {
  const { totalQuantity, openCart } = useCart();
  const { profile } = useQuickAuth();
  const { totalItems } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<ProductCardSummary[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const query = searchQuery.trim();
    if (!query) {
      setResults([]);
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(
          `/api/products?search=${encodeURIComponent(query)}&page=1&pageSize=6&sort=newest`,
          { signal: controller.signal }
        );
        if (!response.ok) {
          throw new Error("Search failed");
        }
        const payload = (await response.json()) as { items?: ProductCardSummary[] };
        setResults(Array.isArray(payload.items) ? payload.items : []);
      } catch {
        if (!controller.signal.aborted) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [isSearchOpen, searchQuery]);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto grid h-[72px] max-w-[1320px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
        <div className="flex items-center justify-start">
          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navbar-links"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="inline-flex h-9 w-9 flex-col items-center justify-center gap-1.5 text-gray-800 transition hover:text-black lg:hidden"
          >
            {isMenuOpen ? <X className="h-5 w-5" strokeWidth={1.8} /> : <Menu className="h-5 w-5" strokeWidth={1.8} />}
          </button>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="inline-flex items-center gap-1 text-[13px] font-medium tracking-widest text-gray-800 uppercase transition hover:text-black"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link href="/" className="justify-self-center text-xl font-semibold tracking-[0.2em] text-gray-900 sm:text-2xl sm:tracking-[0.25em]">
          GLOWING
        </Link>

        <div className="flex items-center justify-end gap-3 sm:gap-4 lg:gap-6">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
            className="hidden text-gray-800 transition duration-300 hover:scale-105 hover:text-black active:scale-[0.98] sm:inline-flex"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <Link
            href="/signin?next=/checkout"
            aria-label="Account"
            className="text-gray-800 transition duration-300 hover:scale-105 hover:text-black active:scale-[0.98]"
          >
            {profile ? (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[10px] font-semibold uppercase">
                {profile.name.slice(0, 1)}
              </span>
            ) : (
              <User className="h-5 w-5" strokeWidth={1.5} />
            )}
          </Link>
          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className={`relative transition duration-300 hover:scale-105 active:scale-[0.98] ${
              totalItems > 0 ? "text-rose-500 hover:text-rose-600" : "text-gray-800 hover:text-black"
            }`}
          >
            <Heart className={`h-5 w-5 ${totalItems > 0 ? "fill-current" : ""}`} strokeWidth={1.5} />
            {totalItems > 0 ? (
              <span className="absolute -top-2 -right-2 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">
                {totalItems}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label="Cart"
            onClick={openCart}
            className="relative text-gray-800 transition duration-300 hover:scale-105 hover:text-black active:scale-[0.98]"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {totalQuantity > 0 ? (
              <span className="absolute -top-2 -right-2 rounded-full bg-black px-1.5 text-[10px] text-white">
                {totalQuantity}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <div
        id="mobile-navbar-links"
        className={`overflow-hidden border-t border-gray-200 transition-all duration-200 lg:hidden ${
          isMenuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-[1320px] flex-col px-4 py-4 sm:px-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="border-b border-gray-100 py-3 text-[13px] font-medium tracking-widest text-gray-800 uppercase transition hover:text-black last:border-b-0"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div
        className={`fixed inset-0 z-[70] transition-opacity duration-300 ${
          isSearchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button
          type="button"
          aria-label="Close search"
          onClick={() => setIsSearchOpen(false)}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        />

        <div
          className={`relative mx-auto mt-6 w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl transition-all duration-300 sm:mt-10 ${
            isSearchOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          }`}
        >
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 sm:px-5">
            <Search className="ml-1 h-4 w-4 text-gray-500" strokeWidth={1.8} />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-10 w-full rounded-full border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-gray-300 focus:bg-white placeholder:text-gray-400"
              autoFocus
            />
            <button
              type="button"
              aria-label="Close search panel"
              onClick={() => setIsSearchOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center text-gray-500 transition hover:text-gray-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-3 sm:p-4">
            {searchQuery.trim().length === 0 ? (
              <p className="px-2 py-6 text-sm text-gray-500">Start typing to search products.</p>
            ) : searchLoading ? (
              <p className="px-2 py-6 text-sm text-gray-500">Searching...</p>
            ) : results.length === 0 ? (
              <p className="px-2 py-6 text-sm text-gray-500">No products found.</p>
            ) : (
              <div className="space-y-2">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${encodeURIComponent(product.slug)}`}
                    onClick={() => setIsSearchOpen(false)}
                    className="flex items-center gap-3 border border-gray-100 p-2 transition duration-200 hover:border-gray-300 hover:bg-gray-50"
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-14 w-14 flex-none border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 flex-none items-center justify-center border border-gray-200 bg-gray-100 text-[10px] text-gray-500 uppercase">
                        No image
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{product.category}</p>
                    </div>

                    <p className="text-sm font-semibold text-gray-900">{priceFormatter.format(product.price)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
