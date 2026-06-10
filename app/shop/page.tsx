import { Suspense } from 'react';
import type { Metadata } from 'next';
import ShopClient from './ShopClient';
import { getCachedProducts } from '@/lib/products.server';

export const metadata: Metadata = {
  title: 'Boutique — Winners Mode',
  description: 'Parcourez notre catalogue de vêtements vintage, streetwear et seconde main.',
};

// Re-generate the page at most once a minute to keep products fresh.
export const revalidate = 60;

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 max-w-7xl mx-auto px-4 py-8">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-100" />
          <div className="mt-3 h-2.5 bg-gray-100 w-3/4 rounded-none" />
          <div className="mt-2 h-2.5 bg-gray-100 w-1/2 rounded-none" />
        </div>
      ))}
    </div>
  );
}

export default async function ShopPage() {
  // Fetch all products server-side with ISR cache.
  const products = await getCachedProducts();

  return (
    <Suspense fallback={<SkeletonGrid />}>
      <ShopClient initialProducts={products} />
    </Suspense>
  );
}
