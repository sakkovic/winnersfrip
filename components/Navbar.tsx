'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { ShoppingBag, Heart, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/shop',                  label: 'Boutique' },
  { href: '/shop?department=mode',  label: 'Mode' },
  { href: '/shop?department=beaute', label: 'Beauté' },
  { href: '/shop?new=true',         label: 'Nouveautés' },
  { href: '/contact',               label: 'Contact' },
];

const announcements = [
  'BOUTIQUE À MONASTIR · MODE & BEAUTÉ',
  'PIÈCES UNIQUES IMPORTÉES D\'EUROPE',
  'NOUVEAUX ARRIVAGES CHAQUE SEMAINE',
];

function Badge({ count }: { count: number }) {
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          className="absolute top-1 right-1 bg-brand-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium tabular-nums"
        >
          {count}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { currentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [announceIndex, setAnnounceIndex] = useState(0);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => setIsScrolled(y > 20));

  useEffect(() => {
    setIsMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Rotate announcement bar
  useEffect(() => {
    const id = setInterval(() => {
      setAnnounceIndex((i) => (i + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {/* ── Announcement bar ── */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-7 overflow-hidden bg-brand-black text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={announceIndex}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="h-full flex items-center justify-center text-[10px] tracking-[0.3em] font-medium"
          >
            <span className="text-gold-shimmer">{announcements[announceIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <motion.header
        initial={false}
        animate={{
          y: 28,
          backgroundColor: isScrolled ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.96)',
          boxShadow: isScrolled ? '0 10px 30px -20px rgba(0,0,0,0.18)' : '0 0 0 rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'border-b border-gray-100/80',
          'backdrop-saturate-150 backdrop-blur-lg'
        )}
        style={{ willChange: 'transform, background-color' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2 hover:text-brand-warm transition-colors"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              suppressHydrationWarning
            >
              <Menu size={22} strokeWidth={1.5} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group">
              <Image
                src="/logo.png"
                alt="Winners Superfrip"
                width={120}
                height={48}
                className="h-10 w-auto object-contain transition-transform duration-500 ease-expo-out group-hover:scale-[1.04]"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const active = pathname === link.href.split('?')[0] && (link.href.includes('?') ? false : true);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-active={active}
                    className={cn(
                      'link-underline text-xs tracking-widest uppercase font-medium transition-colors duration-300',
                      active ? 'text-brand-black' : 'text-gray-500 hover:text-brand-black'
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-1">
              <button
                className="p-2 text-gray-600 hover:text-brand-warm transition-colors duration-300"
                onClick={() => setSearchOpen((o) => !o)}
                aria-label="Search"
                suppressHydrationWarning
              >
                <Search size={20} strokeWidth={1.5} />
              </button>

              <Link href="/wishlist" className="p-2 text-gray-600 hover:text-brand-warm transition-colors duration-300 relative">
                <Heart size={20} strokeWidth={1.5} />
                <Badge count={wishlistCount} />
              </Link>

              <Link
                href={currentUser ? '/account' : '/login'}
                className="p-2 text-gray-600 hover:text-brand-warm transition-colors duration-300"
              >
                <User size={20} strokeWidth={1.5} />
              </Link>

              <Link
                href="/cart"
                className="p-2 text-gray-600 hover:text-brand-warm transition-colors duration-300 relative"
                aria-label="Voir le panier"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                <Badge count={cartCount} />
              </Link>
            </div>
          </div>
        </div>

        {/* Gold hairline at bottom of bar */}
        <div className="absolute left-0 right-0 bottom-0 h-px bg-gold-line opacity-40 pointer-events-none" />

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-gray-100"
            >
              <div className="max-w-7xl mx-auto px-4 py-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
                    if (q) window.location.href = `/shop?q=${encodeURIComponent(q)}`;
                  }}
                  className="flex items-center gap-3 brand-focus"
                >
                  <Search size={16} className="text-brand-warm flex-shrink-0" />
                  <input
                    name="q"
                    type="text"
                    placeholder="Rechercher un article, une marque, un style..."
                    autoFocus
                    suppressHydrationWarning
                    className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent py-1"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="text-gray-400 hover:text-brand-black transition-colors"
                    aria-label="Fermer la recherche"
                    suppressHydrationWarning
                  >
                    <X size={16} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <span className="text-sm font-bold tracking-[0.2em] uppercase">
                  Winners<span className="text-gold-gradient">·</span>Superfrip
                </span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="hover:rotate-90 transition-transform duration-300"
                  aria-label="Fermer le menu"
                  suppressHydrationWarning
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-5">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between py-4 text-sm tracking-widest uppercase font-medium border-b border-gray-50 text-gray-700 hover:text-brand-warm transition-colors"
                    >
                      <span>{link.label}</span>
                      <span className="text-gray-300 group-hover:text-brand-warm group-hover:translate-x-1 transition-all duration-300">
                        →
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="p-5 border-t border-gray-100 space-y-3">
                <Link
                  href={currentUser ? '/account' : '/login'}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-brand-warm transition-colors"
                >
                  <User size={16} strokeWidth={1.5} />
                  {currentUser ? currentUser.displayName ?? 'Mon Compte' : 'Connexion'}
                </Link>
                <div className="gold-divider" />
                <p className="text-[10px] tracking-widest uppercase text-gray-400">
                  Monastir · Tunisie
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
