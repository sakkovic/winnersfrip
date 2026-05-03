'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import ProductGrid from '@/components/ProductGrid';

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Liste de Souhaits</h1>
        <p className="text-gray-400 text-sm mb-10">{wishlist.length} article{wishlist.length > 1 ? 's' : ''}</p>

        {wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Heart size={48} strokeWidth={0.8} className="text-gray-200 mb-6" />
            <p className="text-gray-400 text-sm mb-6">Votre liste de souhaits est vide.</p>
            <Link
              href="/shop"
              className="text-xs tracking-widest uppercase underline underline-offset-4 text-brand-black hover:text-gray-600 transition-colors"
            >
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <ProductGrid products={wishlist} />
        )}
      </div>
    </div>
  );
}
