'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import type { Product, CartItem } from '@/types';

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

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem('ws-cart', JSON.stringify(cart));
    }
  }, [cart, hydrated]);

  const addToCart = useCallback((product: Product, size?: string, color?: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        toast.error('Déjà dans le panier');
        return prev;
      }
      toast.success('Ajouté au panier !');
      return [...prev, { ...product, quantity: 1, selectedSize: size, selectedColor: color }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));
    toast.success('Article retiré');
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prev) => prev.map((i) => (i.id === productId ? { ...i, quantity } : i)));
  }, []);

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
