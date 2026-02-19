import Link from "next/link";

const discoverBanners = [
  {
    title: "Summer Collection",
    action: "Shop Now",
    image: "https://glowing-theme.myshopify.com/cdn/shop/files/banner-01.jpg?v=1736504079&width=1400"
  },
  {
    title: "From Our Blog",
    action: "Read More",
    image: "https://glowing-theme.myshopify.com/cdn/shop/files/banner-02.jpg?v=1736504079&width=1400"
  }
];

export default function Discover() {
  return (
    <section className="bg-gray-50 py-12 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
          {discoverBanners.map((banner) => (
            <article
              key={banner.title}
              className="group relative overflow-hidden rounded-none border border-gray-200"
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="h-[360px] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <h3 className="text-3xl font-semibold text-white">{banner.title}</h3>
                <Link
                  href="#"
                  className="mt-5 inline-flex rounded-none border border-white px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-gray-900"
                >
                  {banner.action}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
