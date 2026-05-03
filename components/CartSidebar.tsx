'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setIsCartOpen(false)}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold tracking-widest uppercase">
                Mon Panier {cart.length > 0 && <span className="text-gray-400">({cart.length})</span>}
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-1 hover:text-gray-500 transition-colors">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                  <ShoppingBag size={40} strokeWidth={1} className="text-gray-200" />
                  <p className="text-sm text-gray-500">Votre panier est vide.</p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-xs tracking-widest uppercase underline underline-offset-4 text-brand-black hover:text-gray-600 transition-colors"
                  >
                    Continuer les achats
                  </button>
                </div>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {cart.map((item) => (
                    <li key={item.id} className="flex gap-4 p-4">
                      <Link href={`/product/${item.id}`} onClick={() => setIsCartOpen(false)} className="flex-shrink-0">
                        <div className="relative w-20 h-24 bg-gray-100 overflow-hidden">
                        {item.images && item.images.length > 0 && item.images[0] ? (
                          <Image src={item.images[0]} alt={item.name} fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[8px] text-gray-400 uppercase tracking-widest text-center">
                            Sans image
                          </div>
                        )}
                        </div>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.category}</p>
                            <p className="text-sm font-medium text-brand-black truncate mt-0.5">{item.name}</p>
                            {item.selectedSize && (
                              <p className="text-xs text-gray-400 mt-0.5">Taille: {item.selectedSize}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex-shrink-0 text-gray-300 hover:text-gray-600 transition-colors p-0.5"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 border border-gray-200">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="text-xs w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                          <span className="text-sm font-semibold">
                            {(item.isPromo && item.promoPrice ? item.promoPrice : item.price) * item.quantity}€
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Sous-total</span>
                  <span className="text-base font-bold">{cartTotal}€</span>
                </div>
                <p className="text-[10px] text-gray-400 text-center">Frais de livraison calculés à la commande</p>
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full bg-brand-black text-white text-xs font-bold tracking-widest uppercase text-center py-4 hover:bg-gray-800 transition-colors"
                >
                  Commander
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setIsCartOpen(false)}
                  className="block w-full text-center text-xs text-gray-400 hover:text-brand-black transition-colors underline underline-offset-4"
                >
                  Voir le panier
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
