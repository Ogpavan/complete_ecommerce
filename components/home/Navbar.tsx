"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useQuickAuth } from "@/context/QuickAuthContext";
import { useWishlist } from "@/context/WishlistContext";

const navLinks = [
  { label: "HOME", href: "/" },
  { label: "PRODUCTS", href: "/products" },
  { label: "BLOG", href: "/blog" },
  { label: "ADMIN", href: "/admin" }
];

export default function Navbar() {
  const { totalQuantity, openCart } = useCart();
  const { profile } = useQuickAuth();
  const { totalItems } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="relative mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-6">
        <div className="flex items-center">
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

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-2xl font-semibold tracking-[0.25em] text-gray-900"
        >
          GLOWING
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <button type="button" aria-label="Search" className="text-gray-800 transition hover:text-black">
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <Link href="/signin?next=/checkout" aria-label="Account" className="text-gray-800 transition hover:text-black">
            {profile ? (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 text-[10px] font-semibold uppercase">
                {profile.name.slice(0, 1)}
              </span>
            ) : (
              <User className="h-5 w-5" strokeWidth={1.5} />
            )}
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" className="relative text-gray-800 transition hover:text-black">
            <Heart className="h-5 w-5" strokeWidth={1.5} />
            {totalItems > 0 ? (
              <span className="absolute -top-2 -right-2 rounded-none bg-black px-1.5 text-[10px] text-white">
                {totalItems}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label="Cart"
            onClick={openCart}
            className="relative text-gray-800 transition hover:text-black"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {totalQuantity > 0 ? (
              <span className="absolute -top-2 -right-2 rounded-none bg-black px-1.5 text-[10px] text-white">
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
        <nav className="mx-auto flex max-w-[1320px] flex-col px-6 py-4">
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
    </header>
  );
}
