"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ProductCardSummary } from "@/lib/types";

export type WishlistItem = ProductCardSummary & {
  addedAt: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  loading: boolean;
  totalItems: number;
  addItem: (item: ProductCardSummary) => void;
  removeItem: (productId: number) => void;
  toggleItem: (item: ProductCardSummary) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: number) => boolean;
};

const STORAGE_KEY = "ecommerce:wishlist:v1";

const WishlistContext = createContext<WishlistContextValue | null>(null);

function isWishlistItem(entry: unknown): entry is WishlistItem {
  if (!entry || typeof entry !== "object") {
    return false;
  }

  const candidate = entry as Partial<WishlistItem>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.price === "number" &&
    typeof candidate.image === "string" &&
    Array.isArray(candidate.images)
  );
}

function readStoredWishlist() {
  if (typeof window === "undefined") {
    return [] as WishlistItem[];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [] as WishlistItem[];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [] as WishlistItem[];
    }

    return parsed.filter(isWishlistItem);
  } catch {
    return [] as WishlistItem[];
  }
}

function toWishlistItem(item: ProductCardSummary): WishlistItem {
  return {
    ...item,
    addedAt: new Date().toISOString()
  };
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setItems(readStoredWishlist());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loading]);

  const addItem = useCallback((item: ProductCardSummary) => {
    setItems((previous) => {
      if (previous.some((entry) => entry.id === item.id)) {
        return previous;
      }

      return [toWishlistItem(item), ...previous];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((previous) => previous.filter((entry) => entry.id !== productId));
  }, []);

  const toggleItem = useCallback((item: ProductCardSummary) => {
    setItems((previous) => {
      if (previous.some((entry) => entry.id === item.id)) {
        return previous.filter((entry) => entry.id !== item.id);
      }

      return [toWishlistItem(item), ...previous];
    });
  }, []);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const isInWishlist = useCallback(
    (productId: number) => items.some((entry) => entry.id === productId),
    [items]
  );

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      loading,
      totalItems: items.length,
      addItem,
      removeItem,
      toggleItem,
      clearWishlist,
      isInWishlist
    }),
    [items, loading, addItem, removeItem, toggleItem, clearWishlist, isInWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
