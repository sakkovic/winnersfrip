'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

// ── Types ─────────────────────────────────────────────────────────────────────

type Mode = 'login' | 'register';

// ── Editorial copy per mode (FR) ─────────────────────────────────────────────

const CONFIG = {
  login: {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85',
    eyebrow: 'Bon retour',
    headline: ['Votre style,', 'votre histoire.'],
    sub: 'Mode vintage, parfums et soins. Une sélection pointue rapportée d\'Europe.',
    index: '01',
  },
  register: {
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=85',
    eyebrow: 'Rejoignez-nous',
    headline: ['Un compte,', 'mille possibilités.'],
    sub: 'Accédez aux nouveautés en avant-première, suivez vos commandes et gardez votre wishlist synchronisée.',
    index: '02',
  },
};

const PERKS = [
  'Accès anticipé aux nouveautés',
  'Promotions réservées aux membres',
  'Wishlist & historique synchronisés',
];

// ── Validation helpers ────────────────────────────────────────────────────────

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function passwordScore(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: 'bg-gray-200' };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const labels = ['Trop court', 'Faible', 'Moyen', 'Bien', 'Fort', 'Excellent'];
  const colors = ['bg-red-400', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-500', 'bg-emerald-600'];
  return { score: s, label: labels[s], color: colors[s] };
}

// ── Google icon ───────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ── Floating-label field ──────────────────────────────────────────────────────

function FloatingField({
  label, name, type = 'text', value, onChange, autoComplete, valid, rightSlot,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  valid?: boolean;
  rightSlot?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const isFloating = focused || value.length > 0;

  return (
    /* pt-5 reserves a 20px band above the input where the floating label sits. */
    <div className="relative pt-5">
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        required
        suppressHydrationWarning
        placeholder=" "
        className={cn(
          'auth-field block w-full bg-transparent border-b text-sm py-2 outline-none transition-colors pl-0 pr-9',
          focused ? 'border-brand-black' : 'border-gray-200',
        )}
      />
      <label
        htmlFor={name}
        className={cn(
          'absolute left-0 pointer-events-none transition-all duration-200 ease-out leading-none',
          isFloating
            ? 'top-0 text-[11px] font-bold tracking-wider text-gray-500'
            : 'top-[1.95rem] text-sm text-gray-400',
        )}
      >
        {label}
      </label>

      {/* Validation tick */}
      {valid && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute right-0 top-[1.8rem] w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"
        >
          <Check size={9} className="text-white" strokeWidth={3.5} />
        </motion.span>
      )}

      {/* Right slot (eye toggle etc.) */}
      {rightSlot && !valid && (
        <div className="absolute right-0 top-[1.65rem] text-gray-400">{rightSlot}</div>
      )}
    </div>
  );
}

// ── Password strength bar ─────────────────────────────────────────────────────

function PasswordStrength({ pw }: { pw: string }) {
  const { score, label, color } = useMemo(() => passwordScore(pw), [pw]);
  if (!pw) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 grid grid-cols-5 gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1 rounded-full transition-colors',
              i < score ? color : 'bg-gray-100',
            )}
          />
        ))}
      </div>
      <span className="text-[10px] font-medium text-gray-500 w-16 text-right">{label}</span>
    </div>
  );
}

// ── Slide animation ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

// ── Main component ────────────────────────────────────────────────────────────

