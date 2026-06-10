'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

// ── Slide data (FR) ──────────────────────────────────────────────────────────

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=85',
    label: 'MODE · BEAUTÉ · MONASTIR',
    title: 'Mode & Beauté,\nsous un même toit.',
    subtitle: 'Vintage, streetwear, parfums et soins.\nUne sélection pointue à prix doux.',
    cta: { text: 'Découvrir la boutique', href: '/shop' },
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=85',
    label: 'PIÈCES UNIQUES · IMPORT EUROPE',
    title: 'Un style qui\nvous ressemble.',
    subtitle: 'Du vintage rare au streetwear iconique. Des pièces choisies à la main, en quantité limitée.',
    cta: { text: 'Voir les vêtements', href: '/shop?department=mode' },
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1920&q=85',
    label: 'PARFUMS · SOINS · MAQUILLAGE',
    title: 'Une beauté\nqui vous suit.',
    subtitle: 'Parfums signature, soins clean et maquillage premium. La beauté à portée de main.',
    cta: { text: 'Explorer la beauté', href: '/shop?department=beaute' },
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&q=85',
    label: 'NOUVEAUX ARRIVAGES · PIÈCES LIMITÉES',
    title: 'Une nouvelle\ngarde-robe.',
    subtitle: 'Des arrivages chaque semaine. Mode et beauté, à découvrir avant tout le monde.',
    cta: { text: 'Voir les nouveautés', href: '/shop?new=true' },
  },
];

const SLIDE_DURATION = 6500;

// Split a string into characters for desktop kinetic reveal
function splitChars(text: string) {
  return text.split('').map((ch, i) => ({ ch, i }));
}

