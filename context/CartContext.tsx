"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AddCartItemInput, CartSummary } from "@/lib/types";

export type CartItem = CartSummary["items"][number];

type CartContextValue = {
  cartId: number | null;
  items: CartItem[];
  isOpen: boolean;
  loading: boolean;
  mutating: boolean;
  error: string | null;
  addItem: (payload: AddCartItemInput) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  increaseQty: (itemId: number) => Promise<void>;
  decreaseQty: (itemId: number) => Promise<void>;
  updateQty: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  subtotal: () => number;
  totalQuantity: number;
  totalItems: number;
};

const CartContext = createContext<CartContextValue | null>(null);

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload?.error) {
      return payload.error;
    }
  } catch {
    // no-op
  }

  return `Request failed with status ${response.status}.`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyCart = useCallback((payload: CartSummary) => {
    setCart(payload);
  }, []);

  const fetchCart = useCallback(async () => {
    const response = await fetch("/api/cart", {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }

    const payload = (await response.json()) as CartSummary;
    applyCart(payload);
  }, [applyCart]);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchCart();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load cart.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  useEffect(() => {
    refreshCart().catch(() => {
      // handled in refreshCart
    });
  }, [refreshCart]);

  const performMutation = useCallback(
    async (request: () => Promise<Response>) => {
      setMutating(true);
      setError(null);
      try {
        const response = await request();
        if (!response.ok) {
          throw new Error(await readErrorMessage(response));
        }

        const payload = (await response.json()) as CartSummary;
        applyCart(payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Cart update failed.";
        setError(message);
        throw err;
      } finally {
        setMutating(false);
      }
    },
    [applyCart]
  );

  const addItem = useCallback(
    async (payload: AddCartItemInput) => {
      await performMutation(() =>
        fetch("/api/cart/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      );
    },
    [performMutation]
  );

  const updateQty = useCallback(
    async (itemId: number, quantity: number) => {
      await performMutation(() =>
        fetch(`/api/cart/items/${itemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity })
        })
      );
    },
    [performMutation]
  );

  const removeItem = useCallback(
    async (itemId: number) => {
      await performMutation(() =>
        fetch(`/api/cart/items/${itemId}`, {
          method: "DELETE"
        })
      );
    },
    [performMutation]
  );

  const clearCart = useCallback(async () => {
    await performMutation(() =>
      fetch("/api/cart", {
        method: "DELETE"
      })
    );
  }, [performMutation]);

  const increaseQty = useCallback(
    async (itemId: number) => {
      const item = cart?.items.find((entry) => entry.id === itemId);
      if (!item) {
        return;
      }
      await updateQty(itemId, item.quantity + 1);
    },
    [cart?.items, updateQty]
  );

  const decreaseQty = useCallback(
    async (itemId: number) => {
      const item = cart?.items.find((entry) => entry.id === itemId);
      if (!item) {
        return;
      }
      if (item.quantity <= 1) {
        await removeItem(itemId);
        return;
      }
      await updateQty(itemId, item.quantity - 1);
    },
    [cart?.items, removeItem, updateQty]
  );

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const subtotal = useCallback(() => cart?.subtotal ?? 0, [cart?.subtotal]);

  const totalQuantity = useMemo(() => cart?.itemCount ?? 0, [cart?.itemCount]);

  const value = useMemo<CartContextValue>(
    () => ({
      cartId: cart?.id ?? null,
      items: cart?.items ?? [],
      isOpen,
      loading,
      mutating,
      error,
      addItem,
      removeItem,
      increaseQty,
      decreaseQty,
      updateQty,
      clearCart,
      refreshCart,
      openCart,
      closeCart,
      subtotal,
      totalQuantity,
      totalItems: totalQuantity
    }),
    [
      cart?.id,
      cart?.items,
      isOpen,
      loading,
      mutating,
      error,
      addItem,
      removeItem,
      increaseQty,
      decreaseQty,
      updateQty,
      clearCart,
      refreshCart,
      openCart,
      closeCart,
      subtotal,
      totalQuantity
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
