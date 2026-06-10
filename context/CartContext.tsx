'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, CartItem } from '@/types';
import { maxCartQuantity } from '@/lib/utils';

interface CartContextValue {
  cart: CartItem[];
  isCartOpen: boolean;
  cartCount: number;
  cartTotal: number;
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ws-cart');
      if (saved) setCart(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  // One-time validation pass on mount: if Firestore says a cart item no longer
  // exists (admin deleted the product), drop it from the cart silently.
  // Items whose document we can't read (offline / rules) are kept as-is.
  useEffect(() => {
    if (!hydrated || cart.length === 0) return;
    let cancelled = false;
    (async () => {
      const ids = cart.map((i) => i.id);
      const validity = await Promise.all(
        ids.map(async (id) => {
          try {
            const snap = await getDoc(doc(db, 'products', id));
            // Returns false ONLY when the doc is definitively gone.
            return snap.exists() ? true : false;
          } catch {
            // Network / rules error → don't drop the item.
            return true;
          }
        }),
      );
      if (cancelled) return;
      const stale = validity.filter((ok) => !ok).length;
      if (stale > 0) {
        setCart((prev) => prev.filter((_, i) => validity[i]));
        toast(
          stale === 1
            ? 'Un article du panier n\'est plus disponible — il a été retiré.'
            : `${stale} articles du panier ne sont plus disponibles — ils ont été retirés.`,
          { duration: 5000 },
        );
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally only run once after hydration; the cart already de-dupes
    // by id when adding new items, so a one-shot validation is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('ws-cart', JSON.stringify(cart));
    }
  }, [cart, hydrated]);

  // Tap "Add to cart" on a product:
  //   - first time      → push to cart at quantity 1
  //   - already in cart → increment, capped at the product's stockQuantity
  //   - cap hit         → toast and bail
  const addToCart = useCallback(
    (product: Product, size?: string, color?: string) => {
      const max = maxCartQuantity(product.stockQuantity);
      const existing = cart.find((i) => i.id === product.id);

      if (existing) {
        if (existing.quantity >= max) {
          toast.error(
            max === 1
              ? 'Pièce unique — déjà dans le panier'
              : `Stock maximum atteint (${max})`,
          );
          return;
        }
        const nextQty = existing.quantity + 1;
        toast.success(`Quantité mise à jour (${nextQty})`);
        setCart((prev) =>
          prev.map((i) =>
            i.id === product.id ? { ...i, quantity: nextQty } : i,
          ),
        );
        return;
      }

      toast.success('Ajouté au panier !');
      setCart((prev) => [
        ...prev,
        { ...product, quantity: 1, selectedSize: size, selectedColor: color },
      ]);
    },
    [cart],
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
    toast.success('Article retiré');
  }, []);

  // Cap any direct quantity change (typed input, +/- buttons, etc.) at stockQuantity.
  // Side-effects (toast) are run *before* setCart so we never trigger a state
  // update on another component from inside a state-updater function.
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) return;
      const item = cart.find((i) => i.id === productId);
      if (!item) return;
      const max = maxCartQuantity(item.stockQuantity);
      const next = Math.min(quantity, max);
      if (next === item.quantity) return;
      if (quantity > max) {
        toast.error(`Stock maximum: ${max}`);
      }
      setCart((prev) =>
        prev.map((i) => (i.id === productId ? { ...i, quantity: next } : i)),
      );
    },
    [cart],
  );

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('ws-cart');
  }, []);

  const toggleCart = useCallback(() => setIsCartOpen((o) => !o), []);

  const cartCount = cart.reduce((n, i) => n + i.quantity, 0);
  const cartTotal = cart.reduce((total, item) => {
    const price = item.isPromo && item.promoPrice ? item.promoPrice : item.price;
    return total + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{ cart, isCartOpen, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, setIsCartOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}
