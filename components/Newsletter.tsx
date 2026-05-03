'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <section className="bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto"
        >
          <p className="text-xs tracking-widest uppercase text-gray-400 mb-3">Restez informé</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-black mb-4">
            Nouveautés en Avant-Première
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Inscrivez-vous pour recevoir nos arrivages exclusifs, promotions et actualités directement dans votre boîte mail.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4"
            >
              <p className="text-brand-black font-medium">Merci ! Vous êtes inscrit(e). 🎉</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                suppressHydrationWarning
                className="flex-1 border border-gray-300 px-4 py-3 text-sm outline-none focus:border-brand-black transition-colors bg-white min-w-0"
              />
              <button
                type="submit"
                suppressHydrationWarning
                className="bg-brand-black text-white px-5 py-3 hover:bg-gray-800 transition-colors flex items-center gap-2 text-xs font-bold tracking-wider uppercase flex-shrink-0"
              >
                S&apos;inscrire
                <ArrowRight size={12} />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
