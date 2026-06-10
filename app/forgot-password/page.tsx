'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      // Don't leak whether the email exists — same error for unknown email.
      setError(
        msg.includes('user-not-found') || msg.includes('invalid-email')
          ? "Adresse e-mail invalide."
          : "Impossible d'envoyer l'e-mail. Réessayez.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-6 py-12">
      <div className="w-full max-w-[440px]">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-xs text-gray-500 hover:text-brand-black transition-colors mb-8"
        >
          <ArrowLeft size={13} /> Retour à la connexion
        </Link>

        <div className="bg-white border border-gray-100 shadow-[0_8px_60px_-15px_rgba(15,15,15,0.12)] rounded-2xl px-7 sm:px-9 py-9 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-warm/40 to-transparent" />

          {sent ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mb-5">
                <CheckCircle size={22} className="text-emerald-500" />
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight mb-3">
                E-mail envoyé
              </h1>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Si un compte est associé à <span className="font-semibold">{email}</span>,
                vous recevrez un lien pour réinitialiser votre mot de passe dans
                quelques minutes.
              </p>
              <p className="text-xs text-gray-400 mb-8 leading-relaxed">
                Pensez à vérifier vos courriers indésirables si vous ne le
                voyez pas dans votre boîte de réception.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-brand-black text-white text-xs font-bold tracking-widest uppercase px-6 py-3 hover:bg-gray-800 transition-colors"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-7">
                <p className="text-[11px] tracking-wider text-brand-warm mb-2 flex items-center gap-1.5 font-bold uppercase">
                  <Mail size={11} /> Réinitialisation
                </p>
                <h1 className="font-display text-3xl font-bold tracking-tight text-brand-black mb-2">
                  Mot de passe oublié ?
                </h1>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Saisissez votre adresse e-mail. Nous vous enverrons un lien
                  pour définir un nouveau mot de passe.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-semibold tracking-wider uppercase text-gray-500 mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    suppressHydrationWarning
                    className="w-full border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand-black transition-colors bg-white"
                    placeholder="vous@exemple.com"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-600 text-xs py-2.5 px-3.5 bg-red-50 border-l-2 border-red-400 rounded-sm">
                    <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  suppressHydrationWarning
                  className="w-full bg-brand-black text-white text-xs font-bold tracking-[0.25em] uppercase py-3.5 rounded-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden hover:bg-brand-warm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={13} className="animate-spin" />
                      Envoi…
                    </span>
                  ) : (
                    'Envoyer le lien'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
