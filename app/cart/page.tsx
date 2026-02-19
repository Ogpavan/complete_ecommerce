"use client";

import Link from "next/link";
import CartItem from "@/components/CartItem";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { items, subtotal, loading, error } = useCart();
  const subtotalAmount = subtotal();
  const shipping = subtotalAmount > 75 ? 0 : 8;
  const total = subtotalAmount + shipping;

  return (
    <div className="container-pad py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your cart</h1>
        <Link href="/products" className="text-sm font-semibold text-ocean hover:underline">
          Continue shopping
        </Link>
      </div>

      {loading ? (
        <Card className="mt-12 border-black/10 bg-white">
          <CardContent className="p-10 text-center">
            <p className="text-lg font-semibold">Loading your cart...</p>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="mt-12 border-black/10 bg-white">
          <CardContent className="p-10 text-center">
            <p className="text-lg font-semibold">Your cart is empty.</p>
            <p className="mt-2 text-sm text-black/60">Browse the collection to add items.</p>
            <Button asChild className="mt-6">
              <Link href="/products">Shop products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItem
                key={item.id}
                itemId={item.id}
                slug={item.productSlug}
                title={item.name}
                price={item.unitPrice}
                image={item.image}
                quantity={item.quantity}
                variant={item.variantName}
                stock={item.stock}
              />
            ))}
          </div>
          <aside>
            <Card className="h-fit border-black/10 bg-white">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold">Order summary</h2>
                <div className="mt-4 space-y-3 text-sm text-black/70">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>${subtotalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between text-base font-semibold text-black">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
                <Button asChild className="mt-6 w-full">
                  <Link href="/signin?next=%2Fcheckout">Checkout</Link>
                </Button>
                <p className="mt-3 text-xs text-black/50">
                  Taxes and discounts calculated at checkout.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}
