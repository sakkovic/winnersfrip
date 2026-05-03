import type { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import CollectionSection from '@/components/CollectionSection';
import BrandValues from '@/components/BrandValues';
import Newsletter from '@/components/Newsletter';
import ProductGrid from '@/components/ProductGrid';
import { getFeaturedProducts, getNewArrivals } from '@/data/products';
import StoreLocation from '@/components/StoreLocation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Winners Superfrip — Mode Vintage & Streetwear',
  description: 'La mode durable à petit prix. Pièces vintage, seconde main et neuves importées d\'Europe.',
};

export default function HomePage() {
  // const featured = getFeaturedProducts(4);
  const newArrivals = getNewArrivals(4);

  return (
    <>
      <HeroSection />

      <CollectionSection />

      {/* Featured Products (Masqué temporairement) 
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">Sélection</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Nos Coups de Cœur</h2>
          </div>
          <Link href="/shop" className="hidden sm:flex items-center gap-2 text-xs tracking-widest uppercase text-gray-500 hover:text-brand-black transition-colors">
            Tout voir <ArrowRight size={12} />
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
      */}

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">Frais arrivés</p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Nouvelles Arrivées</h2>
          </div>
          <Link href="/shop?new=true" className="hidden sm:flex items-center gap-2 text-xs tracking-widest uppercase text-gray-500 hover:text-brand-black transition-colors">
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>
        <ProductGrid products={newArrivals} />

        <div className="text-center mt-10 sm:hidden">
          <Link href="/shop" className="inline-flex items-center gap-2 bg-brand-black text-white text-xs font-bold tracking-widest uppercase px-6 py-3.5">
            Voir la boutique <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      <BrandValues />

      <StoreLocation />

      <Newsletter />
    </>
  );
}
