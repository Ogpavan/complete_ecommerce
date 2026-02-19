"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import QuantitySelector from "@/components/QuantitySelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CartItem({
  itemId,
  slug,
  title,
  price,
  image,
  quantity,
  variant,
  stock
}: {
  itemId: number;
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  variant: string;
  stock: number;
}) {
  const { increaseQty, decreaseQty, removeItem, mutating } = useCart();

  return (
    <Card className="border-black/10 bg-white">
      <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
        <div className="h-28 w-28 overflow-hidden rounded-2xl bg-black/5">
          <img src={image} alt={title} className="h-full w-full object-cover" />
        </div>
        <div className="flex-1">
          <Link href={`/product/${encodeURIComponent(slug)}`} className="text-base font-semibold hover:underline">
            {title}
          </Link>
          <p className="mt-1 text-sm text-black/60">${price.toFixed(2)}</p>
          <p className="mt-1 text-xs text-black/40">{variant}</p>
          <p className="mt-1 text-xs text-black/40">{stock} left</p>
          <div className="mt-3 flex items-center gap-3">
            <QuantitySelector
              value={quantity}
              onDecrease={() => {
                void decreaseQty(itemId).catch(() => {
                  // error state is handled in cart context
                });
              }}
              onIncrease={() => {
                if (quantity >= stock) {
                  return;
                }
                void increaseQty(itemId).catch(() => {
                  // error state is handled in cart context
                });
              }}
              size="sm"
            />
            <Button
              variant="ghost"
              size="sm"
              disabled={mutating}
              className="h-7 px-2 text-xs uppercase tracking-wide text-black/50 hover:text-black"
              onClick={() => {
                void removeItem(itemId).catch(() => {
                  // error state is handled in cart context
                });
              }}
            >
              Remove
            </Button>
          </div>
        </div>
        <div className="text-right text-sm font-semibold text-ocean">${(price * quantity).toFixed(2)}</div>
      </CardContent>
    </Card>
  );
}
