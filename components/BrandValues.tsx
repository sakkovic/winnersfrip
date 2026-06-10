'use client';

import { motion } from 'framer-motion';
import { Star, Sparkles, MapPin, Gem } from 'lucide-react';

const values = [
  {
    icon: Star,
    title: 'Qualité Sélectionnée',
    desc: 'Chaque article est inspecté et validé avant mise en boutique.',
  },
  {
    icon: Gem,
    title: 'Pièces Uniques',
    desc: 'Mode vintage, parfums et soins choisis à la main, en quantité limitée.',
  },
  {
    icon: Sparkles,
    title: 'Import Europe',
    desc: 'Une sélection rapportée directement d\'Europe pour Monastir.',
  },
  {
    icon: MapPin,
    title: 'Boutique à Monastir',
    desc: 'Venez essayer, sentir, et profiter de nos conseils en personne.',
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const iconVariants = {
  hidden: { rotate: -90, scale: 0.6, opacity: 0 },
  visible: (i: number) => ({
    rotate: 0,
    scale: 1,
    opacity: 1,
    transition: { delay: 0.2 + i * 0.12, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] },
  }),
};

export default function BrandValues() {
  return (
    <section className="relative border-y border-gray-100 bg-white overflow-hidden">
      {/* Subtle decorative gold line at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gold-line opacity-50" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gold-line opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="group flex flex-col items-center text-center"
            >
              {/* Gold ring around icon */}
              <motion.div
                custom={i}
                variants={iconVariants}
                className="gold-ring mb-5"
              >
                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center transition-all duration-500 ease-expo-out group-hover:bg-brand-black">
                  <v.icon
                    size={20}
                    strokeWidth={1.5}
                    className="text-brand-black transition-colors duration-500 group-hover:text-brand-gold-soft"
                  />
                </div>
              </motion.div>

              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-black mb-2">
                {v.title}
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed max-w-[200px]">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
