"use client";

import Link from "next/link";
import { FileText, TicketPercent, Truck, X } from "lucide-react";
import { useMemo } from "react";
import { useCart } from "@/context/CartContext";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const FREE_SHIPPING_THRESHOLD = 75;

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    increaseQty,
    decreaseQty,
    subtotal,
    mutating,
    error
  } = useCart();

  const subtotalAmount = subtotal();
  const progress = Math.min(100, (subtotalAmount / FREE_SHIPPING_THRESHOLD) * 100);
  const isEligible = subtotalAmount >= FREE_SHIPPING_THRESHOLD;

  const quickActions = useMemo(
    () => [
      { label: "Note", icon: FileText },
      { label: "Discount", icon: TicketPercent },
      { label: "Shipping", icon: Truck }
    ],
    []
  );

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        className={`absolute right-0 top-0 h-screen w-full bg-white shadow-2xl transition-transform duration-300 ease-out sm:w-[420px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-300 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
            <button
              type="button"
              aria-label="Close cart"
              onClick={closeCart}
              className="inline-flex h-8 w-8 items-center justify-center border border-gray-300 text-gray-700 transition hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="border-b border-gray-300 px-6 py-4">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-600">
              <span>{isEligible ? "You are eligible for free shipping" : "Free shipping over $75"}</span>
              <span>{priceFormatter.format(subtotalAmount)}</span>
            </div>
            <div className="h-2 w-full bg-gray-200">
              <div className="h-full bg-black transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {items.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-500">Your cart is empty.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 border-b border-gray-200 pb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-[70px] w-[70px] border border-gray-300 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${encodeURIComponent(item.productSlug)}`}
                        className="truncate text-sm font-medium text-gray-900 hover:underline"
                        onClick={closeCart}
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-gray-600">{priceFormatter.format(item.unitPrice)}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {item.variantName} • {item.stock} left
                      </p>

                      <div className="mt-3 inline-flex h-9 items-center border border-gray-300">
                        <button
                          type="button"
                          disabled={mutating}
                          aria-label="Decrease quantity"
                          onClick={async () => {
                            try {
                              await decreaseQty(item.id);
                            } catch {
                              // error state is handled in cart context
                            }
                          }}
                          className="h-full px-3 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="inline-flex h-full min-w-9 items-center justify-center border-x border-gray-300 text-xs text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={mutating || item.quantity >= item.stock}
                          aria-label="Increase quantity"
                          onClick={async () => {
                            try {
                              await increaseQty(item.id);
                            } catch {
                              // error state is handled in cart context
                            }
                          }}
                          className="h-full px-3 text-sm text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={mutating}
                      aria-label="Remove item"
                      onClick={async () => {
                        try {
                          await removeItem(item.id);
                        } catch {
                          // error state is handled in cart context
                        }
                      }}
                      className="h-7 w-7 text-gray-500 transition hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 border-t border-gray-300 bg-white p-6">
            <div className="mb-4 grid grid-cols-3 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  className="flex h-10 items-center justify-center gap-2 border border-gray-300 text-xs text-gray-700 transition hover:bg-gray-100"
                >
                  <action.icon className="h-3.5 w-3.5" />
                  {action.label}
                </button>
              ))}
            </div>

            <div className="mb-4 flex items-center justify-between text-sm text-gray-900">
              <span className="font-medium">Subtotal</span>
              <span className="font-semibold">{priceFormatter.format(subtotalAmount)}</span>
            </div>

            <Link
              href="/signin?next=%2Fcheckout"
              onClick={closeCart}
              className="inline-flex h-12 w-full items-center justify-center border border-black bg-black text-sm font-medium text-white transition hover:opacity-90"
            >
              Checkout
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
