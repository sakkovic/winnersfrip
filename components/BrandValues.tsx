'use client';

import { motion } from 'framer-motion';
import { Truck, ShieldCheck, RotateCcw, Star } from 'lucide-react';

const values = [
  {
    icon: Star,
    title: 'Qualité Sélectionnée',
    desc: 'Chaque article est inspecté et validé avant mise en vente.',
  },
  {
    icon: Truck,
    title: 'Livraison Rapide',
    desc: 'Expédition sous 24-48h, livraison partout en Algérie.',
  },
  {
    icon: ShieldCheck,
    title: 'Paiement Sécurisé',
    desc: 'Vos données sont protégées. Paiement à la livraison disponible.',
  },
  {
    icon: RotateCcw,
    title: 'Retours Faciles',
    desc: 'Pas satisfait(e) ? Retour gratuit sous 14 jours.',
  },
];

export default function BrandValues() {
  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 flex items-center justify-center border border-gray-200 mb-4">
                <v.icon size={18} strokeWidth={1.5} className="text-brand-black" />
              </div>
              <h3 className="text-xs font-bold tracking-wider uppercase text-brand-black mb-2">{v.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
