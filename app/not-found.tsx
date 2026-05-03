import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-7xl font-bold text-gray-100 mb-4">404</p>
      <h1 className="text-xl font-bold tracking-tight mb-3">Page introuvable</h1>
      <p className="text-gray-400 text-sm mb-8">Cette page n&apos;existe pas ou a été déplacée.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-brand-black text-white text-xs font-bold tracking-widest uppercase px-6 py-3.5 hover:bg-gray-800 transition-colors"
      >
        Retour à l&apos;accueil <ArrowRight size={12} />
      </Link>
    </div>
  );
}
