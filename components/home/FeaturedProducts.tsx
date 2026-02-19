import ProductCard, { type HomeProduct } from "./ProductCard";

type FeaturedProductsProps = {
  products: HomeProduct[];
};

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs tracking-widest text-gray-500">CURATED FOR YOU</p>
          <h2 className="mt-3 text-3xl font-semibold text-gray-900">Our Featured Products</h2>
          <p className="mt-3 text-sm text-gray-600">
            Elevated skincare staples made for daily glow, comfort, and clean beauty rituals.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-10">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
