"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HomeProduct } from "@/components/home/ProductCard";
import FilterDrawer from "@/components/products/FilterDrawer";
import ProductsGrid from "@/components/products/ProductsGrid";
import ProductsPagination from "@/components/products/ProductsPagination";
import ProductsToolbar, { type ProductsSort, type ProductsView } from "@/components/products/ProductsToolbar";

const PRODUCTS_PER_PAGE = 8;

type ProductsPageClientProps = {
  products: HomeProduct[];
  categories: Array<{ slug: string; name: string }>;
};

export default function ProductsPageClient({ products, categories }: ProductsPageClientProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [view, setView] = useState<ProductsView>("grid");
  const [sort, setSort] = useState<ProductsSort>("az");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCategory && product.categorySlug !== selectedCategory) {
        return false;
      }
      if (inStockOnly && !product.inStock) {
        return false;
      }
      return true;
    });
  }, [inStockOnly, products, selectedCategory]);

  const sortedProducts = useMemo(() => {
    const collection = [...filteredProducts];

    switch (sort) {
      case "az":
        return collection.sort((a, b) => a.name.localeCompare(b.name));
      case "price-low-high":
        return collection.sort((a, b) => a.price - b.price);
      case "price-high-low":
        return collection.sort((a, b) => b.price - a.price);
      case "newest":
        return collection.sort((a, b) => b.id - a.id);
      default:
        return collection;
    }
  }, [filteredProducts, sort]);

  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const currentPage = Math.min(page, totalPages || 1);
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const visibleProducts = sortedProducts.slice(start, start + PRODUCTS_PER_PAGE);

  return (
    <>
      <section className="py-16">
        <div className="mx-auto max-w-[1320px] px-6">
          <div className="mb-10 text-sm text-gray-500">
            <Link href="/" className="transition hover:text-gray-700">
              Home
            </Link>
            <span className="px-2">—</span>
            <span>Products</span>
          </div>

          <h1 className="mb-10 text-center text-4xl font-semibold text-gray-900">Products</h1>

          <ProductsToolbar
            count={sortedProducts.length}
            view={view}
            sort={sort}
            onOpenFilters={() => setIsFilterOpen(true)}
            onViewChange={(nextView) => {
              setView(nextView);
              setPage(1);
            }}
            onSortChange={(nextSort) => {
              setSort(nextSort);
              setPage(1);
            }}
          />

          <div className="mt-10">
            <ProductsGrid products={visibleProducts} view={view} />
          </div>

          <ProductsPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </section>

      <FilterDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories.map((category) => ({ value: category.slug, label: category.name }))}
        selectedCategory={selectedCategory}
        inStockOnly={inStockOnly}
        onCategoryChange={(nextCategory) => {
          setSelectedCategory(nextCategory);
          setPage(1);
        }}
        onInStockOnlyChange={(nextValue) => {
          setInStockOnly(nextValue);
          setPage(1);
        }}
        onClear={() => {
          setSelectedCategory(null);
          setInStockOnly(false);
          setPage(1);
        }}
      />
    </>
  );
}
