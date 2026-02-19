import Link from "next/link";

export default function PromoSplit() {
  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
          <article className="group relative overflow-hidden border border-gray-300">
            <img
              src="https://glowing-theme.myshopify.com/cdn/shop/files/banner-01.jpg?v=1736504079&width=1200"
              alt="Intensive Glow C+ Serum Banner"
              className="h-[320px] w-full object-cover transition duration-500 group-hover:scale-[1.03] lg:h-[420px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/25 to-transparent" />
            <div className="absolute left-8 top-8 z-10 flex flex-col text-left lg:left-11 lg:top-11">
              <p className="text-xs tracking-widest text-gray-800">NEW COLLECTION</p>
              <h3 className="mt-3 text-3xl font-semibold leading-tight text-gray-900">
                Intensive Glow C+ <br />
                Serum
              </h3>
              <Link
                href="#"
                className="mt-6 inline-flex h-11 w-fit items-center border border-gray-900 bg-white px-6 text-sm font-medium text-gray-900 transition hover:bg-black hover:text-white"
              >
                Explore More
              </Link>
            </div>
          </article>

          <article className="group relative overflow-hidden border border-gray-300">
            <img
              src="https://glowing-theme.myshopify.com/cdn/shop/files/banner-02.jpg?v=1736504079&width=1200"
              alt="25 percent off everything banner"
              className="h-[320px] w-full object-cover transition duration-500 group-hover:scale-[1.03] lg:h-[420px]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/30 to-transparent" />
            <div className="absolute left-8 top-8 z-10 flex flex-col text-left lg:left-11 lg:top-11">
              <h3 className="text-4xl font-semibold leading-tight text-gray-900">25% off Everything</h3>
              <p className="mt-3 text-base leading-relaxed text-gray-800">
                Makeup with extended range in
                <br />
                colors for every human.
              </p>
              <Link
                href="#"
                className="mt-6 inline-flex h-11 w-fit items-center border border-gray-900 bg-white px-6 text-sm font-medium text-gray-900 transition hover:bg-black hover:text-white"
              >
                Shop Sale
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
