import type { Metadata } from 'next';
import HeroSection from '@/components/HeroSection';
import CollectionSection from '@/components/CollectionSection';
import BrandValues from '@/components/BrandValues';
import Newsletter from '@/components/Newsletter';
import ProductGrid from '@/components/ProductGrid';
import { getFeaturedProducts, getNewArrivals } from '@/data/products';
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-brand-warm" />
              <p className="text-[10px] tracking-[0.3em] uppercase text-brand-warm font-semibold">Frais arrivés</p>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl tracking-tight leading-[1.05]">
              Nouvelles <span className="italic text-gold-gradient">Arrivées</span>
            </h2>
          </div>
          <Link href="/shop?new=true" className="link-underline hidden sm:flex items-center gap-2 text-xs tracking-widest uppercase text-gray-500 hover:text-brand-warm transition-colors duration-300">
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>
        <ProductGrid products={newArrivals} />

        <div className="text-center mt-12 sm:hidden">
          <Link
            href="/shop"
            className="group relative inline-flex items-center gap-2 overflow-hidden bg-brand-black text-white text-xs font-bold tracking-widest uppercase px-7 py-4"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-brand-warm via-brand-gold-light to-brand-warm bg-[length:200%_100%] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-expo-out" />
            <span className="relative z-10">Voir la boutique</span>
            <ArrowRight size={12} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <BrandValues />

      <Newsletter />
    </>
  );
}