export default function AuthCard({ initialMode }: { initialMode: Mode }) {
  const { login, signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [dir, setDir] = useState(1);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchTo = useCallback((next: Mode) => {
    setDir(next === 'register' ? 1 : -1);
    setMode(next);
    setError('');
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      router.push('/');
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regForm.password !== regForm.confirm) return setError('Les mots de passe ne correspondent pas.');
    if (regForm.password.length < 6) return setError('Le mot de passe doit contenir au moins 6 caractères.');
    setLoading(true);
    try {
      await signup(regForm.email, regForm.password, regForm.name);
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg.includes('email-already-in-use') ? 'Cet email est déjà utilisé.' : 'Impossible de créer le compte.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await loginWithGoogle();
      router.push('/');
    } catch {
      setError('Connexion Google impossible.');
    }
  };

  const cfg = CONFIG[mode];
  const passwordsMatch = regForm.confirm.length > 0 && regForm.password === regForm.confirm;

  return (
    <div className="min-h-screen flex bg-brand-cream relative overflow-hidden">

      {/* Decorative noise/grain layer */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* ── Left: editorial panel ── */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[48%] relative overflow-hidden bg-black">
        <AnimatePresence mode="sync">
          <motion.div
            key={mode + '-img'}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={cfg.image}
              alt="Winners Mode"
              fill
              priority
              className="object-cover object-center"
              sizes="48vw"
            />
            {/* Layered gradients for guaranteed text legibility */}
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Top bar */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          <div
            className="flex items-center justify-between"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
          >
            <Link
              href="/"
              className="text-white text-[11px] font-bold tracking-wider flex items-center gap-2 hover:text-brand-warm transition-colors group"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              Retour
            </Link>
            <span className="text-white text-[10px] tracking-[0.4em] uppercase font-bold">
              Winners<span className="text-brand-warm">·</span>Mode
            </span>
          </div>

          {/* Big editorial text */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode + '-text'}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
            >
              <div className="flex items-end gap-5">
                <span
                  className="text-white/25 text-[120px] xl:text-[160px] leading-[0.85] font-black tracking-tighter select-none"
                  style={{ textShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
                >
                  {cfg.index}
                </span>
                <div className="pb-3">
                  <p
                    className="text-brand-warm text-[11px] tracking-widest font-bold mb-3 flex items-center gap-2"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
                  >
                    <span className="inline-block w-6 h-px bg-brand-warm" />
                    {cfg.eyebrow}
                  </p>
                  <h2
                    className="font-display text-white text-3xl xl:text-5xl font-bold leading-[1.05] tracking-tight"
                    style={{ textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}
                  >
                    {cfg.headline[0]}<br />
                    <span className="italic font-light text-white/95">{cfg.headline[1]}</span>
                  </h2>
                </div>
              </div>

              <p
                className="text-white/90 text-sm xl:text-base max-w-md leading-relaxed border-l-2 border-brand-warm pl-4"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
              >
                {cfg.sub}
              </p>

              {mode === 'register' && (
                <ul className="space-y-3 pt-2">
                  {PERKS.map((perk, i) => (
                    <motion.li
                      key={perk}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="flex items-center gap-3 text-white text-sm"
                      style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
                    >
                      <span className="w-5 h-5 rounded-full bg-brand-warm/40 border border-brand-warm flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                        <Check size={11} className="text-white" strokeWidth={3} />
                      </span>
                      {perk}
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer note */}
          <p
            className="text-white/70 text-[11px] tracking-wider"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
          >
            Fondée en 2024 · Monastir, Tunisie
          </p>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex-1 flex flex-col relative">

        {/* Mobile header */}
        <div className="lg:hidden px-6 pt-6 pb-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-black transition-colors">
            <ArrowLeft size={14} /> Retour
          </Link>
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase">
            Winners<span className="text-brand-warm">·</span>Mode
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
          <div className="w-full max-w-[440px]">

            {/* Mode tabs (segmented) */}
            <div className="relative grid grid-cols-2 mb-10 bg-white border border-gray-200 p-1 rounded-full">
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-brand-black rounded-full"
                style={{ left: mode === 'login' ? 4 : 'calc(50% + 0px)' }}
              />
              {(['login', 'register'] as Mode[]).map((m) => (
                <button
                  key={m}
                  suppressHydrationWarning
                  onClick={() => switchTo(m)}
                  className={cn(
                    'relative z-10 text-[12px] font-bold tracking-wider py-2.5 transition-colors',
                    mode === m ? 'text-white' : 'text-gray-500 hover:text-brand-black',
                  )}
                >
                  {m === 'login' ? 'Connexion' : 'Créer un compte'}
                </button>
              ))}
            </div>

            {/* Form card */}
            <motion.div
              layout
              transition={{ duration: 0.3 }}
              className="bg-white border border-gray-100 shadow-[0_8px_60px_-15px_rgba(15,15,15,0.12)] rounded-2xl px-7 sm:px-9 py-9 relative overflow-hidden"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-warm/40 to-transparent" />

              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={mode}
                  custom={dir}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >

                  {/* ── LOGIN ── */}
                  {mode === 'login' && (
                    <div>
                      <div className="mb-7">
                        <p className="text-[11px] tracking-wider text-brand-warm mb-2 flex items-center gap-1.5 font-bold uppercase">
                          <Sparkles size={11} /> Ravis de vous revoir
                        </p>
                        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-black">
                          Connexion
                        </h1>
                      </div>

                      <button
                        onClick={handleGoogle}
                        suppressHydrationWarning
                        className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-all mb-6 group"
                      >
                        <GoogleIcon />
                        <span>Continuer avec Google</span>
                      </button>

                      <Divider />

                      <form onSubmit={handleLoginSubmit} className="space-y-6 mt-6">
                        <FloatingField
                          label="Email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                          valid={isValidEmail(loginForm.email)}
                        />
                        <FloatingField
                          label="Mot de passe"
                          name="password"
                          type={showPass ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                          rightSlot={
                            <button
                              type="button"
                              onClick={() => setShowPass((s) => !s)}
                              className="hover:text-brand-black transition-colors p-0.5"
                              suppressHydrationWarning
                              aria-label={showPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                            >
                              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          }
                        />

                        <div className="flex justify-end -mt-2">
                          <Link
                            href="/forgot-password"
                            className="text-[11px] text-gray-400 hover:text-brand-black underline underline-offset-2 transition-colors"
                          >
                            Mot de passe oublié ?
                          </Link>
                        </div>

                        {error && <ErrorMsg message={error} />}

                        <SubmitBtn loading={loading} label="Se connecter" loadingLabel="Connexion…" />
                      </form>

                      <p className="text-center text-xs text-gray-500 mt-7">
                        Pas encore de compte ?{' '}
                        <button
                          suppressHydrationWarning
                          onClick={() => switchTo('register')}
                          className="text-brand-black font-semibold hover:underline underline-offset-2"
                        >
                          Créer un compte →
                        </button>
                      </p>
                    </div>
                  )}

                  {/* ── REGISTER ── */}
                  {mode === 'register' && (
                    <div>
                      <div className="mb-7">
                        <p className="text-[11px] tracking-wider text-brand-warm mb-2 flex items-center gap-1.5 font-bold uppercase">
                          <Sparkles size={11} /> Nouveau ici
                        </p>
                        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-black">
                          Créer un compte
                        </h1>
                      </div>

                      <button
                        onClick={handleGoogle}
                        suppressHydrationWarning
                        className="w-full flex items-center justify-center gap-3 border border-gray-200 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-all mb-6"
                      >
                        <GoogleIcon /> Continuer avec Google
                      </button>

                      <Divider />

                      <form onSubmit={handleRegisterSubmit} className="space-y-5 mt-6">
                        <FloatingField
                          label="Nom complet"
                          name="name"
                          autoComplete="name"
                          value={regForm.name}
                          onChange={(e) => setRegForm((f) => ({ ...f, name: e.target.value }))}
                          valid={regForm.name.trim().length > 1}
                        />
                        <FloatingField
                          label="Email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={regForm.email}
                          onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
                          valid={isValidEmail(regForm.email)}
                        />
                        <div className="space-y-2">
                          <FloatingField
                            label="Mot de passe"
                            name="password"
                            type={showPass ? 'text' : 'password'}
                            autoComplete="new-password"
                            value={regForm.password}
                            onChange={(e) => setRegForm((f) => ({ ...f, password: e.target.value }))}
                            rightSlot={
                              <button
                                type="button"
                                onClick={() => setShowPass((s) => !s)}
                                className="hover:text-brand-black transition-colors p-0.5"
                                suppressHydrationWarning
                                aria-label={showPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                              >
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            }
                          />
                          <PasswordStrength pw={regForm.password} />
                        </div>
                        <FloatingField
                          label="Confirmer le mot de passe"
                          name="confirm"
                          type={showPass ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={regForm.confirm}
                          onChange={(e) => setRegForm((f) => ({ ...f, confirm: e.target.value }))}
                          valid={passwordsMatch}
                        />

                        {error && <ErrorMsg message={error} />}

                        <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
                          En vous inscrivant, vous acceptez les{' '}
                          <Link href="/terms" className="underline underline-offset-2 hover:text-brand-black">conditions générales</Link>{' '}
                          et la{' '}
                          <Link href="/privacy" className="underline underline-offset-2 hover:text-brand-black">politique de confidentialité</Link>.
                        </p>

                        <SubmitBtn loading={loading} label="Créer mon compte" loadingLabel="Création…" />
                      </form>

                      <p className="text-center text-xs text-gray-500 mt-7">
                        Déjà un compte ?{' '}
                        <button
                          suppressHydrationWarning
                          onClick={() => switchTo('login')}
                          className="text-brand-black font-semibold hover:underline underline-offset-2"
                        >
                          ← Se connecter
                        </button>
                      </p>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Trust strip — boutique-only model, no shipping/payment promise */}
            <div className="flex items-center justify-center gap-4 mt-6 text-[11px] tracking-wider text-gray-400">
              <span>Boutique à Monastir</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>Import Europe</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span>Pièces uniques</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-100" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-4 text-[11px] tracking-wider text-gray-400">ou par email</span>
      </div>
    </div>
  );
}

function ErrorMsg({ message }: { message: string }) {
  return (
    <motion.div
      key={message}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-2 text-red-600 text-xs py-2.5 px-3.5 bg-red-50 border-l-2 border-red-400 rounded-sm"
    >
      <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
      <span>{message}</span>
    </motion.div>
  );
}

function SubmitBtn({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button
      type="submit"
      suppressHydrationWarning
      disabled={loading}
      className={cn(
        'w-full bg-brand-black text-white text-xs font-bold tracking-[0.25em] uppercase py-4 rounded-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden group',
        loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-brand-warm hover:shadow-[0_8px_24px_-8px_rgba(139,115,85,0.5)]',
      )}
    >
      {/* Shimmer */}
      {!loading && (
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      )}
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {loadingLabel}
        </span>
      ) : (
        <>
          <span className="relative z-10">{label}</span>
          <ArrowRight size={14} className="relative z-10 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  );
}
