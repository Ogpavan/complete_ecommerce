import Navbar from "@/components/home/Navbar";
import ProductsPageClient from "@/components/products/ProductsPageClient";
import { getCategoriesSummary, getProductsPayload } from "@/lib/server/catalog";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProductsPayload({
      page: 1,
      pageSize: 200,
      sort: "newest"
    }),
    getCategoriesSummary()
  ]);

  return (
    <main className="bg-white">
      <Navbar />
      <ProductsPageClient
        products={products.items}
        categories={categories.map((category) => ({
          slug: category.slug,
          name: category.name
        }))}
      />
    </main>
  );
}
