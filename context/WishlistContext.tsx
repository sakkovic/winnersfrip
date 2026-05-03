'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/types';

interface WishlistContextValue {
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (id: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ws-wishlist');
      if (saved) setWishlist(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('ws-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) =>
      prev.some((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  }, []);

  const isWishlisted = useCallback((id: string) => wishlist.some((p) => p.id === id), [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, wishlistCount: wishlist.length }}>
      {children}
    </WishlistContext.Provider>
  );
}
