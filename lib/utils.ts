import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = '€'): string {
  return `${price}${currency}`;
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
