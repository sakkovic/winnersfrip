'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { addDoc, collection, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { ChevronRight, CheckCircle, MapPin, Phone, Calendar, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import PickupRules from '@/components/PickupRules';
import { BOUTIQUE } from '@/lib/boutique-rules';

// Split a Google "displayName" into first + last. Naïve but good enough
// (and we let the user edit it anyway).
function splitName(displayName: string | null | undefined) {
  if (!displayName) return { firstName: '', lastName: '' };
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    visitDay: '',
    notes: '',
  });

  // Pre-fill the form from the user's Google profile + any phone we've
  // remembered from a previous reservation.  Customer can still edit anything.
  useEffect(() => {
    if (!currentUser) return;
    const { firstName, lastName } = splitName(currentUser.displayName);
    setForm((prev) => ({
      ...prev,
      firstName: prev.firstName || firstName,
      lastName:  prev.lastName  || lastName,
      email:     prev.email     || (currentUser.email ?? ''),
    }));

    // Look up phone from /users/{uid} if we already have one stored.
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        const savedPhone = snap.exists() ? (snap.data().phone as string | undefined) : undefined;
        if (savedPhone) {
          setForm((prev) => ({ ...prev, phone: prev.phone || savedPhone }));
        }
      } catch {
        // Soft fail — pre-fill is a convenience, not load-bearing.
      }
    })();
  }, [currentUser]);

  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Require login so the reservation can be tied to a Firebase auth uid
    // (the firestore rule enforces request.resource.data.userId == auth.uid).
    if (!currentUser) {
      toast.error('Connectez-vous pour envoyer une réservation.');
      return;
    }

    if (!acceptedRules) {
      toast.error('Veuillez accepter le règlement de réservation.');
      return;
    }

    setSubmitting(true);
    try {
      // Pickup deadline = now + pickupWindowDays.  Storing it explicitly
      // means a future Cloud Function / cron can flag overdue reservations
      // without inspecting createdAt every time.
      const pickupDeadline = new Date();
      pickupDeadline.setDate(
        pickupDeadline.getDate() + BOUTIQUE.pickupWindowDays,
      );

      await addDoc(collection(db, 'reservations'), {
        userId: currentUser.uid,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        visitDay: form.visitDay || null,
        notes: form.notes.trim() || null,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice:
            item.isPromo && item.promoPrice ? item.promoPrice : item.price,
          selectedSize: item.selectedSize ?? null,
          selectedColor: item.selectedColor ?? null,
        })),
        total: cartTotal,
        status: 'pending',
        rulesAcceptedAt: serverTimestamp(),
        pickupDeadline,
        createdAt: serverTimestamp(),
      });

      // Remember phone + friendly name on the user profile so the next
      // checkout is one-click.  Failure here is non-fatal.
      try {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          {
            phone: form.phone.trim(),
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
          },
          { merge: true },
        );
      } catch (err) {
        console.warn('User profile update failed (non-fatal)', err);
      }

      setSubmitted(true);
      clearCart();
    } catch (err) {
      console.error('Reservation submit failed', err);
      toast.error(
        "Impossible d'enregistrer la réservation. Réessayez ou contactez la boutique.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirmation ────────────────────────────────────────────────────────
  if (submitted) {
    // Show the pickup deadline so the customer knows when their slot expires.
    // Computed client-side from the same window the server stored, formatted
    // in French (e.g. "12 juin 2026").
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + BOUTIQUE.pickupWindowDays);
    const deadlineLabel = deadline.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full text-center">
          <CheckCircle size={56} strokeWidth={1} className="text-emerald-500 mx-auto mb-6" />
          <h1 className="font-display text-3xl tracking-tight mb-3">Réservation envoyée</h1>
          <p className="text-gray-600 text-sm mb-2">
            Merci {form.firstName}. Nous gardons vos articles de côté.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Nous vous contactons au <span className="font-semibold">{form.phone}</span> pour
            confirmer votre passage en boutique.
          </p>

          {/* Pickup deadline highlight */}
          <div className="border border-brand-gold-soft/40 bg-brand-cream/50 p-5 mb-8 text-left">
            <p className="text-[10px] tracking-[0.3em] uppercase text-brand-warm font-semibold mb-2">
              Date limite de retrait
            </p>
            <p className="font-display text-2xl text-brand-black mb-2">{deadlineLabel}</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Passé cette date, la réservation sera automatiquement annulée et
              les articles remis en vente. Pour prolonger ou annuler, contactez-nous
              au{' '}
              <a href={`tel:${BOUTIQUE.contactPhoneE164}`} className="text-brand-warm underline underline-offset-2 font-medium">
                {BOUTIQUE.contactPhone}
              </a>
              .
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 text-xs text-gray-500 mb-10">
            <MapPin size={13} className="text-brand-warm" />
            <span>{BOUTIQUE.address}</span>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-brand-black text-white text-xs font-bold tracking-widest uppercase px-8 py-4 hover:bg-gray-800 transition-colors"
          >
            Continuer la visite
          </Link>
        </div>
      </div>
    );
  }

  // ── Empty cart ──────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <p className="text-gray-500 mb-6">Votre panier est vide.</p>
        <Link href="/shop" className="text-xs tracking-widest uppercase underline underline-offset-4">
          Retour à la boutique
        </Link>
      </div>
    );
  }

  // ── Reservation form ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-brand-black transition-colors">Accueil</Link>
          <ChevronRight size={10} />
          <Link href="/cart" className="hover:text-brand-black transition-colors">Panier</Link>
          <ChevronRight size={10} />
          <span className="text-brand-black">Réservation</span>
        </nav>

        <div className="mb-10">
          <p className="text-[10px] tracking-[0.3em] uppercase text-brand-warm font-semibold mb-2">
            En boutique uniquement
          </p>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight mb-3">
            Réserver mes <span className="italic text-gold-gradient">articles</span>
          </h1>
          <p className="text-gray-500 text-sm max-w-lg leading-relaxed">
            Laissez-nous vos coordonnées : nous mettons vos pièces de côté et vous
            contactons pour convenir d&apos;un rendez-vous à la boutique de Monastir.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                  <Phone size={13} className="text-brand-warm" />
                  Vos coordonnées
                </h2>
                {currentUser && (form.firstName || form.email) && (
                  <span className="text-[10px] tracking-wider uppercase text-gray-400">
                    Prérempli depuis votre compte
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'firstName', label: 'Prénom',    required: true,  span: 1, type: 'text' },
                  { name: 'lastName',  label: 'Nom',       required: true,  span: 1, type: 'text' },
                  { name: 'phone',     label: 'Téléphone', required: true,  span: 2, type: 'tel' },
                  { name: 'email',     label: 'Email (optionnel)', required: false, span: 2, type: 'email' },
                ].map(({ name, label, required, type, span }) => (
                  <div key={name} className={span === 2 ? 'col-span-2' : ''}>
                    <label className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1.5">
                      {label}
                    </label>
                    <input
                      name={name}
                      type={type}
                      required={required}
                      value={form[name as keyof typeof form]}
                      onChange={handleField}
                      suppressHydrationWarning
                      className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-black transition-colors bg-white"
                    />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xs font-bold tracking-widest uppercase mb-5 flex items-center gap-2">
                <Calendar size={13} className="text-brand-warm" />
                Quand pensez-vous passer ?
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1.5">
                    Jour préféré (optionnel)
                  </label>
                  <input
                    name="visitDay"
                    type="date"
                    value={form.visitDay}
                    onChange={handleField}
                    suppressHydrationWarning
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-black transition-colors bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1.5">
                    Message (optionnel)
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={form.notes}
                    onChange={handleField}
                    suppressHydrationWarning
                    placeholder="Une taille, une couleur, une préférence ?"
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-black transition-colors bg-white resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Boutique rules + required acceptance */}
            <PickupRules variant="full" />

            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={acceptedRules}
                onChange={(e) => setAcceptedRules(e.target.checked)}
                suppressHydrationWarning
                className="sr-only peer"
              />
              <span
                className="mt-0.5 w-4 h-4 border border-gray-300 flex-shrink-0 flex items-center justify-center transition-colors
                            peer-checked:bg-brand-black peer-checked:border-brand-black
                            peer-focus-visible:ring-2 peer-focus-visible:ring-brand-warm peer-focus-visible:ring-offset-1
                            group-hover:border-gray-500"
                aria-hidden="true"
              >
                {acceptedRules && (
                  <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M3 8l3 3 7-7" />
                  </svg>
                )}
              </span>
              <span className="text-xs text-gray-700 leading-relaxed">
                J&apos;ai lu et j&apos;accepte le règlement de réservation ci-dessus
                (délai de retrait de {BOUTIQUE.pickupWindowDays} jours, annulation
                automatique passé ce délai).
              </span>
            </label>

            <button
              type="submit"
              suppressHydrationWarning
              disabled={submitting || !acceptedRules || !currentUser}
              className="w-full bg-brand-black text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              {submitting ? 'Envoi…' : 'Confirmer la réservation'}
            </button>

            {!currentUser && (
              <p className="text-[11px] text-amber-600 text-center leading-relaxed">
                Vous devez être connecté pour envoyer une réservation —{' '}
                <Link href="/login" className="underline underline-offset-2 font-medium">
                  se connecter
                </Link>
                .
              </p>
            )}

            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Aucun paiement en ligne. Le règlement se fait à la boutique au moment du retrait.
            </p>
          </form>

          {/* Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 p-6 sticky top-[108px]">
              <h2 className="text-xs font-bold tracking-widest uppercase mb-5">Articles réservés</h2>
              <div className="space-y-4 mb-5">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-16 bg-gray-200 flex-shrink-0 overflow-hidden">
                      {item.images[0] && (
                        <Image src={item.images[0]} alt={item.name} fill className="object-cover" sizes="56px" />
                      )}
                      <span className="absolute -top-1.5 -right-1.5 bg-gray-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      {item.selectedSize && (
                        <p className="text-[10px] text-gray-400">Taille: {item.selectedSize}</p>
                      )}
                    </div>
                    <span className="text-xs font-semibold flex-shrink-0 tabular-nums">
                      {(item.isPromo && item.promoPrice ? item.promoPrice : item.price) * item.quantity} DT
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-base font-bold">
                  <span>À régler en boutique</span>
                  <span className="tabular-nums">{cartTotal} DT</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex items-start gap-2.5 text-[11px] text-gray-500 leading-relaxed">
                <MapPin size={12} className="text-brand-warm flex-shrink-0 mt-0.5" />
                <span>Winners Superfrip · QRFJ+J5R, Monastir, Tunisie</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
