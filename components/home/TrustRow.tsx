import type { LucideIcon } from "lucide-react";
import { Headset, RotateCcw, Truck, WalletCards } from "lucide-react";

const trustItems: { title: string; detail: string; icon: LucideIcon }[] = [
  {
    title: "Free Shipping",
    detail: "On all US orders over $50",
    icon: Truck
  },
  {
    title: "Returns",
    detail: "30-day hassle-free returns",
    icon: RotateCcw
  },
  {
    title: "Online Support",
    detail: "Beauty experts always available",
    icon: Headset
  },
  {
    title: "Flexible Payment",
    detail: "Split payment at checkout",
    icon: WalletCards
  }
];

export default function TrustRow() {
  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          {trustItems.map((item) => (
            <article
              key={item.title}
              className="rounded-none border border-gray-200 bg-white p-6 text-center transition hover:shadow-md"
            >
              <item.icon className="mx-auto h-5 w-5 text-gray-700" />
              <h3 className="mt-4 text-base font-semibold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
