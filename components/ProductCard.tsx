'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cn, conditionLabel, conditionColor } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/lib/constants';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  showCondition?: boolean;
}

export default function ProductCard({ product, showCondition = true }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const primaryImage = product.images?.[0];
  const secondaryImage = product.images?.[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col"
    >
      {/* Image — uses a div wrapper + absolute Link overlay so floating action
          buttons (which include another <Link>) aren't nested inside an <a>. */}
      <div className="relative block overflow-hidden aspect-[3/4] bg-gray-100">
        {primaryImage ? (
          <>
            {/* Primary image */}
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover object-center transition-all duration-[900ms] ease-expo-out group-hover:scale-[1.08] group-hover:opacity-0"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {/* Secondary image — cross-fades in on hover */}
            {secondaryImage && (
              <Image
                src={secondaryImage}
                alt={`${product.name} alt`}
                fill
                className="object-cover object-center opacity-0 transition-all duration-[900ms] ease-expo-out group-hover:opacity-100 group-hover:scale-[1.08]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
            {/* Subtle gradient on hover for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <span className="text-[10px] uppercase tracking-widest font-semibold opacity-40">
              Sans image
            </span>
          </div>
        )}

        {/* Click-capture link — covers the whole image, sits below action buttons */}
        <Link
          href={`/product/${product.id}`}
          aria-label={product.name}
          className="absolute inset-0 z-[1]"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <AnimatePresence>
            {product.isNewArrival && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-brand-black text-white text-[9px] tracking-widest uppercase font-semibold px-2 py-1 shadow-sm"
              >
                Nouveau
              </motion.span>
            )}
            {product.isPromo && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-red-600 text-white text-[9px] tracking-widest uppercase font-semibold px-2 py-1 shadow-sm"
              >
                Promo
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Floating action stack — top-right */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            suppressHydrationWarning
            className={cn(
              'w-9 h-9 flex items-center justify-center bg-white/95 backdrop-blur-sm shadow-sm transition-all duration-400 ease-expo-out',
              'opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-white hover:scale-110',
              wishlisted && '!opacity-100 !translate-y-0'
            )}
            aria-label="Wishlist"
          >
            <motion.span
              key={wishlisted ? 'on' : 'off'}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
              className="flex"
            >
              <Heart
                size={15}
                strokeWidth={1.5}
                className={cn(
                  'transition-colors',
                  wishlisted ? 'fill-red-500 stroke-red-500' : 'stroke-gray-700'
                )}
              />
            </motion.span>
          </button>

          <Link
            href={`/product/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 flex items-center justify-center bg-white/95 backdrop-blur-sm shadow-sm opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-white hover:scale-110 transition-all duration-500 ease-expo-out"
            style={{ transitionDelay: '60ms' }}
            aria-label="Aperçu"
          >
            <Eye size={15} strokeWidth={1.5} className="text-gray-700" />
          </Link>
        </div>

        {/* Quick add — slides up from bottom */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-expo-out z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            suppressHydrationWarning
            className="group/btn relative w-full overflow-hidden bg-brand-black text-white text-[10px] tracking-widest uppercase font-semibold py-3.5 flex items-center justify-center gap-2"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-brand-warm via-brand-gold-light to-brand-warm bg-[length:200%_100%] -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500 ease-expo-out" />
            <ShoppingBag size={12} className="relative z-10" />
            <span className="relative z-10">Ajouter au panier</span>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${product.id}`} className="flex-1 min-w-0 group/link">
            <p className="text-[10px] text-brand-warm uppercase tracking-[0.2em] truncate font-semibold">
              {product.brand ?? CATEGORY_LABELS[product.category] ?? product.category}
            </p>
            <h3 className="text-sm font-medium text-brand-black mt-1 truncate transition-colors group-hover/link:text-brand-warm">
              <span className="link-underline">{product.name}</span>
            </h3>
          </Link>
          <div className="flex-shrink-0 text-right tabular-nums">
            {product.isPromo && product.promoPrice ? (
              <div>
                <span className="text-red-600 font-semibold text-sm">{product.promoPrice} DT</span>
                <span className="text-gray-400 text-xs line-through ml-1">{product.price} DT</span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-brand-black">{product.price} DT</span>
            )}
          </div>
        </div>

        {showCondition && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {/* For fashion items: condition badge. For beauty: volume badge. */}
            {product.department === 'beaute' ? (
              product.volume && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-sm w-fit bg-brand-cream text-brand-warm">
                  {product.volume}
                </span>
              )
            ) : (
              <span
                className={cn(
                  'text-[10px] font-medium px-1.5 py-0.5 rounded-sm w-fit',
                  conditionColor(product.condition),
                )}
              >
                {conditionLabel(product.condition)}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
