'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Product } from '@/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (!cancelled) {
          setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
        }
      } catch (err) {
        if (!cancelled) setError(err as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
}
