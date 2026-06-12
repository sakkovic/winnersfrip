import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore/lite';
import { unstable_cache } from 'next/cache';
import app from '@/lib/firebase';
import type { Review } from '@/types';

const toMillis = (v: unknown): number =>
  v && typeof (v as { toMillis?: () => number }).toMillis === 'function'
    ? (v as { toMillis: () => number }).toMillis()
    : 0;

const fetchPublishedReviews = async (): Promise<Review[]> => {
  try {
    const fdb = getFirestore(app);
    // Equality filter on a single field needs no composite index; sort in memory.
    const snap = await getDocs(query(collection(fdb, 'reviews'), where('status', '==', 'published')));
    return snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userId: String(data.userId ?? d.id),
          userName: typeof data.userName === 'string' && data.userName ? data.userName : 'Client',
          userPhoto: typeof data.userPhoto === 'string' ? data.userPhoto : null,
          rating: typeof data.rating === 'number' ? data.rating : 0,
          comment: typeof data.comment === 'string' ? data.comment : '',
          status: 'published',
          createdAt: toMillis(data.createdAt),
        } as Review;
      })
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  } catch (error) {
    console.error('Reviews fetch failed:', error);
    return [];
  }
};

export const getCachedReviews = unstable_cache(
  fetchPublishedReviews,
  ['published-reviews'],
  { revalidate: 60, tags: ['reviews'] },
);
