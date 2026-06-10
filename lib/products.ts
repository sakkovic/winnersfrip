'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { products as localProducts } from '@/data/products';
import type { Product } from '@/types';

/**
 * Public catalog hook.
 *
 * Source of truth is the Firestore `products` collection so the admin can add,
 * edit and delete products and have those changes appear on the live site
 * without a redeploy.
 *
 * The static seed (`data/products.ts`) is used as an instant first paint and as
 * a fallback when Firestore is unreachable OR not seeded yet (empty). Once the
 * admin has run "Importer catalogue" at least once, Firestore is authoritative
 * — including deletions.
 */
export function useProducts() {
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (cancelled) return;
        // Only switch to Firestore when it actually has products. An empty
        // collection means "not seeded yet" → keep the static fallback so the
        // site is never blank.
        if (!snap.empty) {
          setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
        }
      } catch (err) {
        if (!cancelled) setError(err as Error);
        // Keep the static fallback on error — the site stays browsable offline.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading, error };
}
