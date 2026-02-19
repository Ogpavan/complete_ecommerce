"use client";

import Link from "next/link";
import { useState } from "react";
import CheckoutLayout from "@/components/checkout/CheckoutLayout";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useCart } from "@/context/CartContext";
import { useQuickAuth } from "@/context/QuickAuthContext";

type PaymentMethod = "upi" | "card";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

export default function CheckoutPage() {
  const { items, subtotal, refreshCart } = useCart();
  const { loading: authLoading, isSignedIn, profile } = useQuickAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const subtotalAmount = subtotal();
  const shipping =
    shippingMethod === "express" ? 15 : subtotalAmount >= 75 ? 0 : 8;
  const tax = subtotalAmount * 0.1;
  const total = subtotalAmount + tax + shipping;

  const mobileSummary = (
    <details className="overflow-hidden rounded-none border border-gray-200 bg-gray-50">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-gray-900">
        <span>Order summary</span>
        <span>{currency.format(total)}</span>
      </summary>
      <div className="border-t border-gray-200 bg-white p-4">
        <OrderSummary items={items} subtotal={subtotalAmount} shipping={shipping} tax={tax} total={total} />
      </div>
    </details>
  );

  if (authLoading) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-sm text-gray-600">Checking your sign-in session...</p>
      </main>
    );
  }

  if (!isSignedIn || !profile) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">Sign in required</h1>
        <p className="mt-3 text-gray-600">Complete quick OTP sign-in to continue to checkout.</p>
        <div className="mt-8">
          <Link
            href="/signin?next=%2Fcheckout"
            className="inline-flex h-11 items-center border border-black bg-black px-6 text-sm font-medium text-white transition hover:opacity-90"
          >
            Sign in with OTP
          </Link>
        </div>
      </main>
    );
  }

  if (orderNumber) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold text-gray-900">Order confirmed</h1>
        <p className="mt-3 text-gray-600">Your order has been placed successfully.</p>
        <p className="mt-3 text-sm text-gray-500">Order number: {orderNumber}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex h-11 items-center border border-black bg-black px-6 text-sm font-medium text-white transition hover:opacity-90"
          >
            Continue shopping
          </Link>
          <Link
            href="/cart"
            className="inline-flex h-11 items-center border border-gray-300 px-6 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
          >
            Back to cart
          </Link>
        </div>
      </main>
    );
  }

  return (
    <CheckoutLayout
      summary={
        <OrderSummary items={items} subtotal={subtotalAmount} shipping={shipping} tax={tax} total={total} />
      }
    >
      <form
        className="mx-auto w-full max-w-[760px]"
        onSubmit={async (event) => {
          event.preventDefault();
          setError(null);

          if (items.length === 0) {
            setError("Your cart is empty.");
            return;
          }

          if (paymentMethod === "upi" && !upiId.trim()) {
            setError("Please enter your UPI ID.");
            return;
          }

          if (paymentMethod === "card") {
            const cardDigits = cardNumber.replace(/\D/g, "");
            if (cardDigits.length < 12 || !cardExpiry.trim() || !cardCvv.trim()) {
              setError("Please enter valid card details.");
              return;
            }
          }

          const payload = {
            fullName: profile.name,
            phone: profile.phone,
            shippingMethod,
            paymentMethod,
            upiId: paymentMethod === "upi" ? upiId.trim() : "",
            cardNumber: paymentMethod === "card" ? cardNumber.replace(/\s+/g, "") : "",
            cardExpiry: paymentMethod === "card" ? cardExpiry.trim() : "",
            cardCvv: paymentMethod === "card" ? cardCvv.trim() : "",
            cardName: paymentMethod === "card" ? (cardName.trim() || profile.name) : ""
          };

          setIsSubmitting(true);
          try {
            const response = await fetch("/api/checkout", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(payload)
            });

            const data = (await response.json()) as {
              error?: string;
              order?: { orderNumber: string };
            };

            if (!response.ok) {
              throw new Error(data.error || "Checkout failed.");
            }

            if (!data.order?.orderNumber) {
              throw new Error("Order confirmation was not returned.");
            }

            setOrderNumber(data.order.orderNumber);
            await refreshCart();
          } catch (err) {
            const message = err instanceof Error ? err.message : "Checkout failed.";
            setError(message);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        <h1 className="mb-8 text-3xl font-semibold text-gray-900">Checkout</h1>

        <div className="space-y-8">
          <section className="rounded-none border border-gray-200 p-4">
            <h2 className="text-base font-medium text-gray-900">Signed in details</h2>
            <div className="mt-3 space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-medium text-gray-900">Name:</span> {profile.name}
              </p>
              <p>
                <span className="font-medium text-gray-900">Phone:</span> {profile.phone}
              </p>
            </div>
            <Link
              href="/signin?next=%2Fcheckout&reset=1"
              className="mt-3 inline-flex text-sm font-medium text-gray-700 underline underline-offset-2"
            >
              Change details
            </Link>
          </section>

          <section className="rounded-none border border-gray-200 p-4">
            <h2 className="text-base font-medium text-gray-900">Shipping</h2>
            <div className="mt-4 space-y-3">
              <label className="block cursor-pointer">
                <input
                  type="radio"
                  name="shippingMethod"
                  value="standard"
                  checked={shippingMethod === "standard"}
                  onChange={() => setShippingMethod("standard")}
                  className="peer sr-only"
                />
                <span className="flex items-center justify-between rounded-none border border-gray-300 p-4 peer-checked:border-black">
                  <span className="text-sm font-medium text-gray-900">Standard Shipping</span>
                  <span className="text-sm text-gray-700">Free over $75</span>
                </span>
              </label>
              <label className="block cursor-pointer">
                <input
                  type="radio"
                  name="shippingMethod"
                  value="express"
                  checked={shippingMethod === "express"}
                  onChange={() => setShippingMethod("express")}
                  className="peer sr-only"
                />
                <span className="flex items-center justify-between rounded-none border border-gray-300 p-4 peer-checked:border-black">
                  <span className="text-sm font-medium text-gray-900">Express Shipping</span>
                  <span className="text-sm text-gray-700">$15.00</span>
                </span>
              </label>
            </div>
          </section>

          <section className="rounded-none border border-gray-200 p-4">
            <h2 className="text-base font-medium text-gray-900">Payment</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                  className="peer sr-only"
                />
                <span className="flex h-11 items-center justify-center rounded-none border border-gray-300 text-sm text-gray-700 peer-checked:border-black peer-checked:text-gray-900">
                  UPI
                </span>
              </label>
              <label className="block cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="peer sr-only"
                />
                <span className="flex h-11 items-center justify-center rounded-none border border-gray-300 text-sm text-gray-700 peer-checked:border-black peer-checked:text-gray-900">
                  Card
                </span>
              </label>
            </div>

            {paymentMethod === "upi" ? (
              <div className="mt-4">
                <label htmlFor="checkout-upi" className="text-sm font-medium text-gray-700">
                  UPI ID
                </label>
                <input
                  id="checkout-upi"
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value)}
                  placeholder="name@bank"
                  className="mt-2 h-11 w-full rounded-none border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                />
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="checkout-card-number" className="text-sm font-medium text-gray-700">
                    Card number
                  </label>
                  <input
                    id="checkout-card-number"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    placeholder="1234 5678 9012 3456"
                    className="mt-2 h-11 w-full rounded-none border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label htmlFor="checkout-card-expiry" className="text-sm font-medium text-gray-700">
                      Expiry
                    </label>
                    <input
                      id="checkout-card-expiry"
                      value={cardExpiry}
                      onChange={(event) => setCardExpiry(event.target.value)}
                      placeholder="MM/YY"
                      className="mt-2 h-11 w-full rounded-none border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label htmlFor="checkout-card-cvv" className="text-sm font-medium text-gray-700">
                      CVV
                    </label>
                    <input
                      id="checkout-card-cvv"
                      value={cardCvv}
                      onChange={(event) => setCardCvv(event.target.value)}
                      placeholder="123"
                      className="mt-2 h-11 w-full rounded-none border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label htmlFor="checkout-card-name" className="text-sm font-medium text-gray-700">
                      Name on card
                    </label>
                    <input
                      id="checkout-card-name"
                      value={cardName}
                      onChange={(event) => setCardName(event.target.value)}
                      placeholder={profile.name}
                      className="mt-2 h-11 w-full rounded-none border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:border-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {mobileSummary ? <div className="mt-6 lg:hidden">{mobileSummary}</div> : null}
          </section>

          {error ? (
            <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-none bg-black text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Placing order..." : "Place order"}
          </button>
        </div>
      </form>
    </CheckoutLayout>
  );
}
