'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface Props {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  children: React.ReactNode;
}

/**
 * Editorial layout used by FAQ / Privacy / Terms / similar static pages.
 * Keeps the brand voice consistent and reads well at 375px on up.
 */
export default function StaticPage({ eyebrow, title, titleAccent, children }: Props) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-brand-black transition-colors">Accueil</Link>
          <ChevronRight size={10} />
          <span className="text-brand-black">{eyebrow}</span>
        </nav>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 sm:mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-brand-warm" />
            <p className="text-[10px] tracking-[0.3em] uppercase text-brand-warm font-semibold">
              {eyebrow}
            </p>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl tracking-tight leading-[1.05]">
            {title}{' '}
            {titleAccent && (
              <span className="italic text-gold-gradient">{titleAccent}</span>
            )}
          </h1>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="prose prose-sm max-w-none text-gray-700 space-y-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
