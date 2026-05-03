'use client';

import { useState } from 'react';
// --- FIREBASE (à réactiver pour le déploiement) ---
// import { db } from './firebase';
// import { collection, getDocs, query } from 'firebase/firestore';
// --------------------------------------------------
import { products as localProducts } from '@/data/products';
import type { Product } from '@/types';

export function useProducts() {
  // Mode local : on utilise directement les données statiques
  const [products] = useState<Product[]>(localProducts);
  const loading = false;
  const error = null;

  /* --- FIREBASE FETCH (à réactiver pour le déploiement) ---
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productsRef = collection(db, 'products');
        const q = query(productsRef);
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const firestoreProducts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Product[];
          setProducts(firestoreProducts);
        }
      } catch (err) {
        console.error('Firestore fetch failed, using local data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);
  --------------------------------------------------------- */

  return { products, loading, error };
}
