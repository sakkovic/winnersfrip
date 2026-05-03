'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

// ── Slide data ────────────────────────────────────────────────────────────────

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=85',
    label: 'VINTAGE · STREETWEAR · MONASTIR',
    title: 'ستايلك يحكي عليك',
    subtitle: 'لبسة unique، streetwear و vintage مختارين بعناية.\nمن أوروبا لتونس، قطع محدودة وأسعار باهية.',
    cta: { text: 'اكتشف الكوليكسيون', href: '/shop' },
    align: 'right', // RTL arabic content
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1920&q=85',
    label: 'PIÈCES UNIQUES · EUROPE STYLE',
    title: 'لبسة موش كيما الناس الكل',
    subtitle: 'قطع محدودة من أوروبا، ستايل مختلف وأسعار مريڨلة.',
    cta: { text: 'شوف الجديد', href: '/shop?new=true' },
    align: 'right',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1920&q=85',
    label: 'FASHION · MONASTIR · TUNISIA',
    title: 'من أوروبا لتونس',
    subtitle: 'Vintage, streetwear و pièces uniques باش تتميّز.\nلوك يشبهلك.',
    cta: { text: 'اختار اللوك متاعك', href: '/shop' },
    align: 'right',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1920&q=85',
    label: 'NEW DROP · LIMITED PIECES',
    title: 'لوك جديد، إحساس جديد',
    subtitle: 'قطع مختارة بعناية للناس اللي تحب الستيل والاختلاف.',
    cta: { text: 'ابدأ التسوق', href: '/shop' },
    align: 'right',
  },
];

// ── Slide content animation variants ─────────────────────────────────────────

const textVariants = {
  enter: { opacity: 0, y: 24 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoplay, setIsAutoplay] = useState(true);

  const total = slides.length;

  const go = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrent((index + total) % total);
  }, [total]);

  const next = useCallback(() => go(current + 1, 1), [current, go]);
  const prev = useCallback(() => go(current - 1, -1), [current, go]);

  // Autoplay
  useEffect(() => {
    if (!isAutoplay) return;
    const timer = setInterval(next, 5500);
    return () => clearInterval(timer);
  }, [isAutoplay, next]);

  const slide = slides[current];

  return (
    <section
      className="relative h-screen min-h-[600px] max-h-[920px] overflow-hidden"
      onMouseEnter={() => setIsAutoplay(false)}
      onMouseLeave={() => setIsAutoplay(true)}
    >
      {/* ── Background images ── */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
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
          {/* Layered gradient overlay — stronger on Arabic side */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/50 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
        </motion.div>
      </AnimatePresence>

      {/* ── Slide content ── */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">

          {/* RTL content block — right-aligned on desktop, centered on mobile */}
          <div className="flex justify-center sm:justify-end">
            <div className="w-full max-w-lg text-center sm:text-right" dir="rtl">

              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="flex flex-col items-center sm:items-end gap-5"
                >
                  {/* Top label — LTR */}
                  <motion.p
                    variants={textVariants}
                    transition={{ duration: 0.55, delay: 0, ease: 'easeOut' }}
                    className="text-white/60 text-[10px] sm:text-xs tracking-[0.3em] uppercase font-medium"
                    dir="ltr"
                  >
                    {slide.label}
                  </motion.p>

                  {/* Main title */}
                  <motion.h1
                    variants={textVariants}
                    transition={{ duration: 0.6, delay: 0.08, ease: 'easeOut' }}
                    className="text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight"
                    style={{ fontFamily: "'Cairo', 'Geist', sans-serif" }}
                  >
                    {slide.title}
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    variants={textVariants}
                    transition={{ duration: 0.6, delay: 0.16, ease: 'easeOut' }}
                    className="text-white/75 text-sm sm:text-base leading-relaxed max-w-sm whitespace-pre-line"
                    style={{ fontFamily: "'Cairo', sans-serif" }}
                  >
                    {slide.subtitle}
                  </motion.p>

                  {/* CTA */}
                  <motion.div
                    variants={textVariants}
                    transition={{ duration: 0.6, delay: 0.24, ease: 'easeOut' }}
                    dir="rtl"
                  >
                    <Link
                      href={slide.cta.href}
                      className="group inline-flex items-center gap-3 bg-white text-black text-sm font-bold tracking-wide px-7 py-3.5 hover:bg-brand-warm hover:text-white transition-all duration-300"
                      style={{ fontFamily: "'Cairo', sans-serif" }}
                    >
                      {slide.cta.text}
                      <ArrowRight
                        size={15}
                        className="rotate-180 group-hover:translate-x-[-4px] transition-transform duration-300"
                      />
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

            </div>
          </div>
        </div>
      </div>

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={prev}
        aria-label="Précédent"
        suppressHydrationWarning
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white transition-all duration-200 hover:scale-105"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Suivant"
        suppressHydrationWarning
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 text-white transition-all duration-200 hover:scale-105"
      >
        <ChevronRight size={20} />
      </button>

      {/* ── Pagination dots ── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i, i > current ? 1 : -1)}
            suppressHydrationWarning
            aria-label={`Slide ${i + 1}`}
            className="relative h-0.5 transition-all duration-500 overflow-hidden"
            style={{ width: i === current ? 32 : 14 }}
          >
            <span className="absolute inset-0 bg-white/30" />
            {i === current && (
              <motion.span
                className="absolute inset-0 bg-white"
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 5.5, ease: 'linear' }}
                key={`progress-${current}`}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div
        className="absolute bottom-10 right-6 sm:right-10 z-20 flex items-center gap-1.5 text-white/50 text-xs tracking-widest"
        dir="ltr"
      >
        <span className="text-white font-semibold">{String(current + 1).padStart(2, '0')}</span>
        <span>/</span>
        <span>{String(total).padStart(2, '0')}</span>
      </div>
    </section>
  );
}
