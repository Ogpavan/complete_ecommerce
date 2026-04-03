import ProductCard, { type HomeProduct } from "@/components/home/ProductCard";
import type { ProductsView } from "./ProductsToolbar";

type ProductsGridProps = {
  products: HomeProduct[];
  view: ProductsView;
};

export default function ProductsGrid({ products, view }: ProductsGridProps) {
  return (
    <div
      className={`grid gap-6 lg:gap-10 ${
        view === "list" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
      }`}
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} showQuickAdd animationDelayMs={index * 60} />
      ))}
    </div>
  );
}
