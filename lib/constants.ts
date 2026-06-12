import type { ProductDepartment, ModeCategory, BeauteCategory, ProductCategory } from '@/types';

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

// ── Departments ────────────────────────────────────────────────────────────
export const DEPARTMENTS = ['mode', 'beaute'] as const satisfies readonly ProductDepartment[];

export const DEPARTMENT_LABELS: Record<ProductDepartment, string> = {
  mode: 'Mode',
  beaute: 'Beauté',
};

// ── Categories per department ─────────────────────────────────────────────
export const MODE_CATEGORIES = ['hauts', 'bas', 'robes', 'vestes', 'chaussures', 'accessoires'] as const satisfies readonly ModeCategory[];

export const BEAUTE_CATEGORIES = ['parfums', 'soins-visage', 'soins-corps', 'cheveux', 'maquillage'] as const satisfies readonly BeauteCategory[];

// 'autre' is a shared catch-all available under both departments.
export const CATEGORIES = [...MODE_CATEGORIES, ...BEAUTE_CATEGORIES, 'autre'] as const;

/**
 * Department a subcategory belongs to — used to auto-select Mode/Beauté from the
 * chosen subcategory. Returns null for the shared 'autre' (ambiguous, the admin
 * picks the department manually in that case).
 */
export const departmentForCategory = (c: ProductCategory): ProductDepartment | null => {
  if ((BEAUTE_CATEGORIES as readonly ProductCategory[]).includes(c)) return 'beaute';
  if ((MODE_CATEGORIES as readonly ProductCategory[]).includes(c)) return 'mode';
  return null;
};

export const CATEGORY_LABELS: Record<string, string> = {
  hauts:          'Hauts',
  bas:            'Bas',
  robes:          'Robes',
  vestes:         'Vestes',
  chaussures:     'Chaussures',
  accessoires:    'Accessoires',
  parfums:        'Parfums',
  'soins-visage': 'Soins visage',
  'soins-corps':  'Soins corps',
  cheveux:        'Cheveux',
  maquillage:     'Maquillage',
  autre:          'Autre',
};

export const GENDERS = ['femme', 'homme', 'unisexe'] as const;

export const PRICE_RANGES = [
  { value: '0-20',   label: '0 – 20 DT' },
  { value: '20-50',  label: '20 – 50 DT' },
  { value: '50-100', label: '50 – 100 DT' },
  { value: '100+',   label: '100 DT et +' },
] as const;
