'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { collection, getDocs } from 'firebase/firestore';
import {
  Loader2, RefreshCw, AlertCircle, Shield, ArrowLeft, Search,
  Phone, Mail, ChevronDown, ChevronUp, Users, ShoppingBag, TrendingUp, Package,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────
interface ResItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedSize?: string | null;
}
interface Reservation {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string | null;
  items: ResItem[];
  total: number;
  status: string;
  createdAt?: { toDate(): Date } | null;
}
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedAt: Date | null;
  reservations: Reservation[];
  total: number;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'En attente', cls: 'bg-amber-50 text-amber-700' },
  confirmed: { label: 'Confirmée',  cls: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Récupérée',  cls: 'bg-emerald-50 text-emerald-700' },
  cancelled: { label: 'Annulée',    cls: 'bg-gray-100 text-gray-500' },
  expired:   { label: 'Expirée',    cls: 'bg-red-50 text-red-700' },
};

const toDate = (v: { toDate?: () => Date } | null | undefined): Date | null => {
  if (v && typeof v.toDate === 'function') return v.toDate();
  return null;
};
const fmtDate = (d: Date | null) =>
  d ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function AdminClientsPage() {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [topProducts, setTopProducts] = useState<{ id: string; name: string; qty: number }[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) router.push('/login');
  }, [currentUser, isAdmin, authLoading, router]);

  const fetchData = useCallback(async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const [usersSnap, resSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'reservations')),
      ]);

      // Build a client map from registered users first.
      const map = new Map<string, Client>();
      usersSnap.forEach((d) => {
        const u = d.data();
        const name =
          (typeof u.name === 'string' && u.name) ||
          [u.firstName, u.lastName].filter(Boolean).join(' ') ||
          'Client';
        map.set(d.id, {
          id: d.id,
          name,
          email: typeof u.email === 'string' ? u.email : '',
          phone: typeof u.phone === 'string' ? u.phone : '',
          joinedAt: toDate(u.createdAt),
          reservations: [],
          total: 0,
        });
      });

      // Attach reservations; create a minimal client if their /users doc is missing.
      const productTally = new Map<string, { name: string; qty: number }>();
      resSnap.forEach((d) => {
        const data = d.data();
        const r: Reservation = {
          id: d.id,
          userId: String(data.userId ?? ''),
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email ?? null,
          items: Array.isArray(data.items) ? data.items : [],
          total: typeof data.total === 'number' ? data.total : 0,
          status: typeof data.status === 'string' ? data.status : 'pending',
          createdAt: data.createdAt ?? null,
        };

        let client = map.get(r.userId);
        if (!client) {
          client = {
            id: r.userId || d.id,
            name: [r.firstName, r.lastName].filter(Boolean).join(' ') || 'Client',
            email: r.email ?? '',
            phone: r.phone ?? '',
            joinedAt: null,
            reservations: [],
            total: 0,
          };
          map.set(client.id, client);
        }
        // Backfill contact details from the reservation if missing on the profile.
        if (!client.phone && r.phone) client.phone = r.phone;
        if (!client.email && r.email) client.email = r.email;
        client.reservations.push(r);
        client.total += r.total;

        // Tally reserved products (interest signal).
        for (const it of r.items) {
          const key = it.id || it.name;
          const prev = productTally.get(key);
          productTally.set(key, { name: it.name, qty: (prev?.qty ?? 0) + (it.quantity || 1) });
        }
      });

      const list = Array.from(map.values()).sort(
        (a, b) => b.reservations.length - a.reservations.length || b.total - a.total,
      );
      // Newest reservation first within each client.
      list.forEach((c) =>
        c.reservations.sort(
          (a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0),
        ),
      );

      const top = Array.from(productTally.entries())
        .map(([id, v]) => ({ id, name: v.name, qty: v.qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 6);

      setClients(list);
      setTopProducts(top);
    } catch (err) {
      console.error('fetchData failed', err);
      setFetchError(err instanceof Error ? err.message : 'Erreur inconnue');
      toast.error('Impossible de charger les clients.');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) fetchData(); }, [isAdmin, fetchData]);

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.name, c.email, c.phone].filter(Boolean).join(' ').toLowerCase().includes(q),
    );
  }, [clients, search]);

  const stats = useMemo(() => {
    const totalReservations = clients.reduce((n, c) => n + c.reservations.length, 0);
    const totalValue = clients.reduce((n, c) => n + c.total, 0);
    const withReservations = clients.filter((c) => c.reservations.length > 0).length;
    return { totalClients: clients.length, totalReservations, totalValue, withReservations };
  }, [clients]);

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-brand-black transition-colors">
              <ArrowLeft size={14} />
            </Link>
            <Shield size={14} strokeWidth={1.5} className="text-brand-black" />
            <h1 className="text-xs font-bold tracking-widest uppercase">Clients</h1>
            <span className="text-xs text-gray-400 hidden sm:inline">— {stats.totalClients}</span>
          </div>
          <button onClick={fetchData} title="Actualiser" className="p-2 text-gray-400 hover:text-brand-black transition-colors">
            <RefreshCw size={14} className={fetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Insights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Users,       label: 'Clients',       value: stats.totalClients,    color: 'text-brand-black' },
            { icon: ShoppingBag, label: 'Réservations',  value: stats.totalReservations, color: 'text-blue-600' },
            { icon: TrendingUp,  label: 'Valeur totale',  value: `${stats.totalValue} DT`, color: 'text-emerald-600' },
            { icon: Users,       label: 'Ont réservé',    value: stats.withReservations, color: 'text-brand-warm' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-100 p-4 flex items-center gap-3">
              <s.icon size={18} className={s.color} strokeWidth={1.6} />
              <div className="min-w-0">
                <p className="text-lg font-bold tabular-nums truncate">{s.value}</p>
                <p className="text-[11px] text-gray-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* What clients want — most reserved products */}
        {topProducts.length > 0 && (
          <div className="bg-white border border-gray-100 p-5">
            <p className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-3 flex items-center gap-2">
              <Package size={13} className="text-brand-warm" /> Articles les plus réservés
            </p>
            <div className="space-y-2">
              {topProducts.map((p, i) => {
                const max = topProducts[0].qty || 1;
                return (
                  <Link key={p.id} href={`/product/${p.id}`} target="_blank" className="flex items-center gap-3 group">
                    <span className="text-[11px] text-gray-400 w-4 tabular-nums">{i + 1}</span>
                    <span className="text-sm text-gray-700 group-hover:text-brand-warm transition-colors flex-1 min-w-0 truncate">{p.name}</span>
                    <div className="hidden sm:block w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-warm rounded-full" style={{ width: `${(p.qty / max) * 100}%` }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums w-12 text-right">×{p.qty}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client (nom, email, téléphone)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 bg-white pl-8 pr-3 py-2 text-xs outline-none focus:border-brand-black transition-colors"
          />
        </div>

        {/* Clients list */}
        {fetching ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 p-5 animate-pulse flex gap-4">
                <div className="w-11 h-11 rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 w-1/3" />
                  <div className="h-2 bg-gray-100 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="bg-white border border-red-200 p-8 text-center">
            <AlertCircle size={32} strokeWidth={1} className="text-red-400 mx-auto mb-3" />
            <p className="text-sm text-gray-700 font-medium mb-1">Erreur de chargement</p>
            <p className="text-xs text-gray-400 mb-5 break-words">{fetchError}</p>
            <button onClick={fetchData} className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-50 transition-colors">
              <RefreshCw size={12} /> Réessayer
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white border border-gray-100 p-12 text-center">
            <Users size={36} strokeWidth={0.8} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">{clients.length === 0 ? 'Aucun client inscrit pour le moment.' : 'Aucun client ne correspond à la recherche.'}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {displayed.map((c) => {
              const open = expanded === c.id;
              return (
                <li key={c.id} className="bg-white border border-gray-100">
                  <button
                    onClick={() => setExpanded(open ? null : c.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-full bg-brand-black text-white flex items-center justify-center flex-shrink-0 font-semibold">
                      {(c.name.charAt(0) || '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{c.name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-gray-500">
                        {c.email && <span className="inline-flex items-center gap-1 truncate"><Mail size={10} /> {c.email}</span>}
                        {c.phone && <span className="inline-flex items-center gap-1"><Phone size={10} /> {c.phone}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold tabular-nums">{c.reservations.length}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">résa</p>
                    </div>
                    {open ? <ChevronUp size={15} className="text-gray-400" /> : <ChevronDown size={15} className="text-gray-400" />}
                  </button>

                  {open && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-3">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-gray-500">
                        <span>Inscrit le <span className="font-medium text-gray-700">{fmtDate(c.joinedAt)}</span></span>
                        <span>Total réservé : <span className="font-medium text-gray-700 tabular-nums">{c.total} DT</span></span>
                      </div>

                      {c.reservations.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Inscrit mais aucune réservation pour l&apos;instant.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {c.reservations.map((r) => {
                            const meta = STATUS_LABEL[r.status] ?? STATUS_LABEL.pending;
                            return (
                              <div key={r.id} className="bg-white border border-gray-100 p-3">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-[11px] text-gray-400">{fmtDate(toDate(r.createdAt))}</span>
                                  <span className={cn('text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5', meta.cls)}>{meta.label}</span>
                                </div>
                                <ul className="space-y-1">
                                  {r.items.map((it, i) => (
                                    <li key={`${it.id}-${i}`} className="flex items-center justify-between text-xs">
                                      <Link href={`/product/${it.id}`} target="_blank" className="text-gray-700 hover:text-brand-warm truncate">
                                        <span className="text-gray-400 tabular-nums mr-1.5">×{it.quantity}</span>
                                        {it.name}{it.selectedSize ? <span className="text-gray-400"> · {it.selectedSize}</span> : null}
                                      </Link>
                                      <span className="text-gray-500 tabular-nums flex-shrink-0 ml-2">{(it.unitPrice * it.quantity)} DT</span>
                                    </li>
                                  ))}
                                </ul>
                                <div className="flex justify-end mt-1.5 pt-1.5 border-t border-gray-50 text-xs font-semibold tabular-nums">
                                  {r.total} DT
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <Link
                        href="/admin/reservations"
                        className="inline-block text-[11px] font-bold tracking-widest uppercase text-gray-400 hover:text-brand-black transition-colors"
                      >
                        Gérer les réservations →
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
