import Link from "next/link";
import Breadcrumb from "@/components/product/Breadcrumb";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductTabs from "@/components/product/ProductTabs";
import RelatedProducts from "@/components/product/RelatedProducts";
import StickyCartBar from "@/components/product/StickyCartBar";
import Navbar from "@/components/home/Navbar";
import { getProductDetailPayload } from "@/lib/server/catalog";
import type { ProductCardSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{ slug?: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const resolvedParams = await params;
  const slug = typeof resolvedParams.slug === "string" ? resolvedParams.slug : "";
  const safeSlug = slug ? decodeURIComponent(slug) : "";
  const payload = safeSlug ? await getProductDetailPayload(safeSlug) : null;

  if (!payload) {
    return (
      <main className="bg-white">
        <Navbar />
        <section className="mx-auto max-w-[1320px] px-6 py-24 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Product not found</h1>
          <p className="mt-3 text-sm text-gray-600">The requested product is unavailable.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex border border-black px-6 py-3 text-sm font-medium text-gray-900 transition hover:bg-black hover:text-white"
          >
            Back to products
          </Link>
        </section>
      </main>
    );
  }

  const { product, related } = payload;
  const imageUrls = product.images
    .map((image) => image.url.trim())
    .filter((url, index, array) => url.length > 0 && array.indexOf(url) === index);
  const stock = product.variants.reduce((sum, variant) => sum + Math.max(variant.stock, 0), 0);

  const wishlistItem: ProductCardSummary = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    defaultVariantId: product.variants[0]?.id ?? null,
    price: product.variants[0]?.price ?? 0,
    image: imageUrls[0] ?? "",
    images: imageUrls,
    category: product.category.name,
    categorySlug: product.category.slug,
    inStock: stock > 0,
    stock
  };

  return (
    <main className="bg-white pb-28">
      <Navbar />
      <section className="pt-4 pb-16">
        <div className="mx-auto max-w-[1320px] px-6">
          <Breadcrumb productName={product.name} />
          <div className="grid gap-10 lg:grid-cols-2">
            <ProductGallery name={product.name} images={imageUrls} />
            <ProductInfo
              productId={product.id}
              name={product.name}
              categoryName={product.category.name}
              variants={product.variants}
              wishlistItem={wishlistItem}
            />
          </div>
        </div>
      </section>

      <ProductTabs description={product.description} />
      <RelatedProducts products={related} />
      <StickyCartBar
        productId={product.id}
        name={product.name}
        image={imageUrls[0] ?? null}
        variants={product.variants}
      />
    </main>
  );
}
