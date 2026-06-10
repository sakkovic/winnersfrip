export type ProductCondition = 'neuf' | 'comme_neuf' | 'seconde_main';
export type ProductOrigin = 'europe' | 'local';
export type ProductGender = 'homme' | 'femme' | 'unisexe';
export type ProductStyle = 'streetwear' | 'vintage' | 'sport' | 'chic' | 'y2k' | 'minimaliste';

export type ProductDepartment = 'mode' | 'beaute';

export type ModeCategory =
  | 'hauts' | 'bas' | 'robes' | 'vestes' | 'chaussures' | 'accessoires';

export type BeauteCategory =
  | 'parfums' | 'soins-visage' | 'soins-corps' | 'cheveux' | 'maquillage';

export type ProductCategory = ModeCategory | BeauteCategory;

export interface Product {
  id: string;
  name: string;
  slug: string;
  department: ProductDepartment;
  category: ProductCategory;
  gender: ProductGender;
  price: number;
  promoPrice?: number;
  isPromo?: boolean;
  currency: string;
  images: string[];
  colors: string[];
  sizes: string[];
  condition: ProductCondition;
  origin: ProductOrigin;
  style: ProductStyle;
  description: string;
  material?: string;
  /** Brand name (used mainly for beauty / branded fashion items). */
  brand?: string;
  /** Volume (e.g. "50ml", "200ml") for beauty products. */
  volume?: string;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  /**
   * Legacy boolean kept for backwards-compatibility with older data only.
   * Real availability is tracked via {@link Product.stockQuantity}.
   */
  inStock?: boolean;
  /**
   * Number of physical units the boutique has of this exact reference.
   * - undefined or 1 → singleton (most vintage / one-off pieces)
   * - N > 1          → multi-unit, cart can hold up to N copies
   * The cart adds/quantity-update logic enforces this cap.
   */
  stockQuantity?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'client';
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  createdAt: Date;
  shippingAddress: ShippingAddress;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface FilterState {
  department: ProductDepartment[];
  category: ProductCategory[];
  condition: ProductCondition[];
  origin: ProductOrigin[];
  gender: ProductGender[];
  style: ProductStyle[];
  size: string[];
  color: string[];
  priceRange: string[];
  promotions: boolean;
  newArrivals: boolean;
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular';
