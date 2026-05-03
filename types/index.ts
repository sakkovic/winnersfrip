export type ProductCondition = 'neuf' | 'comme_neuf' | 'seconde_main';
export type ProductOrigin = 'europe' | 'local';
export type ProductGender = 'homme' | 'femme' | 'unisexe';
export type ProductStyle = 'streetwear' | 'vintage' | 'sport' | 'chic' | 'y2k' | 'minimaliste';
export type ProductCategory = 'hauts' | 'bas' | 'robes' | 'vestes' | 'chaussures' | 'accessoires';

export interface Product {
  id: string;
  name: string;
  slug: string;
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
  isNewArrival?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
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
