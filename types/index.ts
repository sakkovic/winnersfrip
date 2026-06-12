export type ProductGender = 'homme' | 'femme' | 'unisexe';

export type ProductDepartment = 'mode' | 'beaute';

export type ModeCategory =
  | 'hauts' | 'bas' | 'robes' | 'vestes' | 'chaussures' | 'accessoires';

export type BeauteCategory =
  | 'parfums' | 'soins-visage' | 'soins-corps' | 'cheveux' | 'maquillage';

// Catch-all subcategory, available under either department, for items that
// don't fit a specific category.
export type ProductCategory = ModeCategory | BeauteCategory | 'autre';

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
  description: string;
  /** Brand name (used mainly for beauty / branded fashion items). */
  brand?: string;
  /** Volume (e.g. "50ml", "200ml") for beauty products. */
  volume?: string;
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

export interface Review {
  /** Document id — equals the author's uid (one review per user). */
  id: string;
  userId: string;
  userName: string;
  /** Snapshot of the author's avatar URL (Google photo), if any. */
  userPhoto?: string | null;
  /** 1–5 */
  rating: number;
  comment?: string;
  status: 'published' | 'hidden';
  /** Creation time in epoch milliseconds (serialized for client components). */
  createdAt?: number;
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
  gender: ProductGender[];
  size: string[];
  color: string[];
  priceRange: string[];
  promotions: boolean;
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular';
