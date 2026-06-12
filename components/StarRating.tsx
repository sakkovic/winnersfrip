'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  /** Provide to make the stars selectable. */
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
}

/**
 * Gold star rating. Read-only by default; pass `onChange` to make it an input.
 */
export default function StarRating({ value, onChange, size = 16, className }: StarRatingProps) {
  const interactive = typeof onChange === 'function';

  return (
    <div className={cn('flex items-center gap-0.5', className)} role={interactive ? 'radiogroup' : 'img'} aria-label={`Note : ${value} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;
        const star = (
          <Star
            size={size}
            strokeWidth={1.5}
            className={cn(
              'transition-colors',
              filled ? 'fill-brand-warm text-brand-warm' : 'fill-gray-200 text-gray-200',
            )}
          />
        );
        return interactive ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            className="cursor-pointer hover:scale-110 transition-transform"
            aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}
