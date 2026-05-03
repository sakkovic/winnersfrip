'use client';

import { Mail, Phone, Instagram, Facebook } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StoreLocation() {
  return (
    <section className="bg-white border-t border-gray-100">
      <div className="flex flex-col lg:flex-row lg:min-h-[500px]">
        
        {/* Left Side: Editorial Content */}
        <div className="w-full lg:w-1/2 bg-gray-50 flex flex-col justify-center px-8 py-12 sm:px-16 lg:px-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-md w-full mx-auto lg:mx-0"
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-black mb-6 leading-tight">
              Passez nous<br />
              <span className="text-gray-400">voir.</span>
            </h2>
            
            <p className="text-sm sm:text-base text-gray-500 mb-10 leading-relaxed font-medium">
              Notre équipe est là pour vous conseiller et vous aider à dénicher la perle rare. 
              Venez découvrir nos sélections directement en boutique !
            </p>

            <div className="space-y-8">
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
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full lg:w-1/2 h-[400px] lg:h-auto p-6 sm:p-8 lg:p-10 flex items-stretch"
        >
          <div className="w-full relative border-[8px] border-gray-200 shadow-xl shadow-gray-300 hover:shadow-2xl hover:shadow-gray-400 transition-shadow duration-300 rounded-lg overflow-hidden min-h-[300px]">
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
    </section>
  );
}
