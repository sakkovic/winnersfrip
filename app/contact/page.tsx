'use client';

import { Mail, Phone, Instagram, Facebook, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { BOUTIQUE } from '@/lib/boutique-rules';

const BRANDS = [
  "Nike", "Adidas", "Zara", "Puma", "The North Face",
  "Levi's", "Carhartt", "Ralph Lauren", "Tommy Hilfiger", "Vans"
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const wordVariants = {
  hidden: { y: '110%' },
  visible: { y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const headlineWords = ['Parlons'];
const headlineAccent = 'mode.';

export default function ContactPage() {
  return (
    <div className="bg-white overflow-hidden flex flex-col">
      {/* Main Content — Split Screen */}
      <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-92px)]">

        {/* Left Side: Editorial Content — mesh-cream background */}
        <div className="relative w-full lg:w-1/2 bg-mesh-cream flex flex-col justify-center px-8 py-16 sm:px-16 lg:px-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md w-full mx-auto lg:mx-0"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-brand-warm" />
              <p className="text-[10px] tracking-[0.3em] uppercase text-brand-warm font-semibold">
                Contact · Monastir
              </p>
            </div>

            {/* Headline — animated word reveal */}
            <motion.h1
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight text-brand-black mb-6 leading-[1.05]"
            >
              <span className="block overflow-hidden py-[0.05em]">
                {headlineWords.map((w) => (
                  <motion.span
                    key={w}
                    variants={wordVariants}
                    className="inline-block mr-3"
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
              <span className="block overflow-hidden py-[0.05em]">
                <motion.span
                  variants={wordVariants}
                  className="inline-block italic text-gold-gradient"
                >
                  {headlineAccent}
                </motion.span>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-sm sm:text-base text-gray-600 mb-10 leading-relaxed"
            >
              Notre équipe est là pour vous conseiller, répondre à vos questions,
              et vous aider à dénicher la perle rare. Passez nous voir en boutique !
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="space-y-8"
            >
              {/* Address */}
              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-black mb-3 flex items-center gap-2">
                  <MapPin size={12} className="text-brand-warm" />
                  La Boutique
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed pl-6 border-l-2 border-brand-gold-soft/40">
                  Winners Mode<br />
                  QRFJ+J5R<br />
                  Monastir, Tunisie
                </p>
              </div>

              {/* Hours */}
              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-black mb-3 flex items-center gap-2">
                  <Clock size={12} className="text-brand-warm" />
                  Horaires d&apos;ouverture
                </h3>
                <div className="space-y-1.5 text-sm text-gray-700 pl-6 border-l-2 border-brand-gold-soft/40">
                  <div className="flex justify-between">
                    <span>Lundi – Vendredi</span>
                    <span className="font-medium text-brand-black">9h00 – 19h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Samedi</span>
                    <span className="font-medium text-brand-black">9h00 – 20h00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimanche</span>
                    <span className="font-medium text-red-500">Fermé</span>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-black mb-3">
                  Contact
                </h3>
                <div className="space-y-3">
                  <a href={`tel:${BOUTIQUE.contactPhoneE164}`} className="group flex items-center gap-3 text-sm text-gray-700 hover:text-brand-warm transition-colors">
                    <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:bg-brand-warm group-hover:border-brand-warm transition-all duration-300">
                      <Phone size={13} className="text-gray-500 group-hover:text-white transition-colors" />
                    </span>
                    {BOUTIQUE.contactPhone}
                  </a>
                  <a href="mailto:contact@winners-mode.com" className="group flex items-center gap-3 text-sm text-gray-700 hover:text-brand-warm transition-colors">
                    <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:bg-brand-warm group-hover:border-brand-warm transition-all duration-300">
                      <Mail size={13} className="text-gray-500 group-hover:text-white transition-colors" />
                    </span>
                    contact@winners-mode.com
                  </a>
                </div>
              </div>

              {/* Social */}
              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-black mb-4">
                  Réseaux
                </h3>
                <div className="flex gap-3">
                  {[
                    { Icon: Instagram, href: 'https://instagram.com/winners.mode', label: 'Instagram' },
                    { Icon: Facebook,  href: 'https://facebook.com/winners.mode',  label: 'Facebook'  },
                  ].map(({ Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="group relative w-11 h-11 rounded-full overflow-hidden flex items-center justify-center border border-gray-300 text-gray-600 hover:text-white hover:border-brand-warm transition-all duration-500 ease-expo-out"
                    >
                      <span className="absolute inset-0 bg-gradient-to-br from-brand-warm to-brand-gold-dark scale-0 group-hover:scale-100 rounded-full transition-transform duration-500 ease-expo-out" />
                      <Icon size={17} className="relative z-10" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side: Gold-framed Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full lg:w-1/2 h-[420px] lg:h-auto p-6 sm:p-8 lg:p-10 flex items-stretch"
        >
          <div className="group relative w-full overflow-hidden shadow-xl shadow-gray-300/50 hover:shadow-2xl hover:shadow-brand-warm/20 transition-all duration-700 ease-expo-out min-h-[300px]">
            {/* Gold frame border */}
            <div className="absolute inset-0 ring-1 ring-brand-gold-soft/30 group-hover:ring-brand-gold-soft transition-all duration-500 pointer-events-none z-10" />
            {/* Corner accents */}
            <span className="absolute top-3 left-3 w-4 h-4 border-t border-l border-brand-gold-soft z-10 transition-all duration-500 group-hover:w-6 group-hover:h-6" />
            <span className="absolute top-3 right-3 w-4 h-4 border-t border-r border-brand-gold-soft z-10 transition-all duration-500 group-hover:w-6 group-hover:h-6" />
            <span className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-brand-gold-soft z-10 transition-all duration-500 group-hover:w-6 group-hover:h-6" />
            <span className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-brand-gold-soft z-10 transition-all duration-500 group-hover:w-6 group-hover:h-6" />

            <iframe
              src="https://www.google.com/maps?q=35.7741125,10.8303906&z=15&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
              title="Carte de la boutique Winners Mode"
            ></iframe>
          </div>
        </motion.div>
      </div>

      {/* Brands Marquee — mesh-cream themed */}
      <div className="border-t border-brand-gold-soft/20 bg-mesh-cream py-6 overflow-hidden flex relative z-10">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-brand-cream to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-brand-cream to-transparent z-10"></div>

        <div className="flex whitespace-nowrap animate-marquee gap-16 items-center pr-16 text-brand-warm font-bold tracking-widest text-2xl sm:text-3xl uppercase opacity-25 hover:opacity-50 transition-opacity duration-300">
          {/* Double the list for seamless infinite loop */}
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <span key={i} className="inline-block hover:text-brand-black transition-colors duration-300">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
