'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, ShoppingBag, ArrowRight, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Metadata } from 'next';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  const shipping = cartTotal > 0 ? (cartTotal >= 80 ? 0 : 500) : 0;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag size={56} strokeWidth={0.8} className="text-gray-200 mb-6" />
        <h1 className="text-xl font-bold tracking-tight mb-2">Votre panier est vide</h1>
        <p className="text-gray-400 text-sm mb-8">Découvrez notre sélection de pièces uniques.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-brand-black text-white text-xs font-bold tracking-widest uppercase px-8 py-4 hover:bg-gray-800 transition-colors"
        >
          Voir la boutique <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-brand-black transition-colors">Accueil</Link>
          <ChevronRight size={10} />
          <span className="text-brand-black">Panier</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">
          Mon Panier <span className="text-gray-400 font-normal">({cart.length})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Items */}
          <div className="lg:col-span-2">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-5 py-5 border-b border-gray-100"
                >
                  <Link href={`/product/${item.id}`} className="flex-shrink-0">
                    <div className="relative w-24 h-32 sm:w-28 sm:h-36 bg-gray-100 overflow-hidden">
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.category}</p>
                        <h3 className="text-sm font-medium text-brand-black mt-0.5">{item.name}</h3>
                        {item.selectedSize && (
                          <p className="text-xs text-gray-400 mt-1">Taille: {item.selectedSize}</p>
                        )}
                        {item.selectedColor && (
                          <p className="text-xs text-gray-400 capitalize">Couleur: {item.selectedColor}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex-shrink-0 p-1 text-gray-300 hover:text-gray-600 transition-colors"
                        aria-label="Retirer du panier"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4">
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                      <span className="text-sm font-bold">
                        {(item.isPromo && item.promoPrice ? item.promoPrice : item.price) * item.quantity}€
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-brand-black transition-colors underline underline-offset-4"
              >
                ← Continuer les achats
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 sticky top-24">
              <h2 className="text-sm font-bold tracking-widest uppercase mb-6">Récapitulatif</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total</span>
                  <span className="font-medium">{cartTotal}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livraison</span>
                  <span className="font-medium">{shipping === 0 ? 'Gratuite' : `${shipping} DA`}</span>
                </div>
                {cartTotal > 0 && cartTotal < 80 && (
                  <p className="text-[10px] text-gray-400">
                    Plus que {80 - cartTotal}€ pour la livraison gratuite
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{cartTotal}€</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-brand-black text-white text-xs font-bold tracking-widest uppercase text-center py-4 hover:bg-gray-800 transition-colors"
              >
                Commander
              </Link>

              <p className="text-[10px] text-gray-400 text-center mt-3">
                Paiement sécurisé · Retour gratuit 14j
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
