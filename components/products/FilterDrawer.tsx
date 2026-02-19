"use client";

import { X } from "lucide-react";

type FilterOption = {
  label: string;
  value: string;
};

type FilterDrawerProps = {
  open: boolean;
  onClose: () => void;
  categories: FilterOption[];
  selectedCategory: string | null;
  inStockOnly: boolean;
  onCategoryChange: (category: string | null) => void;
  onInStockOnlyChange: (value: boolean) => void;
  onClear: () => void;
};

export default function FilterDrawer({
  open,
  onClose,
  categories,
  selectedCategory,
  inStockOnly,
  onCategoryChange,
  onInStockOnlyChange,
  onClear
}: FilterDrawerProps) {
  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <button
        type="button"
        aria-label="Close filters"
        onClick={onClose}
        className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ease-out ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        className={`absolute left-0 top-0 h-screen w-[320px] bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              type="button"
              aria-label="Close filters"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center border border-gray-300 text-gray-700 transition hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            <section className="mb-8">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Category</h3>
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === null}
                    onChange={() => onCategoryChange(null)}
                    className="h-4 w-4 accent-black"
                  />
                  All categories
                </label>
                {categories.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === option.value}
                      onChange={() => onCategoryChange(option.value)}
                      className="h-4 w-4 accent-black"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Availability</h3>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(event) => onInStockOnlyChange(event.target.checked)}
                  className="h-4 w-4 accent-black"
                />
                In stock only
              </label>
            </section>
          </div>

          <div className="border-t border-gray-200 p-5">
            <button
              type="button"
              onClick={onClear}
              className="h-10 w-full border border-gray-300 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              Clear filters
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
