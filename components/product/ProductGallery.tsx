"use client";

import { Search } from "lucide-react";
import { useState } from "react";

type ProductGalleryProps = {
  name: string;
  images: string[];
};

function normalizeImageUrls(values: string[]) {
  return values
    .map((value) => value.trim())
    .filter((value, index, array) => value.length > 0 && array.indexOf(value) === index);
}

export default function ProductGallery({ name, images }: ProductGalleryProps) {
  const safeImages = normalizeImageUrls(images);
  const hasImages = safeImages.length > 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = hasImages
    ? safeImages[Math.min(activeIndex, safeImages.length - 1)]
    : null;

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-none border border-gray-300 bg-gray-50">
        <button
          type="button"
          aria-label="Magnify image"
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-none border border-gray-300 bg-white text-gray-800 transition hover:bg-gray-100"
        >
          <Search className="h-4 w-4" strokeWidth={1.5} />
        </button>
        {activeImage ? (
          <img
            src={activeImage}
            alt={`${name} image ${activeIndex + 1}`}
            className="h-full w-full cursor-zoom-in object-cover transition duration-500 hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full animate-pulse flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100">
            <div className="h-14 w-14 rounded border border-gray-300 bg-white/70" />
            <div className="h-2.5 w-28 rounded bg-white/70" />
            <p className="text-[11px] font-medium tracking-wide text-gray-500 uppercase">Image coming soon</p>
          </div>
        )}
      </div>

      {hasImages ? (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              aria-label={`View thumbnail ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={`aspect-square overflow-hidden rounded-none border transition ${
                activeIndex === index ? "border-black" : "border-gray-300 hover:border-gray-500"
              }`}
            >
              <img src={image} alt={`${name} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-square animate-pulse rounded-none border border-gray-300 bg-gray-100" />
          ))}
        </div>
      )}
    </div>
  );
}
