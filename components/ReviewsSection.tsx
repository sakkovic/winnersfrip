'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, PenLine } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StarRating from './StarRating';
import ReviewModal from './ReviewModal';
import { cn, timeAgo } from '@/lib/utils';
import type { Review } from '@/types';

// Deterministic warm gradient for the avatar fallback, derived from the name
// so a given person always gets the same color.
const AVATAR_GRADIENTS = [
  'from-brand-warm to-brand-gold-dark',
  'from-brand-gold-dark to-brand-black',
  'from-brand-gold-light to-brand-warm',
  'from-gray-700 to-brand-black',
  'from-brand-warm to-amber-700',
];
function gradientFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}
function initialOf(name: string) {
  return (name.trim().charAt(0) || '?').toUpperCase();
}

const TRUNCATE = 120;

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const comment = review.comment ?? '';
  const isLong = comment.length > TRUNCATE;
  const shown = expanded || !isLong ? comment : `${comment.slice(0, TRUNCATE).trimEnd()}…`;

  return (
    <div className="snap-start shrink-0 basis-[85%] sm:basis-[47%] lg:basis-[31.5%] xl:basis-[23.5%]">
      <div className="h-full flex flex-col bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-brand-gold-soft/50 transition-all duration-300">
        {/* Header: avatar + name + stars */}
        <div className="flex items-center gap-3 mb-3">
          {review.userPhoto ? (
            <Image
              src={review.userPhoto}
              alt={review.userName}
              width={44}
              height={44}
              className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className={cn(
                'w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br text-white font-semibold',
                gradientFor(review.userName),
              )}
            >
              {initialOf(review.userName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-black truncate">{review.userName}</p>
            <StarRating value={review.rating} size={14} className="mt-0.5" />
          </div>
        </div>

        {review.createdAt ? (
          <p className="text-[11px] text-gray-400 mb-2">{timeAgo(new Date(review.createdAt))}</p>
        ) : null}

        {comment ? (
          <p className="text-sm text-gray-600 leading-relaxed">
            {shown}
            {isLong && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="ml-1 text-gray-400 hover:text-brand-warm transition-colors text-xs font-medium"
              >
                {expanded ? 'Réduire' : 'Lire la suite'}
              </button>
            )}
          </p>
        ) : (
          <p className="text-sm text-gray-300 italic">A laissé une note</p>
        )}
      </div>
    </div>
  );
}

export default function ReviewsSection({ initialReviews }: { initialReviews: Review[] }) {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [modalOpen, setModalOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const { avg, count } = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, count: 0 };
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    return { avg: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
  }, [reviews]);

  const mine = currentUser ? reviews.find((r) => r.userId === currentUser.uid) ?? null : null;

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  // Gentle autoplay; pauses on hover/focus and when only a few cards.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || reviews.length <= 3 || reduceMotion) return;
    const id = setInterval(() => {
      if (paused) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: el.clientWidth * 0.9, behavior: 'smooth' });
      }
    }, 5000);
    return () => clearInterval(id);
  }, [paused, reviews.length, reduceMotion]);

  const handleSubmitted = (review: Review) => {
    setReviews((prev) => [review, ...prev.filter((r) => r.userId !== review.userId)]);
  };

  return (
    <section className="relative bg-mesh-cream py-20 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="h-px w-8 bg-brand-warm" />
              <p className="text-[10px] tracking-[0.3em] uppercase text-brand-warm font-semibold">Ils nous font confiance</p>
            </div>
            <h2 className="font-display text-3xl sm:text-5xl tracking-tight leading-[1.05]">
              Avis <span className="italic text-gold-gradient">clients</span>
            </h2>
            {count > 0 && (
              <div className="flex items-center gap-2.5 mt-4">
                <StarRating value={Math.round(avg)} size={18} />
                <span className="text-sm text-gray-600">
                  <span className="font-bold text-brand-black">{avg.toFixed(1)}</span> / 5 · {count} avis
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {reviews.length > 3 && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => scrollByPage(-1)}
                  aria-label="Avis précédents"
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:border-brand-black hover:text-brand-black transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scrollByPage(1)}
                  aria-label="Avis suivants"
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 bg-white text-gray-500 hover:border-brand-black hover:text-brand-black transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-brand-black text-white text-[11px] font-bold tracking-widest uppercase px-5 py-3 hover:bg-gray-800 transition-colors"
            >
              <PenLine size={13} />
              {mine ? 'Modifier mon avis' : 'Laisser un avis'}
            </button>
          </div>
        </div>

        {/* Carousel / empty state */}
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-white/60 border border-dashed border-brand-gold-soft/40 rounded-2xl">
            <Star size={32} className="mx-auto mb-3 fill-brand-gold-soft/40 text-brand-gold-soft/40" strokeWidth={0} />
            <p className="text-gray-500 text-sm mb-5">Aucun avis pour le moment. Soyez le premier à partager votre expérience !</p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 border border-brand-black text-brand-black text-[11px] font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-brand-black hover:text-white transition-colors"
            >
              <PenLine size={13} /> Laisser le premier avis
            </button>
          </div>
        ) : (
          <div
            ref={scrollerRef}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-pl-4 pb-4 -mx-1 px-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <ReviewModal
            existing={mine}
            onClose={() => setModalOpen(false)}
            onSubmitted={handleSubmitted}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
