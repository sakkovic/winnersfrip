'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Shield, CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

const DELIVERY_OPTIONS = [
  { id: 'standard', label: 'Standard', desc: '3-5 jours ouvrés', price: 500 },
  { id: 'express', label: 'Express', desc: '24-48h ouvrées', price: 1000 },
  { id: 'free', label: 'Gratuit', desc: '5-7 jours ouvrés', price: 0, minOrder: 80 },
];

type Step = 'shipping' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState<Step>('shipping');
  const [delivery, setDelivery] = useState('standard');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', postalCode: '', country: 'Algérie',
  });

  const selectedDelivery = DELIVERY_OPTIONS.find((d) => d.id === delivery)!;
  const total = cartTotal + selectedDelivery.price;

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'shipping') setStep('payment');
    else if (step === 'payment') {
      setStep('confirmation');
      clearCart();
    }
  };

  if (step === 'confirmation') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <CheckCircle size={56} strokeWidth={1} className="text-emerald-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold tracking-tight mb-3">Commande Confirmée !</h1>
        <p className="text-gray-500 text-sm mb-2">Merci pour votre achat, {form.firstName}.</p>
        <p className="text-gray-400 text-sm mb-8">Un email de confirmation a été envoyé à {form.email}.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-brand-black text-white text-xs font-bold tracking-widest uppercase px-8 py-4 hover:bg-gray-800 transition-colors"
        >
          Continuer les achats
        </Link>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8">
          <Link href="/" className="hover:text-brand-black transition-colors">Accueil</Link>
          <ChevronRight size={10} />
          <Link href="/cart" className="hover:text-brand-black transition-colors">Panier</Link>
          <ChevronRight size={10} />
          <span className="text-brand-black capitalize">{step === 'shipping' ? 'Livraison' : 'Paiement'}</span>
        </nav>

        {/* Steps indicator */}
        <div className="flex items-center gap-3 mb-10">
          {(['shipping', 'payment'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                step === s || (step === 'payment' && s === 'shipping')
                  ? 'bg-brand-black text-white'
                  : 'bg-gray-100 text-gray-400'
              )}>
                {i + 1}
              </div>
              <span className={cn('text-xs font-medium', step === s ? 'text-brand-black' : 'text-gray-400')}>
                {s === 'shipping' ? 'Livraison' : 'Paiement'}
              </span>
              {i < 1 && <div className="w-8 h-px bg-gray-200" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
            {step === 'shipping' && (
              <>
                <section>
                  <h2 className="text-xs font-bold tracking-widest uppercase mb-5">Contact</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'firstName', label: 'Prénom', required: true, span: 1 },
                      { name: 'lastName', label: 'Nom', required: true, span: 1 },
                      { name: 'email', label: 'Email', required: true, type: 'email', span: 2 },
                      { name: 'phone', label: 'Téléphone', required: true, type: 'tel', span: 2 },
                    ].map(({ name, label, required, type = 'text', span }) => (
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
                          className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-black transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-xs font-bold tracking-widest uppercase mb-5">Adresse de livraison</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1.5">
                        Adresse
                      </label>
                      <input
                        name="address"
                        required
                        value={form.address}
                        onChange={handleField}
                        className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-black transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1.5">Ville</label>
                        <input
                          name="city"
                          required
                          value={form.city}
                          onChange={handleField}
                          className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-black transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1.5">Code postal</label>
                        <input
                          name="postalCode"
                          value={form.postalCode}
                          onChange={handleField}
                          className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-black transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-xs font-bold tracking-widest uppercase mb-5">Mode de livraison</h2>
                  <div className="space-y-3">
                    {DELIVERY_OPTIONS.filter((d) => !d.minOrder || cartTotal >= d.minOrder).map((opt) => (
                      <label
                        key={opt.id}
                        className={cn(
                          'flex items-center gap-4 border p-4 cursor-pointer transition-all',
                          delivery === opt.id ? 'border-brand-black' : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className={cn(
                          'w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center',
                          delivery === opt.id ? 'border-brand-black' : 'border-gray-300'
                        )}>
                          {delivery === opt.id && <div className="w-2 h-2 rounded-full bg-brand-black" />}
                        </div>
                        <input type="radio" className="sr-only" value={opt.id} checked={delivery === opt.id} onChange={() => setDelivery(opt.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-gray-400">{opt.desc}</p>
                        </div>
                        <span className="text-sm font-semibold flex-shrink-0">
                          {opt.price === 0 ? 'Gratuit' : `${opt.price} DA`}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>
              </>
            )}

            {step === 'payment' && (
              <section>
                <h2 className="text-xs font-bold tracking-widest uppercase mb-5">Paiement</h2>
                <div className="border border-gray-200 p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1.5">
                      Numéro de carte
                    </label>
                    <input
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-black transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1.5">Expiration</label>
                      <input
                        type="text"
                        placeholder="MM / AA"
                        className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-black transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1.5">CVV</label>
                      <input
                        type="text"
                        placeholder="•••"
                        className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-black transition-colors"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
                  <Shield size={12} />
                  Paiement sécurisé avec chiffrement SSL
                </div>
              </section>
            )}

            <button
              type="submit"
              className="w-full bg-brand-black text-white text-xs font-bold tracking-widest uppercase py-4 hover:bg-gray-800 transition-colors"
            >
              {step === 'shipping' ? 'Continuer vers le paiement' : `Confirmer la commande — ${total}€`}
            </button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 p-6 sticky top-24">
              <h2 className="text-xs font-bold tracking-widest uppercase mb-5">Votre commande</h2>
              <div className="space-y-4 mb-5">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-16 bg-gray-200 flex-shrink-0 overflow-hidden">
                      <Image src={item.images[0]} alt={item.name} fill className="object-cover" sizes="56px" />
                      <span className="absolute -top-1.5 -right-1.5 bg-gray-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      {item.selectedSize && <p className="text-[10px] text-gray-400">Taille: {item.selectedSize}</p>}
                    </div>
                    <span className="text-xs font-semibold flex-shrink-0">
                      {(item.isPromo && item.promoPrice ? item.promoPrice : item.price) * item.quantity}€
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sous-total</span>
                  <span>{cartTotal}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Livraison</span>
                  <span>{selectedDelivery.price === 0 ? 'Gratuite' : `${selectedDelivery.price} DA`}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>{total}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

