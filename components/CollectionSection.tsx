'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const collections = [
  {
    title: 'Femme',
    subtitle: 'Robes, hauts & vestes',
    href: '/shop?gender=femme',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Homme',
    subtitle: 'Streetwear & vintage',
    href: '/shop?gender=homme',
    image: 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Nouveautés',
    subtitle: 'Arrivages récents',
    href: '/shop?new=true',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Vintage',
    subtitle: 'Pièces d\'époque',
    href: '/shop?style=vintage',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80',
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function CollectionSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-2">Explorez</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-black">Nos Univers</h2>
        </div>
        <Link href="/shop" className="hidden sm:flex items-center gap-2 text-xs tracking-widest uppercase text-gray-500 hover:text-brand-black transition-colors">
          Tout voir <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {collections.map((col, i) => (
          <motion.div
            key={col.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Link href={col.href} className="group relative block overflow-hidden aspect-[3/4] bg-gray-100">
              <Image
                src={col.image}
                alt={col.title}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-bold text-base sm:text-lg tracking-tight leading-none mb-1">
                  {col.title}
                </h3>
                <p className="text-white/70 text-xs">{col.subtitle}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
