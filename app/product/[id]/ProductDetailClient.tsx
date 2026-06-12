'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cn, maxCartQuantity } from '@/lib/utils';
import ProductGallery from '@/components/ProductGallery';
import type { Product } from '@/types';

interface Props {
  product: Product;
}

const AccordionItem = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-sm font-medium text-left hover:text-gray-600 transition-colors"
      >
        {title}
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pb-4 text-sm text-gray-500 leading-relaxed overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};

export default function ProductDetailClient({ product }: Props) {
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  // Defensive fallbacks for malformed Firestore documents
  const p = product as Product & { size?: string; color?: string; image?: string };
  const sizes  = p.sizes  ?? (p.size  ? [p.size]  : []);
  const colors = p.colors ?? (p.color ? [p.color] : []);
  const images = p.images ?? (p.image ? [p.image] : []);

  const [selectedSize, setSelectedSize]   = useState(sizes[0] ?? '');
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? '');
  const wishlisted = isWishlisted(product.id);

  // Cart cap: stockQuantity from the product (1 if absent), compared against
  // the quantity already in the cart for this exact id.
  const stockMax     = maxCartQuantity(product.stockQuantity);
  const inCartCount  = cart.find((i) => i.id === product.id)?.quantity ?? 0;
  const remaining    = Math.max(0, stockMax - inCartCount);
  const isAtMax      = remaining === 0;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <ProductGallery images={images} name={product.name} />

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <p className="text-xs tracking-widest uppercase text-gray-400 mb-1">{product.category}</p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-brand-black mb-3">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                {product.isPromo && product.promoPrice ? (
                  <>
                    <span className="text-2xl font-bold text-red-600">{product.promoPrice} DT</span>
                    <span className="text-lg text-gray-400 line-through">{product.price} DT</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">{product.price} DT</span>
                )}
              </div>

              <p className="text-sm text-gray-500 leading-relaxed">{product.description}</p>
            </div>

            {/* Color selector */}
            {colors.length > 1 && (
              <div className="mb-5">
                <p className="text-xs font-semibold tracking-widest uppercase mb-2.5">
                  Couleur: <span className="text-gray-500 font-normal capitalize">{selectedColor}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        'px-3 py-1.5 text-xs border capitalize transition-all',
                        selectedColor === color
                          ? 'border-brand-black bg-brand-black text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      )}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selector */}
            {sizes.length > 0 && sizes[0] !== 'unique' && (
              <div className="mb-6">
                <p className="text-xs font-semibold tracking-widest uppercase mb-2.5">
                  Taille: <span className="text-gray-500 font-normal">{selectedSize}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        'min-w-[44px] px-3 py-2 text-xs border font-medium transition-all',
                        selectedSize === size
                          ? 'border-brand-black bg-brand-black text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Availability line */}
            <div className="flex items-center gap-2 mb-4 text-[11px] tracking-wider uppercase">
              {stockMax > 1 ? (
                <>
                  <span className={cn(
                    'inline-block w-1.5 h-1.5 rounded-full',
                    isAtMax ? 'bg-amber-500' : 'bg-emerald-500',
                  )} />
                  <span className="text-gray-600 font-medium">
                    {isAtMax
                      ? `Limite atteinte — ${stockMax} dans le panier`
                      : `${remaining} disponible${remaining !== 1 ? 's' : ''}`}
                  </span>
                </>
              ) : (
                <>
                  <span className={cn(
                    'inline-block w-1.5 h-1.5 rounded-full',
                    isAtMax ? 'bg-amber-500' : 'bg-brand-warm',
                  )} />
                  <span className="text-gray-600 font-medium">
                    {isAtMax ? 'Déjà dans le panier' : 'Pièce unique'}
                  </span>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => addToCart(product, selectedSize, selectedColor)}
                disabled={isAtMax}
                className="flex-1 flex items-center justify-center gap-2 py-4 text-xs font-bold tracking-widest uppercase transition-colors bg-brand-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={16} strokeWidth={1.5} />
                {isAtMax ? 'Limite atteinte' : 'Ajouter au panier'}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={cn(
                  'w-14 flex items-center justify-center border transition-colors',
                  wishlisted
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                )}
                aria-label="Wishlist"
              >
                <Heart size={18} strokeWidth={1.5} className={wishlisted ? 'fill-red-500' : ''} />
              </button>
            </div>

            {/* Accordion — kept minimal: description only */}
            <div>
              <AccordionItem title="Description">
                <p>{product.description}</p>
              </AccordionItem>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-100 p-4 flex gap-3 z-40">
        <button
          onClick={() => addToCart(product, selectedSize, selectedColor)}
          disabled={isAtMax}
          className="flex-1 bg-brand-black text-white text-xs font-bold tracking-widest uppercase py-3.5 flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <ShoppingBag size={14} />
          {isAtMax ? 'Limite atteinte' : `Ajouter — ${product.price} DT`}
        </button>
      </div>
    </>
  );
}
