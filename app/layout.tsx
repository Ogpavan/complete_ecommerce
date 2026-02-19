import type { Metadata } from "next";
import "./globals.css";
import ConditionalFooter from "@/components/layout/ConditionalFooter";
import CartDrawer from "../components/cart/CartDrawer";
import { CartProvider } from "../context/CartContext";
import { QuickAuthProvider } from "../context/QuickAuthContext";
import { WishlistProvider } from "../context/WishlistContext";

export const metadata: Metadata = {
  title: "Coastline | Modern Essentials",
  description: "Minimal ecommerce MVP built with Next.js."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <QuickAuthProvider>
          <WishlistProvider>
            <CartProvider>
              <main>{children}</main>
              <ConditionalFooter />
              <CartDrawer />
            </CartProvider>
          </WishlistProvider>
        </QuickAuthProvider>
      </body>
    </html>
  );
}
