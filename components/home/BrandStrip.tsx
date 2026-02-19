const mentions = [
  {
    brand: "VOGUE",
    quote: "A calm-luxury skincare line with formulas that actually deliver."
  },
  {
    brand: "ELLE",
    quote: "The minimalist brand beauty editors keep reaching for daily."
  },
  {
    brand: "BYRDIE",
    quote: "Hydrating textures and modern packaging in one polished ritual."
  }
];

export default function BrandStrip() {
  return (
    <section className="bg-gray-50 py-12 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs tracking-widest text-gray-500">EDITORIAL FAVORITES</p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900">As seen in</h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3 lg:gap-10">
          {mentions.map((item) => (
            <article
              key={item.brand}
              className="rounded-none border border-gray-200 bg-white p-8 text-center transition hover:shadow-md"
            >
              <p className="text-lg font-semibold tracking-[0.18em] text-gray-900">{item.brand}</p>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">{item.quote}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
