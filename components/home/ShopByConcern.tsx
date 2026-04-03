import Link from "next/link";

const concerns = [
  {
    title: "Acne & Breakouts",
    detail: "Clarifying formulas that balance oil and calm visible redness.",
    href: "/products?search=acne",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Dryness & Dehydration",
    detail: "Deeply hydrating essentials for plump, comfort-first skin.",
    href: "/products?search=hydrating",
    image:
      "https://images.unsplash.com/photo-1609205807107-e8ec2120f6c6?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Sensitivity",
    detail: "Barrier-supportive picks with soothing, minimalist ingredients.",
    href: "/products?search=sensitive",
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=80"
  },
  {
    title: "Dark Spots",
    detail: "Brightening routine staples that target uneven tone over time.",
    href: "/products?search=brightening",
    image:
      "https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=900&q=80"
  }
];

export default function ShopByConcern() {
  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs tracking-widest text-gray-500">SHOP SMARTER</p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900">Shop by Concern</h2>
          <p className="mt-3 text-sm text-gray-600">
            Start with your skin goal and discover products designed around your daily needs.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {concerns.map((concern) => (
            <article key={concern.title} className="flex h-full flex-col overflow-hidden border border-gray-200 bg-gray-50">
              <div className="aspect-[4/3] w-full overflow-hidden">
                <img
                  src={concern.image}
                  alt={concern.title}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold text-gray-900">{concern.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{concern.detail}</p>
                <Link
                  href={concern.href}
                  className="mt-auto inline-flex w-fit border border-gray-900 px-4 py-2 text-xs font-medium tracking-wide text-gray-900 uppercase transition hover:bg-black hover:text-white"
                >
                  Explore
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
