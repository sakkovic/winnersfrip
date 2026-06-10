'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  collection, getDocs, orderBy, query, doc, updateDoc, Timestamp,
} from 'firebase/firestore';
import {
  Loader2, Phone, Mail, Clock, RefreshCw, AlertCircle, ShoppingBag,
  Shield, CheckCircle, XCircle, ArrowLeft,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

interface ReservationItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
}

interface Reservation {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  visitDay?: string | null;
  items: ReservationItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  pickupDeadline?: Timestamp | { toDate(): Date } | null;
  createdAt?: Timestamp | { toDate(): Date } | null;
}

type StatusFilter = 'all' | Reservation['status'];

const STATUS_META: Record<Reservation['status'], { label: string; cls: string }> = {
  pending:   { label: 'En attente', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmée',  cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed: { label: 'Récupérée',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Annulée',    cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  expired:   { label: 'Expirée',    cls: 'bg-red-50 text-red-700 border-red-200' },
};

function formatDateTime(d: Timestamp | { toDate(): Date } | null | undefined) {
  if (!d) return '—';
  const date = 'toDate' in d ? d.toDate() : new Date(d as unknown as string);
  return date.toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(d: Timestamp | { toDate(): Date } | null | undefined) {
  if (!d) return '—';
  const date = 'toDate' in d ? d.toDate() : new Date(d as unknown as string);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysLeft(deadline: Timestamp | { toDate(): Date } | null | undefined) {
  if (!deadline) return null;
  const date = 'toDate' in deadline ? deadline.toDate() : new Date(deadline as unknown as string);
  return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminReservationsPage() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [fetching, setFetching]   = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<StatusFilter>('pending');
  const [busy, setBusy]           = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) router.push('/login');
  }, [currentUser, isAdmin, authLoading, router]);

  const fetchReservations = useCallback(async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setReservations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reservation)));
    } catch (err) {
      console.error('fetchReservations failed', err);
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setFetchError(msg);
      toast.error('Impossible de charger les réservations.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) fetchReservations(); }, [isAdmin, fetchReservations]);

  const setStatus = async (id: string, next: Reservation['status']) => {
    setBusy(id);
    try {
      await updateDoc(doc(db, 'reservations', id), { status: next });
      setReservations((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
      toast.success('Statut mis à jour.');
    } catch (err) {
      console.error('setStatus failed', err);
      toast.error('Mise à jour refusée.');
    } finally {
      setBusy(null);
    }
  };

  // Mark expired status virtually for pending reservations past their deadline.
  // (Server-side, a Cloud Function will eventually persist this — see
  // functions/src/expireReservations.ts for the cron.)
  const displayed = useMemo(() => {
    const term = search.trim().toLowerCase();
    return reservations
      .map((r) => {
        const overdue =
          r.status === 'pending' &&
          r.pickupDeadline &&
          daysLeft(r.pickupDeadline)! < 0;
        return { ...r, status: overdue ? ('expired' as const) : r.status };
      })
      .filter((r) => {
        if (filter !== 'all' && r.status !== filter) return false;
        if (!term) return true;
        const hay = [
          r.firstName,
          r.lastName,
          r.phone,
          r.email,
          r.id,
          ...r.items.map((it) => it.name),
        ].filter(Boolean).join(' ').toLowerCase();
        return hay.includes(term);
      });
  }, [reservations, search, filter]);

  const stats = useMemo(() => {
    const out = {
      total: reservations.length,
      pending: 0, confirmed: 0, completed: 0, cancelled: 0, expired: 0,
    } as Record<'total' | Reservation['status'], number>;
    for (const r of reservations) {
      const overdue =
        r.status === 'pending' &&
        r.pickupDeadline &&
        daysLeft(r.pickupDeadline)! < 0;
      const s = overdue ? 'expired' : r.status;
      out[s]++;
    }
    return out;
  }, [reservations]);

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top bar — sits flush under the global navbar (28 px announcement + 64 px nav) */}
      <div className="bg-white border-b border-gray-100 sticky top-[92px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-brand-black transition-colors">
              <ArrowLeft size={14} />
            </Link>
            <Shield size={14} strokeWidth={1.5} className="text-brand-black" />
            <h1 className="text-xs font-bold tracking-widest uppercase">Réservations</h1>
            <span className="text-xs text-gray-400 hidden sm:inline">— {stats.total}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchReservations}
              title="Actualiser"
              className="p-2 text-gray-400 hover:text-brand-black transition-colors"
            >
              <RefreshCw size={14} className={fetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Stats — clickable to filter */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {([
            { key: 'pending',   label: 'En attente', color: 'bg-amber-500 text-white' },
            { key: 'expired',   label: 'Expirées',   color: 'bg-red-600 text-white' },
            { key: 'confirmed', label: 'Confirmées', color: 'bg-blue-600 text-white' },
            { key: 'completed', label: 'Récupérées', color: 'bg-emerald-600 text-white' },
            { key: 'cancelled', label: 'Annulées',   color: 'bg-gray-700 text-white' },
          ] as const).map((s) => {
            const active = filter === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setFilter(active ? 'all' : s.key)}
                aria-pressed={active}
                className={cn(
                  'bg-white p-4 flex items-center gap-3 border text-left transition-all',
                  active ? 'border-brand-black shadow-sm' : 'border-gray-100 hover:border-gray-300',
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

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <input
              type="text"
              placeholder="Nom, téléphone, article, n° réf…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              suppressHydrationWarning
              className="w-full border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-brand-black transition-colors"
            />
          </div>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="text-[11px] tracking-wider uppercase text-gray-400 hover:text-brand-black transition-colors"
            >
              Voir tout
            </button>
          )}
          {(filter !== 'all' || search) && (
            <span className="text-xs text-gray-400">{displayed.length} résultat{displayed.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* List */}
        {fetching ? (
          <div className="bg-white border border-gray-100 p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="w-12 h-16 bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 w-2/3" />
                  <div className="h-2 bg-gray-100 w-1/3" />
                  <div className="h-2 bg-gray-100 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="bg-white border border-red-200 p-8 text-center">
            <AlertCircle size={32} strokeWidth={1} className="text-red-400 mx-auto mb-3" />
            <p className="text-sm text-gray-700 font-medium mb-1">Erreur de chargement</p>
            <p className="text-xs text-gray-400 mb-5 max-w-md mx-auto break-words">{fetchError}</p>
            <button
              onClick={fetchReservations}
              className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={12} /> Réessayer
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white border border-gray-100 p-12 text-center">
            <ShoppingBag size={40} strokeWidth={0.8} className="text-gray-200 mx-auto mb-4" />
            <p className="text-sm text-gray-500">
              {reservations.length === 0
                ? 'Aucune réservation pour l\'instant.'
                : 'Aucune réservation ne correspond aux filtres.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {displayed.map((r) => {
              const meta = STATUS_META[r.status];
              const remaining = daysLeft(r.pickupDeadline);
              const isOverdue = r.status === 'expired';

              return (
                <li
                  key={r.id}
                  className={cn(
                    'bg-white border p-5',
                    isOverdue ? 'border-red-200' : 'border-gray-100',
                  )}
                >
                  {/* Top row: identity + status */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {r.firstName} {r.lastName}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-gray-500">
                        <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 hover:text-brand-warm">
                          <Phone size={10} /> {r.phone}
                        </a>
                        {r.email && (
                          <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1 hover:text-brand-warm">
                            <Mail size={10} /> {r.email}
                          </a>
                        )}
                        <span className="text-gray-300">·</span>
                        <span className="tabular-nums">Réf. {r.id.slice(0, 8).toUpperCase()}</span>
                        <span className="text-gray-300">·</span>
                        <span>Créée {formatDateTime(r.createdAt ?? null)}</span>
                      </div>
                    </div>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 border whitespace-nowrap',
                      meta.cls,
                    )}>
                      {meta.label}
                    </span>
                  </div>

                  {/* Pickup deadline */}
                  {(r.status === 'pending' || r.status === 'expired') && r.pickupDeadline && (
                    <div className={cn(
                      'flex items-center gap-2 text-xs mb-4 p-2.5 border',
                      isOverdue
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : remaining! <= 1
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : 'border-brand-gold-soft/30 bg-brand-cream/40 text-gray-700',
                    )}>
                      <Clock size={12} />
                      <span>
                        {isOverdue
                          ? `Délai dépassé — ${formatDate(r.pickupDeadline)}`
                          : remaining === 0
                            ? `Dernier jour — ${formatDate(r.pickupDeadline)}`
                            : `À récupérer avant le ${formatDate(r.pickupDeadline)} (${remaining}j)`}
                      </span>
                    </div>
                  )}

                  {/* Items */}
                  <ul className="space-y-1.5 mb-4">
                    {r.items.map((it, i) => (
                      <li key={`${it.id}-${i}`} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700 min-w-0 truncate">
                          <span className="text-gray-400 tabular-nums mr-2">×{it.quantity}</span>
                          <Link href={`/product/${it.id}`} target="_blank" className="hover:text-brand-warm">
                            {it.name}
                          </Link>
                          {it.selectedSize && (
                            <span className="text-gray-400"> · {it.selectedSize}</span>
                          )}
                        </span>
                        <span className="text-gray-600 tabular-nums flex-shrink-0 ml-2">
                          {it.unitPrice * it.quantity} DT
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Notes */}
                  {r.notes && (
                    <p className="text-xs text-gray-500 italic bg-gray-50 p-2.5 mb-4 border-l-2 border-brand-gold-soft">
                      « {r.notes} »
                    </p>
                  )}

                  {/* Footer: total + actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <p className="text-sm">
                      <span className="text-gray-500">Total : </span>
                      <span className="font-bold tabular-nums">{r.total} DT</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                      {(r.status === 'pending' || r.status === 'expired') && (
                        <button
                          onClick={() => setStatus(r.id, 'confirmed')}
                          disabled={busy === r.id}
                          className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1.5 hover:bg-blue-700 transition-colors disabled:opacity-60"
                        >
                          {busy === r.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                          Confirmer
                        </button>
                      )}
                      {r.status === 'confirmed' && (
                        <button
                          onClick={() => setStatus(r.id, 'completed')}
                          disabled={busy === r.id}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1.5 hover:bg-emerald-700 transition-colors disabled:opacity-60"
                        >
                          {busy === r.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                          Récupérée
                        </button>
                      )}
                      {r.status !== 'cancelled' && r.status !== 'completed' && (
                        <button
                          onClick={() => setStatus(r.id, 'cancelled')}
                          disabled={busy === r.id}
                          className="inline-flex items-center gap-1.5 border border-gray-200 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1.5 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors"
                        >
                          <XCircle size={11} /> Annuler
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
