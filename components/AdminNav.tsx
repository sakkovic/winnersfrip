'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Users, ShoppingBag, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/admin', label: 'Produits', icon: Package },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/reservations', label: 'Réservations', icon: ShoppingBag },
  { href: '/admin/avis', label: 'Avis', icon: Star },
];

/**
 * Admin section tabs — visible on every screen size (horizontally scrollable on
 * mobile) so the boutique can be managed from a phone.
 */
export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="border-t border-gray-100 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex items-center gap-0.5">
        {TABS.map((t) => {
          const active = t.href === '/admin' ? pathname === '/admin' : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-bold tracking-wider uppercase whitespace-nowrap border-b-2 transition-colors',
                active
                  ? 'border-brand-black text-brand-black'
                  : 'border-transparent text-gray-400 hover:text-brand-black',
              )}
            >
              <t.icon size={13} strokeWidth={1.8} /> {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