// Split a string into words for mobile (preserves natural word-wrap)
function splitWords(text: string) {
  return text.split(' ').map((word, i) => ({ word, i }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  const total = slides.length;

  const go = useCallback((index: number) => {
    setCurrent((index + total) % total);
  }, [total]);

  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  // Autoplay
  useEffect(() => {
    if (!isAutoplay) return;
    const timer = setInterval(next, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isAutoplay, next]);

  // Parallax based on scroll within the hero
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 800], [0, 140]);
  const contentY = useTransform(scrollY, [0, 800], [0, 60]);
  const contentOpacity = useTransform(scrollY, [0, 500], [1, 0.2]);

  const slide = slides[current];

  return (
    <section
      ref={sectionRef}
      className="relative h-screen min-h-[600px] max-h-[920px] overflow-hidden bg-black"
      onMouseEnter={() => setIsAutoplay(false)}
      onMouseLeave={() => setIsAutoplay(true)}
    >
      {/* ── Background images with Ken Burns + parallax ── */}
      <motion.div className="absolute inset-0" style={{ y: imgY }}>
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ opacity: { duration: 1.1, ease: [0.22, 1, 0.36, 1] }, scale: { duration: SLIDE_DURATION / 1000, ease: 'linear' } }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={current === 0}
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Layered gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/15" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/15" />
            {/* Subtle gold radial accent */}
            <div className="absolute -left-32 top-1/4 w-[600px] h-[600px] rounded-full bg-brand-warm/15 blur-3xl pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Slide content ── */}
      <motion.div
        className="relative h-full flex items-center"
        style={{ y: contentY, opacity: contentOpacity }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">

          <div className="flex justify-center sm:justify-start">
            <div className="w-full max-w-2xl text-center sm:text-left">

              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex flex-col items-center sm:items-start gap-5"
                >
                  {/* Top label with gold hairline */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-3"
                  >
                    <span className="h-px w-10 bg-brand-gold-soft/70" />
                    <p className="text-white/70 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-medium">
                      {slide.label}
                    </p>
                  </motion.div>

                  {/* Kinetic title — per-character on desktop, per-word on mobile */}
                  <h1
                    className="font-display text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight"
                    aria-label={slide.title}
                  >
                    {slide.title.split('\n').map((line, li) => (
                      <span key={`${slide.id}-line-${li}`} className="block overflow-hidden">
                        {/* Desktop: per-character reveal */}
                        <span className="hidden sm:inline">
                          {splitChars(line).map(({ ch, i }) => (
                            <motion.span
                              key={`${slide.id}-${li}-c${i}`}
                              initial={{ y: '110%', opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: '-110%', opacity: 0 }}
                              transition={{
                                duration: 0.7,
                                delay: 0.05 + (li * 0.25) + i * 0.022,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              className="inline-block"
                              aria-hidden="true"
                            >
                              {ch === ' ' ? '\u00A0' : ch}
                            </motion.span>
                          ))}
                        </span>
                        {/* Mobile: per-word reveal (preserves word-wrap) */}
                        <span className="sm:hidden">
                          {splitWords(line).map(({ word, i }) => (
                            <motion.span
                              key={`${slide.id}-${li}-w${i}`}
                              initial={{ y: '110%', opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: '-110%', opacity: 0 }}
                              transition={{
                                duration: 0.6,
                                delay: 0.05 + (li * 0.2) + i * 0.08,
                                ease: [0.22, 1, 0.36, 1],
                              }}
                              className="inline-block mr-[0.3em]"
                              aria-hidden="true"
                            >
                              {word}
                            </motion.span>
                          ))}
                        </span>
                      </span>
                    ))}
                  </h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="text-white/80 text-sm sm:text-base leading-relaxed max-w-md whitespace-pre-line"
                  >
                    {slide.subtitle}
                  </motion.p>

                  {/* CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.6, delay: 0.62, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={slide.cta.href}
                      className="group relative inline-flex items-center gap-3 bg-white text-black text-sm font-bold tracking-wide px-7 py-4 overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-brand-warm via-brand-gold-light to-brand-warm bg-[length:200%_100%] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-expo-out" />
                      <span className="relative z-10 group-hover:text-white transition-colors duration-500">
                        {slide.cta.text}
                      </span>
                      <ArrowRight
                        size={15}
                        className="relative z-10 group-hover:translate-x-1 group-hover:text-white transition-all duration-500"
                      />
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={prev}
        aria-label="Précédent"
        suppressHydrationWarning
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-white/8 hover:bg-brand-warm backdrop-blur-md border border-white/25 text-white transition-all duration-400 ease-expo-out hover:scale-110 hover:border-brand-warm"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Suivant"
        suppressHydrationWarning
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-white/8 hover:bg-brand-warm backdrop-blur-md border border-white/25 text-white transition-all duration-400 ease-expo-out hover:scale-110 hover:border-brand-warm"
      >
        <ChevronRight size={20} />
      </button>

      {/* ── Pagination dots ── */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            suppressHydrationWarning
            aria-label={`Slide ${i + 1}`}
            className="relative h-0.5 transition-all duration-500 ease-expo-out overflow-hidden"
            style={{ width: i === current ? 36 : 14 }}
          >
            <span className="absolute inset-0 bg-white/30" />
            {i === current && (
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-brand-gold-soft via-white to-brand-gold-soft"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
                key={`progress-${current}`}
                style={{ transformOrigin: 'left center' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div
        className="absolute bottom-12 right-6 sm:right-10 z-20 flex items-center gap-1.5 text-white/50 text-xs tracking-widest tabular-nums"
      >
        <motion.span
          key={current}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-white font-semibold"
        >
          {String(current + 1).padStart(2, '0')}
        </motion.span>
        <span>/</span>
        <span>{String(total).padStart(2, '0')}</span>
      </div>

      {/* ── Scroll cue ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hidden sm:flex flex-col items-center gap-2 text-white/60">
        <span className="text-[9px] tracking-[0.3em] uppercase">Défiler</span>
        <span className="relative h-8 w-px overflow-hidden bg-white/20">
          <span className="absolute inset-x-0 top-0 h-3 bg-brand-gold-soft animate-scroll-cue" />
        </span>
      </div>
    </section>
  );
}
