'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  collection, query, where, orderBy, getDocs, doc, updateDoc, Timestamp,
} from 'firebase/firestore';
import {
  Loader2, ShoppingBag, Phone, ChevronRight, Clock, AlertCircle, X,
  CheckCircle, RefreshCw,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { BOUTIQUE } from '@/lib/boutique-rules';
import { cn } from '@/lib/utils';

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
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
  items: ReservationItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  pickupDeadline?: Timestamp | { toDate(): Date } | null;
  createdAt?: Timestamp | { toDate(): Date } | null;
}

function statusMeta(status: Reservation['status']) {
  switch (status) {
    case 'pending':   return { label: 'En attente',   cls: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'confirmed': return { label: 'Confirmée',    cls: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'completed': return { label: 'Récupérée',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'cancelled': return { label: 'Annulée',      cls: 'bg-gray-100 text-gray-500 border-gray-200' };
    case 'expired':   return { label: 'Expirée',      cls: 'bg-red-50 text-red-700 border-red-200' };
  }
}

function formatDate(d: Timestamp | { toDate(): Date } | null | undefined) {
  if (!d) return '—';
  const date = 'toDate' in d ? d.toDate() : new Date(d as unknown as string);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function daysLeft(deadline: Timestamp | { toDate(): Date } | null | undefined) {
  if (!deadline) return null;
  const date = 'toDate' in deadline ? deadline.toDate() : new Date(deadline as unknown as string);
  const ms = date.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function ReservationsPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) router.push('/login');
  }, [authLoading, currentUser, router]);

  const fetchReservations = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'reservations'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc'),
      );
      const snap = await getDocs(q);
      setReservations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Reservation)));
    } catch (err) {
      console.error('fetchReservations failed', err);
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await updateDoc(doc(db, 'reservations', id), {
        status: 'cancelled',
        cancelledAt: new Date(),
      });
      setReservations((rs) =>
        rs.map((r) => (r.id === id ? { ...r, status: 'cancelled' } : r)),
      );
      toast.success('Réservation annulée. Merci de libérer la pièce.');
      setConfirmCancel(null);
    } catch (err) {
      console.error('cancel failed', err);
      toast.error('Annulation refusée. Réessayez ou contactez la boutique.');
    } finally {
      setCancelling(null);
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/account" className="hover:text-brand-black transition-colors">Compte</Link>
          <ChevronRight size={10} />
          <span className="text-brand-black">Mes réservations</span>
        </nav>

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-brand-warm font-semibold mb-2">
              Historique
            </p>
            <h1 className="font-display text-3xl sm:text-4xl tracking-tight">
              Mes <span className="italic text-gold-gradient">réservations</span>
            </h1>
          </div>
          <button
            onClick={fetchReservations}
            disabled={loading}
            className="hidden sm:inline-flex items-center gap-2 text-[11px] tracking-wider uppercase text-gray-400 hover:text-brand-black transition-colors"
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="bg-white border border-gray-100 p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="w-16 h-20 bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 w-2/3" />
                  <div className="h-2 bg-gray-100 w-1/3" />
                  <div className="h-2 bg-gray-100 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-red-200 p-8 text-center">
            <AlertCircle size={32} strokeWidth={1} className="text-red-400 mx-auto mb-3" />
            <p className="text-sm text-gray-700 font-medium mb-1">
              Impossible de charger vos réservations
            </p>
            <p className="text-xs text-gray-400 mb-5 max-w-md mx-auto break-words">{error}</p>
            <button
              onClick={fetchReservations}
              className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={12} /> Réessayer
            </button>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white border border-gray-100 p-12 text-center">
            <ShoppingBag size={40} strokeWidth={0.8} className="text-gray-200 mx-auto mb-4" />
            <p className="text-sm text-gray-500 mb-5">Vous n&apos;avez encore aucune réservation.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-brand-black text-white text-xs font-bold tracking-widest uppercase px-6 py-3 hover:bg-gray-800 transition-colors"
            >
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {reservations.map((r) => {
              const meta = statusMeta(r.status);
              const remaining = daysLeft(r.pickupDeadline);
              const isOverdue = r.status === 'pending' && remaining !== null && remaining < 0;
              const canCancel = r.status === 'pending';

              return (
                <li
                  key={r.id}
                  className={cn(
                    'bg-white border p-5 sm:p-6',
                    isOverdue ? 'border-red-200' : 'border-gray-100',
                  )}
                >
                  {/* Top row */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-1">
                        Réf. {r.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Créée le {formatDate(r.createdAt ?? null)}
                      </p>
                    </div>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 border',
                      meta.cls,
                    )}>
                      {meta.label}
                    </span>
                  </div>

                  {/* Pickup deadline */}
                  {r.status === 'pending' && r.pickupDeadline && (
                    <div className={cn(
                      'flex items-center gap-2 text-xs mb-4 p-3 border',
                      isOverdue
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-brand-gold-soft/30 bg-brand-cream/40 text-gray-700',
                    )}>
                      <Clock size={13} className={isOverdue ? 'text-red-500' : 'text-brand-warm'} />
                      <span>
                        {isOverdue
                          ? `Délai dépassé depuis ${Math.abs(remaining!)} jour${Math.abs(remaining!) > 1 ? 's' : ''}`
                          : remaining === 0
                            ? `Dernier jour pour récupérer : ${formatDate(r.pickupDeadline)}`
                            : `À récupérer avant le ${formatDate(r.pickupDeadline)} (${remaining} jour${remaining! > 1 ? 's' : ''})`}
                      </span>
                    </div>
                  )}

                  {/* Items */}
                  <ul className="space-y-2 mb-4">
                    {r.items.map((it, i) => (
                      <li key={`${it.id}-${i}`} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">
                          <span className="text-gray-400 tabular-nums mr-2">×{it.quantity}</span>
                          {it.name}
                          {it.selectedSize && (
                            <span className="text-gray-400"> · {it.selectedSize}</span>
                          )}
                        </span>
                        <span className="text-gray-600 tabular-nums">
                          {it.unitPrice * it.quantity} DT
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Footer: total + actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                    <p className="text-sm">
                      <span className="text-gray-500">Total : </span>
                      <span className="font-bold tabular-nums">{r.total} DT</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${BOUTIQUE.contactPhoneE164}`}
                        className="inline-flex items-center gap-1.5 text-xs text-brand-warm hover:text-brand-gold-dark transition-colors"
                      >
                        <Phone size={11} /> Contacter
                      </a>
                      {canCancel && (
                        confirmCancel === r.id ? (
                          <span className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleCancel(r.id)}
                              disabled={cancelling === r.id}
                              className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1.5 hover:bg-red-700 transition-colors disabled:opacity-60"
                            >
                              {cancelling === r.id
                                ? <Loader2 size={11} className="animate-spin" />
                                : <CheckCircle size={11} />}
                              Confirmer
                            </button>
                            <button
                              onClick={() => setConfirmCancel(null)}
                              disabled={cancelling === r.id}
                              className="inline-flex items-center gap-1 border border-gray-200 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                            >
                              <X size={11} />
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setConfirmCancel(r.id)}
                            className="inline-flex items-center gap-1.5 border border-gray-200 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1.5 text-gray-600 hover:border-red-300 hover:text-red-600 transition-colors"
                          >
                            <X size={11} /> Annuler
                          </button>
                        )
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
