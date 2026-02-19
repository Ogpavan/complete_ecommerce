import Link from "next/link";
import ProductCard, { type HomeProduct } from "./ProductCard";

type FavoritesProps = {
  products: HomeProduct[];
};

export default function Favorites({ products }: FavoritesProps) {
  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs tracking-widest text-gray-500">BESTSELLERS</p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900">Customer Favorites</h2>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <article className="relative overflow-hidden rounded-none border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80"
              alt="Beauty model"
              className="h-full min-h-[520px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="text-xs tracking-widest text-white/80">MOST LOVED</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">Glow that lasts all day long</h3>
              <Link
                href="#"
                className="mt-6 inline-flex rounded-none border border-white px-6 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-gray-900"
              >
                Shop Favorites
              </Link>
            </div>
          </article>

          <div className="grid grid-cols-2 gap-6">
            {products.slice(0, 6).map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
