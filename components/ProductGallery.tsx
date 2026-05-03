'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="flex gap-4">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="hidden sm:flex flex-col gap-2 w-16 flex-shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative w-16 aspect-square overflow-hidden bg-gray-100 flex-shrink-0 transition-all',
                activeIndex === i ? 'ring-1 ring-brand-black ring-offset-1' : 'opacity-60 hover:opacity-100'
              )}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      {/* Main image */}
      <div className="relative flex-1 aspect-[3/4] bg-gray-100 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex]}
              alt={`${name} - photo ${activeIndex + 1}`}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Image précédente"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
              aria-label="Image suivante"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  activeIndex === i ? 'bg-white w-4' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
