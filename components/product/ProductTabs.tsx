"use client";

import { useState } from "react";

type ProductTabsProps = {
  description: string;
};

type TabKey = "description" | "shipping";

export default function ProductTabs({ description }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("description");

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1320px] px-6">
        <div className="flex items-center justify-center gap-10 border-b border-gray-300">
          <button
            type="button"
            onClick={() => setActiveTab("description")}
            className={`pb-4 text-sm font-medium transition ${
              activeTab === "description"
                ? "border-b-2 border-black text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("shipping")}
            className={`pb-4 text-sm font-medium transition ${
              activeTab === "shipping"
                ? "border-b-2 border-black text-gray-900"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Shipping & Return
          </button>
        </div>

        <div className="mx-auto max-w-3xl py-10 text-gray-600">
          {activeTab === "description" ? (
            <>
              <p className="leading-relaxed">{description}</p>
              <ul className="mt-6 list-disc space-y-2 pl-5 leading-relaxed">
                <li>Deep hydration support for smoother and more supple skin.</li>
                <li>Lightweight serum texture that layers seamlessly under makeup.</li>
                <li>Skin-soothing botanical complex suitable for daily use.</li>
              </ul>
            </>
          ) : (
            <>
              <p className="leading-relaxed">
                Orders are processed within 1-2 business days and dispatched with tracked shipping.
                Delivery typically arrives within 3-6 business days depending on destination.
              </p>
              <ul className="mt-6 list-disc space-y-2 pl-5 leading-relaxed">
                <li>Free shipping is available for all orders over $75.</li>
                <li>Easy returns accepted within 30 days of delivery.</li>
                <li>Products must be returned unused and in original packaging.</li>
              </ul>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
