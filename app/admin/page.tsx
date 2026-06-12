'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Plus, Pencil, Trash2, X, Check, Shield, Package,
  Loader2, Search, RefreshCw,
  ExternalLink, Tag, AlertCircle, Upload, ImageIcon,
} from 'lucide-react';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  deleteField,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  CATEGORIES, GENDERS, MODE_CATEGORIES, BEAUTE_CATEGORIES,
  COLORS, CLOTHING_SIZES, SHOE_SIZES,
  DEPARTMENTS, DEPARTMENT_LABELS, CATEGORY_LABELS, departmentForCategory,
} from '@/lib/constants';
import type { Product, ProductCategory } from '@/types';

// ─── Admin Table Row ──────────────────────────────────────────────────────────

function ToggleBtn({ active, onClick, title, activeColor, icon: Icon }: {
  active: boolean; onClick: () => void; title: string; activeColor: string; icon: React.ElementType;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded-sm transition-all flex items-center gap-1',
        active ? activeColor : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50',
      )}
    >
      <Icon size={13} strokeWidth={1.8} />
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts]     = useState<(Product & { id: string })[]>([]);
  const [fetching, setFetching]     = useState(true);
  const [search, setSearch]         = useState('');
  const [catFilter, setCatFilter]   = useState<ProductCategory | 'all'>('all');
  const [statusFilter, setStatus]   = useState<'all' | 'promo'>('all');
  const [formOpen, setFormOpen]     = useState(false);
  const [editTarget, setEditTarget] = useState<(Partial<FormData> & { id?: string }) | null>(null);
  const [saving, setSaving]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting]     = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) router.push('/login');
  }, [currentUser, isAdmin, authLoading, router]);

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const snap = await getDocs(collection(db, 'products'));
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product & { id: string })));
    } catch (err) {
      console.error('fetchProducts failed', err);
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setFetchError(msg);
      toast.error('Impossible de charger les produits.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) fetchProducts(); }, [isAdmin, fetchProducts]);

  const handleToggle = async (id: string, key: keyof Product, value: unknown) => {
    // Optimistic update — snapshot the previous value so we can rollback on failure.
    const previous = products.find((p) => p.id === id)?.[key];
    setProducts((p) => p.map((x) => (x.id === id ? { ...x, [key]: value } : x)));
    try {
      await updateDoc(doc(db, 'products', id), { [key]: value });
    } catch (err) {
      console.error('handleToggle failed', err);
      // Rollback the optimistic update so the UI reflects server state.
      setProducts((p) => p.map((x) => (x.id === id ? { ...x, [key]: previous } : x)));
      toast.error('Modification refusée par le serveur.');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts((p) => p.filter((x) => x.id !== id));
      setConfirmDelete(null);
      toast.success('Produit supprimé.');
    } catch (err) {
      console.error('handleDelete failed', err);
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      toast.error(`Suppression refusée: ${msg}`);
    } finally {
      setDeleting(null);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-300" />
      </div>
    );
  }

  // Filtering
  const displayed = products.filter((p) => {
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    if (statusFilter === 'promo' && !p.isPromo) return false;
    if (search) {
      const q = search.toLowerCase();
      const haystack = [
        p.name,
        p.brand,
        p.category,
        p.description,
      ].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  // Stats
  const stats = {
    total: products.length,
    promo: products.filter((p) => p.isPromo).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sticky top bar — sits flush under the global navbar (64 px nav) */}
      <div className="bg-white border-b border-gray-100 sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1">
            <Shield size={16} strokeWidth={1.5} className="text-brand-black flex-shrink-0" />
            <h1 className="text-xs font-bold tracking-widest uppercase flex-shrink-0">Administration</h1>
            <span className="text-xs text-gray-400 hidden sm:inline flex-shrink-0">— {products.length} produit{products.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchProducts} title="Actualiser" className="p-2 text-gray-400 hover:text-brand-black transition-colors">
              <RefreshCw size={14} className={fetching ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => { setEditTarget(null); setFormOpen(true); }}
              className="flex items-center gap-1.5 bg-brand-black text-white text-[11px] font-bold tracking-widest uppercase px-4 py-2 hover:bg-gray-800 transition-colors"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">Ajouter un produit</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

        {/* Navigation buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/admin/clients"
            className="bg-white border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-brand-black transition-colors group"
          >
            <span className="text-[11px] font-bold tracking-widest uppercase text-brand-black">Clients</span>
            <span className="text-gray-300 group-hover:text-brand-black transition-colors">→</span>
          </Link>
          <Link
            href="/admin/reservations"
            className="bg-white border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-brand-black transition-colors group"
          >
            <span className="text-[11px] font-bold tracking-widest uppercase text-brand-black">Réservations</span>
            <span className="text-gray-300 group-hover:text-brand-black transition-colors">→</span>
          </Link>
          <Link
            href="/admin/avis"
            className="bg-white border border-gray-200 px-4 py-3 flex items-center justify-between hover:border-brand-black transition-colors group"
          >
            <span className="text-[11px] font-bold tracking-widest uppercase text-brand-black">Avis</span>
            <span className="text-gray-300 group-hover:text-brand-black transition-colors">→</span>
          </Link>
        </div>

        {/* Stats strip — clickable to filter */}
        <div className="grid grid-cols-2 gap-3">
          {([
            { key: 'total', label: 'Total',  color: 'bg-gray-900 text-white', filter: 'all'   as const },
            { key: 'promo', label: 'Promos', color: 'bg-red-600 text-white',  filter: 'promo' as const },
          ] as const).map((s) => {
            const active = statusFilter === s.filter;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStatus(s.filter)}
                aria-pressed={active}
                className={cn(
                  'bg-white p-4 flex items-center gap-3 border text-left transition-all',
                  active
                    ? 'border-brand-black shadow-sm'
                    : 'border-gray-100 hover:border-gray-300',
                )}
              >
                <span className={cn('text-xs font-bold w-8 h-8 flex items-center justify-center flex-shrink-0', s.color)}>
                  {stats[s.key]}
                </span>
                <span className="text-[11px] text-gray-500 font-medium">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 bg-white pl-8 pr-3 py-2 text-xs outline-none focus:border-brand-black transition-colors w-52"
            />
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {(['all', ...CATEGORIES] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c as ProductCategory | 'all')}
                className={cn(
                  'text-[11px] font-medium px-2.5 py-1.5 capitalize transition-colors border',
                  catFilter === c
                    ? 'bg-brand-black text-white border-brand-black'
                    : 'border-gray-200 text-gray-500 hover:border-gray-400 bg-white',
                )}
              >
                {c === 'all' ? 'Tout' : (CATEGORY_LABELS[c] ?? c)}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value as typeof statusFilter)}
            className="border border-gray-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-brand-black transition-colors cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="promo">En promo</option>
          </select>

          {displayed.length !== products.length && (
            <span className="text-xs text-gray-400">{displayed.length} résultat{displayed.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Table — responsive card layout on mobile, grid on desktop */}
        <div className="bg-white border border-gray-100">
          <div>
          {/* Header */}
          <div className="hidden sm:grid sm:grid-cols-[56px_1fr_80px_auto_110px] gap-4 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            {['', 'Produit', 'Prix', 'Statuts', 'Actions'].map((h) => (
              <span key={h} className="text-[9px] font-bold tracking-widest uppercase text-gray-400">{h}</span>
            ))}
          </div>

          {fetching ? (
            <div>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:grid sm:grid-cols-[56px_1fr_80px_auto_110px] gap-3 sm:gap-4 sm:items-center px-4 py-3 border-b border-gray-50 last:border-b-0 animate-pulse"
                >
                  <div className="flex gap-3 sm:contents">
                    <div className="w-12 h-14 bg-gray-100" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-gray-100 w-2/3" />
                      <div className="h-2 bg-gray-100 w-1/3" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:contents">
                    <div className="h-3 bg-gray-100 w-10 sm:ml-auto" />
                    <div className="flex items-center gap-2 sm:contents">
                      <div className="h-4 bg-gray-100 w-16" />
                      <div className="h-4 bg-gray-100 w-20 sm:ml-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : fetchError ? (
            <div className="text-center py-16 px-6">
              <AlertCircle size={32} strokeWidth={1} className="text-red-300 mx-auto mb-3" />
              <p className="text-sm text-gray-700 font-medium mb-1">
                Impossible de charger les produits
              </p>
              <p className="text-xs text-gray-400 mb-5 max-w-md mx-auto break-words">
                {fetchError}
              </p>
              <button
                onClick={fetchProducts}
                className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={12} /> Réessayer
              </button>
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-16">
              <Package size={36} strokeWidth={0.8} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 mb-5">
                {products.length === 0
                  ? 'Aucun produit dans Firestore. Ajoutez le premier.'
                  : 'Aucun produit ne correspond aux filtres.'}
              </p>
              {products.length === 0 ? (
                <button
                  onClick={() => { setEditTarget(null); setFormOpen(true); }}
                  className="inline-flex items-center gap-2 bg-brand-black text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-gray-800 transition-colors"
                >
                  <Plus size={12} /> Ajouter un produit
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSearch('');
                    setCatFilter('all');
                    setStatus('all');
                  }}
                  className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {displayed.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col sm:grid sm:grid-cols-[56px_1fr_80px_auto_110px] gap-3 sm:gap-4 sm:items-center px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-3 sm:contents">
                  {/* Thumb */}
                  <div className="w-12 h-14 bg-gray-100 overflow-hidden relative flex-shrink-0">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.name ?? ''} fill className="object-cover" sizes="48px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={14} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 font-medium capitalize">{p.category}</span>
                      {(p.stockQuantity ?? 1) > 1 ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 font-medium tabular-nums">
                          ×{p.stockQuantity}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">×1</span>
                      )}
                      <span className="text-[10px] text-gray-400 capitalize">{p.gender}</span>
                    </div>
                  </div>
                  </div>

                  <div className="flex items-center justify-between sm:contents mt-1 sm:mt-0">
                  {/* Price */}
                  <div className="text-right">
                    {p.isPromo && p.promoPrice ? (
                      <>
                        <p className="text-sm font-bold text-red-600">{p.promoPrice} DT</p>
                        <p className="text-[10px] text-gray-400 line-through">{p.price} DT</p>
                      </>
                    ) : (
                      <p className="text-sm font-bold">{p.price} DT</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:contents">
                  {/* Toggles */}
                  <div className="flex items-center gap-0.5">
                    <ToggleBtn
                      active={!!p.isPromo}
                      onClick={() => handleToggle(p.id, 'isPromo', !p.isPromo)}
                      title={p.isPromo ? 'Promotion active' : 'Activer la promotion'}
                      activeColor="text-red-600 bg-red-50"
                      icon={Tag}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 border-l border-gray-100 pl-2 sm:border-none sm:pl-0">
                    <Link
                      href={`/product/${p.id}`}
                      target="_blank"
                      className="p-1.5 text-gray-300 hover:text-blue-500 transition-colors"
                      title="Voir sur le site"
                    >
                      <ExternalLink size={13} />
                    </Link>
                    <button
                      onClick={() => { setEditTarget(p); setFormOpen(true); }}
                      className="p-1.5 text-gray-400 hover:text-brand-black transition-colors"
                      title="Modifier"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(p.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          </div>
        </div>

        {/* Firestore empty note */}
        {products.length === 0 && !fetching && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Base de données vide</p>
              <p className="text-xs">Firestore est vide — le site affichera une boutique vide. Cliquez sur &quot;Ajouter un produit&quot; pour créer votre première fiche.</p>
            </div>
          </div>
        )}
      </div>

      

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDelete && (() => {
          const target = products.find((p) => p.id === confirmDelete);
          if (!target) return null;
          const isDeleting = deleting === target.id;
          return (
            <div
              className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
              onClick={() => !isDeleting && setConfirmDelete(null)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full sm:max-w-md flex flex-col"
              >
                <div className="px-6 py-5 border-b border-gray-100 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Trash2 size={18} className="text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 id="delete-modal-title" className="text-sm font-bold tracking-widest uppercase text-brand-black">
                      Supprimer ce produit ?
                    </h2>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                      Cette action est définitive et ne peut pas être annulée.
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
                  <div className="relative w-14 h-16 bg-gray-100 overflow-hidden flex-shrink-0">
                    {target.images?.[0] ? (
                      <Image src={target.images[0]} alt={target.name ?? ''} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={14} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{target.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                      ID: {target.id} · {target.price} DT
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 px-6 py-4 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(null)}
                    disabled={isDeleting}
                    className="flex-1 border border-gray-200 bg-white text-xs font-bold tracking-widest uppercase py-3 hover:bg-gray-50 transition-colors disabled:opacity-60"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(target.id)}
                    disabled={isDeleting}
                    className="flex-1 bg-red-600 text-white text-xs font-bold tracking-widest uppercase py-3 hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isDeleting && <Loader2 size={13} className="animate-spin" />}
                    {isDeleting ? 'Suppression…' : 'Supprimer'}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
