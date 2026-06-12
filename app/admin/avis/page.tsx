'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import {
  Loader2, RefreshCw, AlertCircle, Shield, ArrowLeft, Trash2,
  Eye, EyeOff, Star, MessageSquare,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { cn, timeAgo } from '@/lib/utils';

interface AdminReview {
  id: string;
  userName: string;
  userPhoto?: string | null;
  rating: number;
  comment?: string;
  status: 'published' | 'hidden';
  createdAt?: { toDate(): Date } | null;
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={12}
          strokeWidth={1.5}
          className={n <= value ? 'fill-brand-warm text-brand-warm' : 'fill-gray-200 text-gray-200'}
        />
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) router.push('/login');
  }, [currentUser, isAdmin, authLoading, router]);

  const fetchReviews = useCallback(async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const snap = await getDocs(collection(db, 'reviews'));
      const rows = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          userName: typeof data.userName === 'string' ? data.userName : 'Client',
          userPhoto: typeof data.userPhoto === 'string' ? data.userPhoto : null,
          rating: typeof data.rating === 'number' ? data.rating : 0,
          comment: typeof data.comment === 'string' ? data.comment : '',
          status: data.status === 'hidden' ? 'hidden' : 'published',
          createdAt: data.createdAt ?? null,
        } as AdminReview;
      });
      rows.sort((a, b) => {
        const av = a.createdAt?.toDate?.().getTime?.() ?? 0;
        const bv = b.createdAt?.toDate?.().getTime?.() ?? 0;
        return bv - av;
      });
      setReviews(rows);
    } catch (err) {
      console.error('fetchReviews failed', err);
      setFetchError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast.error('Impossible de charger les avis.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) fetchReviews(); }, [isAdmin, fetchReviews]);

  const toggleStatus = async (id: string, current: AdminReview['status']) => {
    const next = current === 'published' ? 'hidden' : 'published';
    setBusy(id);
    setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, status: next } : r)));
    try {
      await updateDoc(doc(db, 'reviews', id), { status: next });
    } catch (err) {
      console.error('toggleStatus failed', err);
      setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, status: current } : r)));
      toast.error('Action refusée.');
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(id);
    try {
      await deleteDoc(doc(db, 'reviews', id));
      setReviews((rs) => rs.filter((r) => r.id !== id));
      setConfirmDelete(null);
      toast.success('Avis supprimé.');
    } catch (err) {
      console.error('delete review failed', err);
      toast.error('Suppression refusée.');
    } finally {
      setBusy(null);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-300" />
      </div>
    );
  }

  const published = reviews.filter((r) => r.status === 'published').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-brand-black transition-colors">
              <ArrowLeft size={14} />
            </Link>
            <Shield size={14} strokeWidth={1.5} className="text-brand-black" />
            <h1 className="text-xs font-bold tracking-widest uppercase">Avis clients</h1>
            <span className="text-xs text-gray-400 hidden sm:inline">— {published} publié{published !== 1 ? 's' : ''} / {reviews.length}</span>
          </div>
          <button onClick={fetchReviews} title="Actualiser" className="p-2 text-gray-400 hover:text-brand-black transition-colors">
            <RefreshCw size={14} className={fetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {fetching ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 p-5 animate-pulse flex gap-4">
                <div className="w-11 h-11 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 w-1/3" />
                  <div className="h-2 bg-gray-100 w-1/4" />
                  <div className="h-2 bg-gray-100 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="bg-white border border-red-200 p-8 text-center">
            <AlertCircle size={32} strokeWidth={1} className="text-red-400 mx-auto mb-3" />
            <p className="text-sm text-gray-700 font-medium mb-1">Erreur de chargement</p>
            <p className="text-xs text-gray-400 mb-5 break-words">{fetchError}</p>
            <button onClick={fetchReviews} className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors">
              <RefreshCw size={12} /> Réessayer
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white border border-gray-100 p-12 text-center">
            <MessageSquare size={36} strokeWidth={0.8} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Aucun avis pour le moment.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li
                key={r.id}
                className={cn(
                  'bg-white border p-5 flex gap-4',
                  r.status === 'hidden' ? 'border-gray-200 opacity-60' : 'border-gray-100',
                )}
              >
                {r.userPhoto ? (
                  <Image src={r.userPhoto} alt={r.userName} width={44} height={44} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-brand-black text-white flex items-center justify-center flex-shrink-0 font-semibold">
                    {(r.userName.charAt(0) || '?').toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold truncate">{r.userName}</p>
                    {r.status === 'hidden' && (
                      <span className="text-[9px] font-bold tracking-widest uppercase bg-gray-100 text-gray-500 px-1.5 py-0.5">Masqué</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Stars value={r.rating} />
                    {r.createdAt && <span className="text-[11px] text-gray-400">{timeAgo(r.createdAt.toDate())}</span>}
                  </div>
                  {r.comment && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.comment}</p>}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleStatus(r.id, r.status)}
                    disabled={busy === r.id}
                    title={r.status === 'published' ? 'Masquer' : 'Publier'}
                    className="p-1.5 text-gray-400 hover:text-brand-black transition-colors disabled:opacity-50"
                  >
                    {busy === r.id ? <Loader2 size={14} className="animate-spin" /> : r.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(r.id)}
                    disabled={busy === r.id}
                    title="Supprimer"
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-sm font-bold tracking-widest uppercase mb-2">Supprimer cet avis ?</h2>
            <p className="text-xs text-gray-500 mb-6">Cette action est définitive.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 border border-gray-200 text-xs font-bold tracking-widest uppercase py-3 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 bg-red-600 text-white text-xs font-bold tracking-widest uppercase py-3 hover:bg-red-700 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
