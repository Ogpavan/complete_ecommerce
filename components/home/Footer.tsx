import Link from "next/link";

const usefulLinks = ["Shop All", "Best Sellers", "New Arrivals", "Gift Cards"];
const infoLinks = ["About Us", "Contact", "Shipping Policy", "Privacy Policy"];
const paymentMethods = ["VISA", "MC", "AMEX", "PAYPAL"];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-20">
          <div>
            <h3 className="text-lg font-semibold tracking-[0.16em] text-gray-900">LUMEA</h3>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-600">
              Thoughtful skincare designed to nourish, hydrate, and simplify your everyday ritual.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-900">
              Useful Links
            </h4>
            <ul className="mt-4 space-y-3">
              {usefulLinks.map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-gray-600 transition hover:text-gray-900">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-900">
              Information
            </h4>
            <ul className="mt-4 space-y-3">
              {infoLinks.map((link) => (
                <li key={link}>
                  <Link href="#" className="text-sm text-gray-600 transition hover:text-gray-900">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-900">
              Newsletter
            </h4>
            <p className="mt-4 text-sm text-gray-600">
              Subscribe for skincare tips, early access, and limited offers.
            </p>
            <form className="mt-5 flex gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full rounded-none border border-gray-200 px-4 py-3 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-gray-400"
              />
              <button
                type="submit"
                className="shrink-0 rounded-none border border-gray-900 px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-black hover:text-white"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-200 py-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 LUMEA. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="rounded-none border border-gray-300 px-3 py-1 text-[11px] font-medium tracking-wide text-gray-600"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
