'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const collections = [
  {
    title: 'Femme',
    subtitle: 'Robes, hauts & vestes',
    href: '/shop?gender=femme',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
    number: '01',
    dept: 'Mode',
  },
  {
    title: 'Homme',
    subtitle: 'Streetwear & vintage',
    href: '/shop?gender=homme',
    image: 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?auto=format&fit=crop&w=800&q=80',
    number: '02',
    dept: 'Mode',
  },
  {
    title: 'Vintage',
    subtitle: 'Pièces d\'époque',
    href: '/shop?style=vintage',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
    number: '03',
    dept: 'Mode',
  },
  {
    title: 'Parfums',
    subtitle: 'Signatures olfactives',
    href: '/shop?category=parfums',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
    number: '04',
    dept: 'Beauté',
  },
  {
    title: 'Soins',
    subtitle: 'Visage & corps',
    href: '/shop?category=soins-visage',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    number: '05',
    dept: 'Beauté',
  },
  {
    title: 'Cheveux',
    subtitle: 'Shampoings & masques',
    href: '/shop?category=cheveux',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
    number: '06',
    dept: 'Beauté',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function CollectionSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-brand-warm" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-brand-warm font-semibold">Explorez</p>
          </div>
          <h2 className="font-display text-3xl sm:text-5xl tracking-tight text-brand-black leading-[1.05]">
            Mode <span className="italic text-gold-gradient">&amp;</span> Beauté
          </h2>
        </div>
        <Link
          href="/shop"
          className="link-underline hidden sm:flex items-center gap-2 text-xs tracking-widest uppercase text-gray-500 hover:text-brand-warm transition-colors duration-300"
        >
          Tout voir <ArrowRight size={12} />
        </Link>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {collections.map((col, i) => (
          <motion.div
            key={col.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Link
              href={col.href}
              className="group relative block overflow-hidden aspect-[3/4] lg:aspect-[4/5] bg-gray-100"
            >
              <Image
                src={col.image}
                alt={col.title}
                fill
                className="object-cover object-center transition-transform duration-[1200ms] ease-expo-out group-hover:scale-110"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Default gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent transition-opacity duration-500 group-hover:opacity-0" />

              {/* Hover gradient — gold tinted */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-warm/80 via-brand-black/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Department pill */}
              <span className="absolute top-4 left-4 text-[9px] tracking-[0.25em] uppercase font-semibold px-2 py-1 bg-white/85 text-brand-black backdrop-blur-sm">
                {col.dept}
              </span>

              {/* Top-right index */}
              <div className="absolute top-4 right-4 flex items-center gap-2 text-white">
                <span className="text-[10px] tracking-widest tabular-nums opacity-70 transition-all duration-500 group-hover:opacity-100">
                  {col.number}
                </span>
                <span className="w-6 h-px bg-white/60 transition-all duration-500 group-hover:w-10 group-hover:bg-white" />
              </div>

              {/* Corner arrow on hover */}
              <div className="absolute top-14 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white opacity-0 -translate-x-2 -translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 bg-white border border-white transition-all duration-500 ease-expo-out">
                <ArrowUpRight size={16} className="text-brand-black" />
              </div>

              {/* Title block */}
              <div className="absolute bottom-0 left-0 right-0 p-5 transition-transform duration-500 ease-expo-out group-hover:-translate-y-1">
                <h3 className="text-white font-display text-xl sm:text-2xl tracking-tight leading-none mb-1.5">
                  {col.title}
                </h3>
                <p className="text-white/80 text-xs tracking-wide overflow-hidden">
                  <span className="inline-block transition-transform duration-500 ease-expo-out group-hover:translate-x-1">
                    {col.subtitle}
                  </span>
                </p>
                <span className="block mt-3 h-px w-0 bg-gradient-to-r from-brand-gold-soft to-white transition-all duration-700 ease-expo-out group-hover:w-12" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
