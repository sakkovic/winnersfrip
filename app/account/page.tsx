'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, ShoppingBag, Heart, LogOut, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function AccountPage() {
  const { currentUser, logout, isAdmin } = useAuth();
  const { cart } = useCart();
  const { wishlistCount } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) router.push('/login');
  }, [currentUser, router]);

  if (!currentUser) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const stats = [
    { label: 'Panier', value: cart.length, icon: ShoppingBag, href: '/cart' },
    { label: 'Favoris', value: wishlistCount, icon: Heart, href: '/wishlist' },
  ];

  const menuItems = [
    { label: 'Mes réservations', icon: ShoppingBag, href: '/account/reservations', desc: 'Historique & annulation' },
    { label: 'Liste de souhaits', icon: Heart, href: '/wishlist', desc: `${wishlistCount} article${wishlistCount > 1 ? 's' : ''}` },
    ...(isAdmin ? [{ label: 'Administration', icon: Shield, href: '/admin', desc: 'Gérer les produits & réservations', admin: true }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Profile header */}
          <div className="bg-white p-6 mb-4 flex items-center gap-5">
            <div className="w-14 h-14 bg-brand-black rounded-full flex items-center justify-center flex-shrink-0">
              {currentUser.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentUser.photoURL} alt="avatar" className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <User size={24} className="text-white" strokeWidth={1.5} />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-brand-black truncate">
                {currentUser.displayName ?? 'Mon Compte'}
              </h1>
              <p className="text-sm text-gray-400 truncate">{currentUser.email}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase bg-brand-black text-white px-2 py-0.5 mt-1">
                  <Shield size={9} /> Administrateur
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {stats.map((s) => (
              <Link key={s.label} href={s.href} className="bg-white p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors group">
                <div className="w-10 h-10 border border-gray-100 flex items-center justify-center group-hover:border-gray-300 transition-colors">
                  <s.icon size={18} strokeWidth={1.5} className="text-brand-black" />
                </div>
                <div>
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Menu */}
          <div className="bg-white divide-y divide-gray-50">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors group"
              >
                <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 ${item.admin ? 'bg-brand-black' : 'border border-gray-100'}`}>
                  <item.icon size={16} strokeWidth={1.5} className={item.admin ? 'text-white' : 'text-gray-600'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${item.admin ? 'text-brand-black' : 'text-gray-800'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
              </Link>
            ))}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-5 hover:bg-red-50 transition-colors group text-left"
            >
              <div className="w-9 h-9 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:border-red-200 transition-colors">
                <LogOut size={16} strokeWidth={1.5} className="text-gray-600 group-hover:text-red-500 transition-colors" />
              </div>
              <p className="text-sm font-medium text-gray-800 group-hover:text-red-600 transition-colors">
                Se déconnecter
              </p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
