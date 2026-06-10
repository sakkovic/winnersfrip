import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Boutique currency — Tunisian Dinar. Change here to switch site-wide. */
export const CURRENCY = 'DT';

export function formatPrice(price: number, currency = CURRENCY): string {
  return `${price} ${currency}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function conditionLabel(condition: string): string {
  const map: Record<string, string> = {
    neuf: 'Neuf',
    comme_neuf: 'Comme Neuf',
    seconde_main: 'Seconde Main',
  };
  return map[condition] ?? condition;
}

export function conditionColor(condition: string): string {
  const map: Record<string, string> = {
    neuf: 'bg-emerald-100 text-emerald-800',
    comme_neuf: 'bg-sky-100 text-sky-800',
    seconde_main: 'bg-amber-100 text-amber-800',
  };
  return map[condition] ?? 'bg-gray-100 text-gray-800';
}

/**
 * Returns the maximum number of units a single product can be added to the cart.
 * Treats `undefined` and any value < 1 as a singleton (1 unit), so legacy
 * catalog entries without an explicit stockQuantity behave correctly.
 */
export function maxCartQuantity(stockQuantity: number | undefined): number {
  if (typeof stockQuantity !== 'number' || !Number.isFinite(stockQuantity)) return 1;
  return Math.max(1, Math.floor(stockQuantity));
}
