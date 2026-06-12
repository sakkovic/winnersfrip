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

/** Relative French time label, e.g. "il y a 3 mois", "à l'instant". */
export function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (!Number.isFinite(s) || s < 0) return '';
  if (s < 60) return "à l'instant";
  const mins = Math.floor(s / 60);
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(s / 3600);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(s / 86400);
  if (days < 30) return `il y a ${days} j`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  const years = Math.floor(days / 365);
  return `il y a ${years} an${years > 1 ? 's' : ''}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
