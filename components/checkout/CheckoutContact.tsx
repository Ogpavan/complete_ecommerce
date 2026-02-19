import Link from "next/link";

const inputClass =
  "h-11 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black";

export default function CheckoutContact() {
  return (
    <section className="border-b border-gray-200 pb-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium text-gray-900">Contact</h2>
        <Link href="#" className="text-sm text-gray-600 underline underline-offset-2">
          Sign in
        </Link>
      </div>

      <label className="text-sm text-gray-600" htmlFor="checkout-contact">
        Email
      </label>
      <input
        id="checkout-contact"
        name="email"
        type="email"
        className={`${inputClass} mt-2`}
      />

      <label className="mt-4 block text-sm text-gray-600" htmlFor="checkout-phone">
        Phone (optional)
      </label>
      <input id="checkout-phone" name="phone" type="tel" className={`${inputClass} mt-2`} />

      <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 accent-black" />
        <span>Email me with news and offers</span>
      </label>
    </section>
  );
}
