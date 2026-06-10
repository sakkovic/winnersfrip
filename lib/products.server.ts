import { collection, getDocs, getFirestore } from 'firebase/firestore/lite';
import { unstable_cache } from 'next/cache';
import app from '@/lib/firebase';
import { products as staticProducts } from '@/data/products';
import type { Product } from '@/types';

/**
 * Server-side function to fetch all products from Firestore.
 * Fallbacks to the static catalog if Firestore is unreachable or unseeded.
 */
const fetchAllProducts = async (): Promise<Product[]> => {
  try {
    const fdb = getFirestore(app);
    const snap = await getDocs(collection(fdb, 'products'));
    
    if (!snap.empty) {
      return snap.docs.map((d) => {
        // Strip Firestore Timestamps (createdAt / updatedAt) — they're not part
        // of the Product type and aren't serializable to the client component.
        const { createdAt, updatedAt, ...rest } = d.data();
        void createdAt; void updatedAt;
        const plain = JSON.parse(JSON.stringify(rest));
        return { id: d.id, ...plain } as Product;
      });
    }
  } catch (error) {
    console.error('Firestore fetch failed, using static fallback:', error);
  }
  
  return staticProducts;
};

/**
 * Cached version of fetchAllProducts for ISR.
 * Revalidates every 60 seconds.
 */
export const getCachedProducts = unstable_cache(
  async () => {
    return fetchAllProducts();
  },
  ['all-products-cache'],
  {
    revalidate: 60,
    tags: ['products'],
  }
);
