'use client';

import { Mail, Phone, Instagram, Facebook, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const BRANDS = [
  "Nike", "Adidas", "Zara", "Puma", "The North Face", 
  "Levi's", "Carhartt", "Ralph Lauren", "Tommy Hilfiger", "Vans"
];

export default function ContactPage() {
  return (
    <div className="bg-white overflow-hidden flex flex-col">
      {/* Marquee Keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 1rem)); }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
      `}} />

      {/* Main Content - Split Screen */}
      <div className="flex flex-col lg:flex-row">
        
        {/* Left Side: Editorial Content */}
        <div className="w-full lg:w-1/2 bg-gray-50 flex flex-col justify-center px-8 py-16 sm:px-16 lg:px-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md w-full mx-auto lg:mx-0"
          >
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-brand-black mb-8 leading-tight">
              Parlons<br />
              <span className="text-gray-400">mode.</span>
            </h1>
            
            <p className="text-sm sm:text-base text-gray-500 mb-16 leading-relaxed font-medium">
              Notre équipe est là pour vous conseiller, répondre à vos questions, et vous aider à dénicher la perle rare. 
              Passez nous voir en boutique !
            </p>

            <div className="space-y-10">
              {/* Address Block */}
              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-black mb-3 border-b border-gray-200 pb-2">
                  La Boutique
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Winners Superfrip<br />
                  QRFJ+J5R<br />
                  Monastir, Tunisie
                </p>
              </div>

              {/* Hours Block */}
              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-black mb-3 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <Clock size={12} className="text-gray-400" />
                  Horaires d&apos;ouverture
                </h3>
                <div className="space-y-1.5 text-sm text-gray-600">
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

              {/* Contact Block */}
              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-black mb-3 border-b border-gray-200 pb-2">
                  Contact
                </h3>
                <div className="space-y-3">
                  <a href="tel:+21600000000" className="flex items-center gap-3 text-sm text-gray-600 hover:text-brand-black transition-colors group">
                    <Phone size={16} className="text-gray-400 group-hover:text-brand-black transition-colors" />
                    +216 00 000 000
                  </a>
                  <a href="mailto:contact@winners-superfrip.com" className="flex items-center gap-3 text-sm text-gray-600 hover:text-brand-black transition-colors group">
                    <Mail size={16} className="text-gray-400 group-hover:text-brand-black transition-colors" />
                    contact@winners-superfrip.com
                  </a>
                </div>
              </div>

              {/* Social Block */}
              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-black mb-4 border-b border-gray-200 pb-2">
                  Réseaux
                </h3>
                <div className="flex gap-4">
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-brand-black hover:text-white hover:border-brand-black transition-all">
                    <Instagram size={18} />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-brand-black hover:text-white hover:border-brand-black transition-all">
                    <Facebook size={18} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Framed Map */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="w-full lg:w-1/2 h-[50vh] lg:h-auto min-h-[400px] relative bg-white p-6 sm:p-8 lg:p-12 flex items-center justify-center"
        >
          <div className="w-full h-full relative border-[8px] border-gray-200 shadow-xl shadow-gray-300 hover:shadow-2xl hover:shadow-gray-400 transition-shadow duration-300 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps?q=35.7741125,10.8303906&z=15&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
              title="Carte de la boutique Winners Superfrip"
            ></iframe>
          </div>
        </motion.div>
      </div>

      {/* Brands Marquee */}
      <div className="border-t border-gray-100 bg-gray-50 py-6 overflow-hidden flex relative z-10">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>
        
        <div className="flex whitespace-nowrap animate-scroll gap-16 items-center pr-16 text-gray-400 font-bold tracking-widest text-2xl sm:text-3xl uppercase opacity-40 hover:opacity-80 transition-opacity duration-300">
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
