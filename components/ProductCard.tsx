'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cn, conditionLabel, conditionColor } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  showCondition?: boolean;
}

export default function ProductCard({ product, showCondition = true }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col"
    >
      {/* Image */}
      <Link href={`/product/${product.id}`} className="relative block overflow-hidden aspect-[3/4] bg-gray-100">
        {product.images && product.images.length > 0 && product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
            <span className="text-[10px] uppercase tracking-widest font-semibold opacity-40">Sans image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNewArrival && (
            <span className="bg-brand-black text-white text-[9px] tracking-widest uppercase font-semibold px-2 py-1">
              Nouveau
            </span>
          )}
          {product.isPromo && (
            <span className="bg-red-600 text-white text-[9px] tracking-widest uppercase font-semibold px-2 py-1">
              Promo
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          suppressHydrationWarning
          className={cn(
            'absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm transition-all duration-200',
            'opacity-0 group-hover:opacity-100 hover:bg-white',
            wishlisted && '!opacity-100'
          )}
          aria-label="Wishlist"
        >
          <Heart
            size={14}
            strokeWidth={1.5}
            className={cn('transition-colors', wishlisted ? 'fill-red-500 stroke-red-500' : 'stroke-gray-700')}
          />
        </button>

        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            suppressHydrationWarning
            className="w-full bg-brand-black/90 backdrop-blur-sm text-white text-[10px] tracking-widest uppercase font-semibold py-3 flex items-center justify-center gap-2 hover:bg-brand-black transition-colors"
          >
            <ShoppingBag size={12} />
            Ajouter au panier
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="pt-3 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${product.id}`} className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-wider truncate">{product.category}</p>
            <h3 className="text-sm font-medium text-brand-black mt-0.5 truncate hover:underline underline-offset-2">
              {product.name}
            </h3>
          </Link>
          <div className="flex-shrink-0 text-right">
            {product.isPromo && product.promoPrice ? (
              <div>
                <span className="text-red-600 font-semibold text-sm">{product.promoPrice}€</span>
                <span className="text-gray-400 text-xs line-through ml-1">{product.price}€</span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-brand-black">{product.price}€</span>
            )}
          </div>
        </div>

        {showCondition && (
          <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded-sm w-fit', conditionColor(product.condition))}>
            {conditionLabel(product.condition)}
          </span>
        )}
      </div>
    </motion.div>
  );
}
