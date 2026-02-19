"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { totalQuantity, openCart } = useCart();

  return (
    <nav className="sticky top-0 z-50 border-b border-black/10 bg-sand/90 backdrop-blur">
      <div className="container-pad flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Coastline
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Button asChild variant="ghost" className="px-3">
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="ghost" className="px-3">
            <Link href="/products">Products</Link>
          </Button>
          <Button asChild variant="ghost" className="px-3">
            <Link href="/blog">Blog</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={openCart}
            aria-label="Open cart"
          >
            <span className="relative inline-flex items-center">
              <span className="sr-only">Cart</span>
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 7H7" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
              {totalQuantity > 0 && (
                <Badge className="absolute -top-2 -right-2 border-0 bg-ocean text-white">
                  {totalQuantity}
                </Badge>
              )}
            </span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
