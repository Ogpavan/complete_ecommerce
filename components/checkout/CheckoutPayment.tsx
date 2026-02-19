import { Lock } from "lucide-react";
import type { ReactNode } from "react";

type CheckoutPaymentProps = {
  mobileSummary?: ReactNode;
  submitting?: boolean;
  submitLabel?: string;
};

const inputClass =
  "h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black";

export default function CheckoutPayment({
  mobileSummary,
  submitting = false,
  submitLabel = "Pay now"
}: CheckoutPaymentProps) {
  return (
    <section className="pb-8">
      <h2 className="mb-4 font-medium text-gray-900">Payment</h2>

      <div className="rounded-md border border-gray-300 p-4">
        <div className="mb-4 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          <Lock className="h-4 w-4" />
          <span>Card</span>
        </div>

        <div>
          <label className="text-sm text-gray-600" htmlFor="checkout-card-number">
            Card number
          </label>
          <input
            id="checkout-card-number"
            name="cardNumber"
            type="text"
            className={`${inputClass} mt-2`}
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm text-gray-600" htmlFor="checkout-expiry">
              Expiry (MM/YY)
            </label>
            <input id="checkout-expiry" name="expiry" type="text" className={`${inputClass} mt-2`} />
          </div>
          <div>
            <label className="text-sm text-gray-600" htmlFor="checkout-security">
              Security code
            </label>
            <input
              id="checkout-security"
              name="securityCode"
              type="text"
              className={`${inputClass} mt-2`}
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm text-gray-600" htmlFor="checkout-card-name">
            Name on card
          </label>
          <input id="checkout-card-name" name="cardName" type="text" className={`${inputClass} mt-2`} />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 accent-black" />
          <span>Use shipping address as billing address</span>
        </label>

        {mobileSummary ? <div className="mt-6 lg:hidden">{mobileSummary}</div> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 h-12 w-full rounded-md bg-black text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </section>
  );
}
