'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/shop', label: 'Boutique' },
  { href: '/shop?gender=femme', label: 'Femme' },
  { href: '/shop?gender=homme', label: 'Homme' },
  { href: '/shop?new=true', label: 'Nouveautés' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount, toggleCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled ? 'bg-white shadow-sm' : 'bg-white/95 backdrop-blur-sm',
          'border-b border-gray-100'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Winners Superfrip"
                width={120}
                height={48}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-xs tracking-widest uppercase font-medium transition-colors duration-200',
                    pathname === link.href ? 'text-brand-black' : 'text-gray-500 hover:text-brand-black'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-1">
              <button
                className="p-2 text-gray-600 hover:text-brand-black transition-colors"
                onClick={() => setSearchOpen((o) => !o)}
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>

              <Link href="/wishlist" className="p-2 text-gray-600 hover:text-brand-black transition-colors relative">
                <Heart size={20} strokeWidth={1.5} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href={currentUser ? '/account' : '/login'}
                className="p-2 text-gray-600 hover:text-brand-black transition-colors"
              >
                <User size={20} strokeWidth={1.5} />
              </Link>

              <button
                className="p-2 text-gray-600 hover:text-brand-black transition-colors relative"
                onClick={toggleCart}
                aria-label="Cart"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-brand-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-gray-100"
            >
              <div className="max-w-7xl mx-auto px-4 py-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
                    if (q) window.location.href = `/shop?q=${encodeURIComponent(q)}`;
                  }}
                  className="flex items-center gap-3"
                >
                  <Search size={16} className="text-gray-400 flex-shrink-0" />
                  <input
                    name="q"
                    type="text"
                    placeholder="Rechercher un article..."
                    autoFocus
                    className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)}>
                    <X size={16} className="text-gray-400" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <span className="text-sm font-bold tracking-[0.2em] uppercase">
                  Winners<span className="text-brand-warm">·</span>Superfrip
                </span>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-5">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      className="block py-3 text-sm tracking-widest uppercase font-medium border-b border-gray-50 text-gray-700 hover:text-brand-black transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="p-5 border-t border-gray-100">
                <Link
                  href={currentUser ? '/account' : '/login'}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <User size={16} strokeWidth={1.5} />
                  {currentUser ? currentUser.displayName ?? 'Mon Compte' : 'Connexion'}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
