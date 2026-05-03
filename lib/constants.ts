export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'] as const;
export const SPECIAL_SIZES = ['unique', 'OS'] as const;
export const ALL_SIZES = [...CLOTHING_SIZES, ...SHOE_SIZES, ...SPECIAL_SIZES] as const;

export type ColorEntry = { value: string; label: string; hex: string | null; outline?: boolean };

export const COLORS: readonly ColorEntry[] = [
  { value: 'noir',        label: 'Noir',       hex: '#1C1C1C' },
  { value: 'blanc',       label: 'Blanc',      hex: '#F5F5F5', outline: true },
  { value: 'gris',        label: 'Gris',       hex: '#9E9E9E' },
  { value: 'beige',       label: 'Beige',      hex: '#D4B896' },
  { value: 'camel',       label: 'Camel',      hex: '#C68B4E' },
  { value: 'marron',      label: 'Marron',     hex: '#795548' },
  { value: 'bleu',        label: 'Bleu',       hex: '#1565C0' },
  { value: 'bleu clair',  label: 'Bleu clair', hex: '#90CAF9' },
  { value: 'vert',        label: 'Vert',       hex: '#2E7D32' },
  { value: 'kaki',        label: 'Kaki',       hex: '#7B8B5C' },
  { value: 'rouge',       label: 'Rouge',      hex: '#C62828' },
  { value: 'rose',        label: 'Rose',       hex: '#E91E63' },
  { value: 'multicolore', label: 'Multi',      hex: null },
];

export type ColorValue = (typeof COLORS)[number]['value'];

export const CATEGORIES = ['hauts', 'bas', 'robes', 'vestes', 'chaussures', 'accessoires'] as const;
export const CONDITIONS = ['neuf', 'comme_neuf', 'seconde_main'] as const;
export const GENDERS = ['femme', 'homme', 'unisexe'] as const;
export const STYLES = ['streetwear', 'vintage', 'sport', 'chic', 'y2k', 'minimaliste'] as const;
export const ORIGINS = ['europe', 'local'] as const;

export const CONDITION_LABELS: Record<string, string> = {
  neuf: 'Neuf',
  comme_neuf: 'Comme Neuf',
  seconde_main: 'Seconde Main',
};

export const PRICE_RANGES = [
  { value: '0-20',   label: '0 – 20€' },
  { value: '20-50',  label: '20 – 50€' },
  { value: '50-100', label: '50 – 100€' },
  { value: '100+',   label: '100€ et +' },
] as const;
