'use client';

import Link from 'next/link';
import { Instagram, Facebook, Twitter } from 'lucide-react';

// Column 1 — Boutique : top-level destinations
const shopLinks = [
  { href: '/shop',                   label: 'Toute la boutique' },
  { href: '/shop?department=mode',   label: 'Mode' },
  { href: '/shop?department=beaute', label: 'Beauté' },
  { href: '/shop?category=parfums',  label: 'Parfums' },
];

// Column 2 — Catégories : narrower beauty subsections
const categoryLinks = [
  { href: '/shop?category=soins-visage', label: 'Soins visage' },
  { href: '/shop?category=cheveux',      label: 'Cheveux' },
  { href: '/shop?new=true',              label: 'Nouveautés' },
];

const helpLinks = [
  { href: '/faq',     label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

function ColumnLinks({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="hidden sm:block col-span-1">
      <h4 className="text-[10px] sm:text-xs tracking-[0.25em] uppercase font-semibold mb-3 sm:mb-4 text-brand-gold-soft">
        {title}
      </h4>
      <ul className="space-y-1.5 sm:space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs sm:text-sm transition-colors duration-300"
            >
              <span className="w-0 group-hover:w-3 h-px bg-brand-gold-soft transition-all duration-400 ease-expo-out" />
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="relative bg-brand-black text-white overflow-hidden">
      {/* Decorative gold lines */}
      <div className="absolute inset-x-0 top-0 h-px bg-gold-line opacity-60" />
      <div className="absolute -top-32 right-1/4 w-80 h-80 rounded-full bg-brand-warm/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-1 lg:col-span-2 flex flex-col items-center sm:items-start text-center sm:text-left">
            <span className="font-display text-lg tracking-tight block mb-2">
              Winners<span className="text-gold-gradient italic mx-0.5">·</span>Mode
            </span>
            <p className="hidden sm:block text-gray-400 text-xs leading-relaxed mb-4 max-w-xs">
              La mode durable, vintage et streetwear. Pièces uniques importées d&apos;Europe.
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-2.5">
              {[
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Facebook,  label: 'Facebook'  },
                { Icon: Twitter,   label: 'Twitter'   },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href={label === 'Instagram' ? 'https://instagram.com/winners.mode' : label === 'Facebook' ? 'https://facebook.com/winners.mode' : '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group relative w-8 h-8 flex items-center justify-center border border-white/10 text-gray-400 hover:text-white hover:border-brand-warm overflow-hidden transition-all duration-500 ease-expo-out"
                >
                  <span className="absolute inset-0 bg-gradient-to-br from-brand-warm to-brand-gold-dark scale-0 group-hover:scale-100 transition-transform duration-500 ease-expo-out" />
                  <Icon size={14} strokeWidth={1.5} className="relative z-10" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <ColumnLinks title="Boutique"   links={shopLinks} />
          <ColumnLinks title="Catégories" links={categoryLinks} />

          {/* Aide + Newsletter combined column */}
          <div className="hidden sm:block col-span-2 sm:col-span-2 lg:col-span-1">
            <h4 className="text-[10px] sm:text-xs tracking-[0.25em] uppercase font-semibold mb-3 sm:mb-4 text-brand-gold-soft">
              Aide
            </h4>
            <ul className="space-y-1.5 sm:space-y-2 mb-5">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-gray-400 hover:text-white text-xs sm:text-sm transition-colors duration-300"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-brand-gold-soft transition-all duration-400 ease-expo-out" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <h4 className="text-[10px] sm:text-xs tracking-[0.25em] uppercase font-semibold mb-2 text-brand-gold-soft">
              Newsletter
            </h4>
            <form className="flex gap-1.5" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="votre@email.com"
                suppressHydrationWarning
                className="flex-1 bg-white/10 text-white placeholder-gray-500 text-xs px-2.5 py-2 outline-none focus:bg-white/15 focus:ring-1 focus:ring-brand-gold-soft transition-all min-w-0"
              />
              <button
                type="submit"
                suppressHydrationWarning
                className="group relative overflow-hidden bg-white text-brand-black text-[10px] font-semibold tracking-wider uppercase px-2.5 py-2 whitespace-nowrap flex-shrink-0"
              >
                <span className="absolute inset-0 bg-brand-gold-soft -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-expo-out" />
                <span className="relative z-10">OK</span>
              </button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-5 sm:mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-[10px] sm:text-xs">
            © {new Date().getFullYear()} Winners Mode. Tous droits réservés.
          </p>
          <div className="flex items-center gap-5">
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
