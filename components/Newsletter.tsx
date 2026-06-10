'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowRight, Check, Mail, Loader2 } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || submitting) return;
    if (!isValidEmail(trimmed)) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'newsletter_signups'), {
        email: trimmed,
        createdAt: serverTimestamp(),
        source: 'home_newsletter',
      });
      setSubmitted(true);
    } catch (err) {
      console.error('newsletter signup failed', err);
      toast.error("Impossible d'enregistrer votre inscription. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative bg-mesh-cream overflow-hidden">
      {/* Decorative animated gold orbs */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-brand-gold-soft/20 blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-brand-warm/15 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-black text-brand-gold-soft mb-6"
          >
            <Mail size={18} strokeWidth={1.5} />
          </motion.div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-px w-8 bg-brand-warm" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-brand-warm font-semibold">Restez informé</p>
            <span className="h-px w-8 bg-brand-warm" />
          </div>

          <h2 className="font-display text-3xl sm:text-5xl tracking-tight text-brand-black mb-5 leading-[1.05]">
            Nouveautés en <span className="italic text-gold-gradient">Avant-Première</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-10 max-w-md mx-auto">
            Inscrivez-vous pour recevoir nos arrivages exclusifs, promotions et actualités directement dans votre boîte mail.
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                className="inline-flex items-center gap-3 bg-brand-black text-white px-6 py-4"
              >
                <motion.span
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 18 }}
                  className="w-6 h-6 rounded-full bg-brand-gold-soft flex items-center justify-center"
                >
                  <Check size={14} className="text-brand-black" strokeWidth={2.5} />
                </motion.span>
                <span className="text-sm font-medium">Merci ! Vous êtes inscrit(e).</span>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative flex gap-2 max-w-md mx-auto"
              >
                <div
                  className={`relative flex-1 transition-all duration-400 ease-expo-out ${focused ? 'shadow-[0_0_0_3px_rgba(132,83,0,0.12)]' : ''}`}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="votre@email.com"
                    required
                    suppressHydrationWarning
                    className={`w-full border px-4 py-3.5 text-sm outline-none transition-colors bg-white ${
                      error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-brand-warm'
                    }`}
                  />
                  {error && (
                    <p className="absolute -bottom-5 left-0 text-[10px] text-red-500 font-medium">{error}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  suppressHydrationWarning
                  className="group relative overflow-hidden bg-brand-black text-white px-6 py-3.5 text-xs font-bold tracking-wider uppercase flex-shrink-0 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-brand-warm via-brand-gold-light to-brand-warm bg-[length:200%_100%] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-expo-out" />
                  {submitting ? (
                    <Loader2 size={13} className="relative z-10 animate-spin" />
                  ) : (
                    <>
                      <span className="relative z-10">S&apos;inscrire</span>
                      <ArrowRight size={12} className="relative z-10 group-hover:translate-x-1 transition-transform duration-400" />
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-[10px] text-gray-400 mt-6 tracking-wider">
            Pas de spam. Désinscription en un clic.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
