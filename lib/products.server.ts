import { collection, getDocs, getFirestore } from 'firebase/firestore/lite';
import { unstable_cache } from 'next/cache';
import app from '@/lib/firebase';
import type { Product } from '@/types';

const toMillis = (v: unknown): number =>
  v && typeof (v as { toMillis?: () => number }).toMillis === 'function'
    ? (v as { toMillis: () => number }).toMillis()
    : 0;

const fetchAllProducts = async (): Promise<Product[]> => {
  try {
    const fdb = getFirestore(app);
    const snap = await getDocs(collection(fdb, 'products'));
    return snap.docs
      .map((d) => {
        const data = d.data();
        const createdAtMs = toMillis(data.createdAt);
        const { createdAt, updatedAt, ...rest } = data;
        void createdAt; void updatedAt;
        const product = { id: d.id, ...JSON.parse(JSON.stringify(rest)) } as Product;
        return { product, createdAtMs };
      })
      // Newest first — drives the homepage "Nouvelles Arrivées" and the shop's
      // default "Plus récents" sort without needing a manual flag per product.
      .sort((a, b) => b.createdAtMs - a.createdAtMs)
      .map((r) => r.product);
  } catch (error) {
    console.error('Firestore fetch failed:', error);
    return [];
  }
};

export const getCachedProducts = unstable_cache(
  fetchAllProducts,
  ['all-products-cache'],
  { revalidate: 60, tags: ['products'] }
);
