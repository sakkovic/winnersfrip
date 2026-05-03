'use client';

import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const shopLinks = [
  { href: '/shop', label: 'Toute la boutique' },
  { href: '/shop?gender=femme', label: 'Femme' },
  { href: '/shop?gender=homme', label: 'Homme' },
  { href: '/shop?new=true', label: 'Nouveautés' },
  { href: '/shop?condition=neuf', label: 'Articles Neufs' },
];

const helpLinks = [
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/shipping', label: 'Livraison & Retours' },
  { href: '/size-guide', label: 'Guide des Tailles' },
];

export default function Footer() {
  return (
    <footer className="bg-brand-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-1 flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="text-sm font-bold tracking-[0.2em] uppercase block mb-3 sm:mb-4">
              Winners<span className="text-brand-warm">·</span>Superfrip
            </span>
            <p className="hidden sm:block text-gray-400 text-sm leading-relaxed mb-6">
              La mode durable, vintage et streetwear. Pièces uniques importées d&apos;Europe à prix accessibles.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-4">
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={18} strokeWidth={1.5} />
              </a>
              <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Shop - Hidden on mobile */}
          <div className="hidden sm:block col-span-1">
            <h4 className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold mb-4 sm:mb-5 text-gray-300">Boutique</h4>
            <ul className="space-y-2 sm:space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help - Hidden on mobile */}
          <div className="hidden sm:block col-span-1">
            <h4 className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold mb-4 sm:mb-5 text-gray-300">Aide</h4>
            <ul className="space-y-2 sm:space-y-3">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter - Hidden on mobile */}
          <div className="hidden sm:block col-span-2 lg:col-span-1 mt-4 sm:mt-0">
            <h4 className="text-[10px] sm:text-xs tracking-widest uppercase font-semibold mb-3 sm:mb-5 text-gray-300">Newsletter</h4>
            <p className="text-gray-400 text-xs sm:text-sm mb-4">
              Recevez nos nouveautés et offres.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="votre@email.com"
                suppressHydrationWarning
                className="flex-1 bg-white/10 text-white placeholder-gray-500 text-xs sm:text-sm px-3 py-2 outline-none focus:bg-white/15 transition-colors min-w-0"
              />
              <button
                type="submit"
                suppressHydrationWarning
                className="bg-white text-brand-black text-[10px] sm:text-xs font-semibold tracking-wider uppercase px-3 py-2 hover:bg-gray-200 transition-colors whitespace-nowrap flex-shrink-0"
              >
                S&apos;inscrire
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-[10px] sm:text-xs">
            © {new Date().getFullYear()} Winners Superfrip. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-gray-500 hover:text-gray-300 text-[10px] sm:text-xs transition-colors">
              Confidentialité
            </Link>
            <Link href="/terms" className="text-gray-500 hover:text-gray-300 text-[10px] sm:text-xs transition-colors">
              CGV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
