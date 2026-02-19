"use client";

import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";

export type ProductsView = "grid" | "list";
export type ProductsSort = "az" | "price-low-high" | "price-high-low" | "newest";

type ProductsToolbarProps = {
  count: number;
  view: ProductsView;
  sort: ProductsSort;
  onOpenFilters: () => void;
  onViewChange: (view: ProductsView) => void;
  onSortChange: (sort: ProductsSort) => void;
};

export default function ProductsToolbar({
  count,
  view,
  sort,
  onOpenFilters,
  onViewChange,
  onSortChange
}: ProductsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-y border-gray-200 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onOpenFilters}
          className="inline-flex h-10 items-center gap-2 border border-gray-300 px-4 text-sm text-gray-700 transition hover:bg-gray-100"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
        </button>
        <p className="text-sm text-gray-600">We found {count} products available for you.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        <button
          type="button"
          aria-label="Grid view"
          onClick={() => onViewChange("grid")}
          className={`inline-flex h-10 w-10 items-center justify-center border transition ${
            view === "grid"
              ? "border-black bg-black text-white"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>

        <button
          type="button"
          aria-label="List view"
          onClick={() => onViewChange("list")}
          className={`inline-flex h-10 w-10 items-center justify-center border transition ${
            view === "list"
              ? "border-black bg-black text-white"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <List className="h-4 w-4" />
        </button>

        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as ProductsSort)}
          className="h-10 border border-gray-300 px-3 text-sm text-gray-700 outline-none transition focus:border-gray-500"
        >
          <option value="az">Alphabetically, A-Z</option>
          <option value="price-low-high">Price low-high</option>
          <option value="price-high-low">Price high-low</option>
          <option value="newest">Newest</option>
        </select>
      </div>
    </div>
  );
}
