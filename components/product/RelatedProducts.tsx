import ProductCard, { type HomeProduct } from "@/components/home/ProductCard";

type RelatedProductsProps = {
  products: HomeProduct[];
};

export default function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1320px] px-6">
        <h2 className="text-center text-3xl font-semibold text-gray-900">You May Also Like</h2>
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-10">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} animationDelayMs={index * 70} />
          ))}
        </div>
      </div>
    </section>
  );
}
