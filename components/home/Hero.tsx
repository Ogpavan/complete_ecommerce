"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    subtitle: "ESSENSTIAL ITEMS",
    title: "Beauty Inspired by Real Life",
    description:
      "Made using clean, non-toxic ingredients, our products are designed for everyone.",
    image: "https://glowing-theme.myshopify.com/cdn/shop/files/hero-slider-01.webp?v=1742526402",
    imagePosition: "center center",
    maxWidth: "max-w-[450px]"
  },
  {
    subtitle: "NEW COLLECTION",
    title: "Get The Perfectly Hydrated Skin",
    description:
      "Made using clean, non-toxic ingredients, our products are designed for everyone.",
    image: "https://glowing-theme.myshopify.com/cdn/shop/files/hero-slider-03.webp?v=1742526402",
    imagePosition: "center left",
    maxWidth: "max-w-[470px]"
  },
  {
    subtitle: "GET THE GLOW",
    title: "Be Your Kind of Beauty",
    description:
      "Made using clean, non-toxic ingredients, our products are designed for everyone.",
    image: "https://glowing-theme.myshopify.com/cdn/shop/files/hero-slider-02.webp?v=1742526402",
    imagePosition: "center center",
    maxWidth: "max-w-[450px]"
  }
];

const AUTOPLAY_MS = 5000;

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative">
      <div className="relative min-h-[560px] overflow-hidden lg:min-h-[680px]">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <div
              key={slide.title}
              className={`absolute inset-0 transition-all duration-[1200ms] ease-out ${
                isActive ? "z-10 opacity-100" : "z-0 opacity-0"
              }`}
            >
              <div
                className={`absolute inset-0 h-full w-full bg-cover bg-no-repeat transition-transform duration-[1200ms] ${
                  isActive ? "scale-100" : "scale-110"
                }`}
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundPosition: slide.imagePosition
                }}
              />
              <div className="absolute inset-0 bg-black/10" />

              <div className="relative z-20 mx-auto flex h-full max-w-[1320px] items-center px-4 sm:px-6 lg:px-8">
                <div className={`${slide.maxWidth} text-gray-900`}>
                  <p className="text-xs font-semibold tracking-[0.25em] text-gray-900/80">
                    {slide.subtitle}
                  </p>
                  <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl lg:text-[56px]">
                    {slide.title}
                  </h1>
                  <p className="mt-6 text-base leading-relaxed text-gray-800/80 sm:text-lg">
                    {slide.description}
                  </p>
                  <Link
                    href="/products"
                    className="mt-9 inline-flex h-12 items-center rounded-none bg-black px-7 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2">
        <ul className="flex items-center gap-2">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <li key={slide.title}>
                <button
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 w-2.5 rounded-full transition ${
                    isActive ? "bg-gray-900" : "bg-gray-400/70 hover:bg-gray-500"
                  }`}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
