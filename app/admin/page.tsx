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

// ─── Shared constants ─────────────────────────────────────────────────────────

const inputCls  = 'w-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-black transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400';
const selectCls = inputCls + ' cursor-pointer';

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

// ─── Form type ────────────────────────────────────────────────────────────────

type FormData = Omit<Product, 'id' | 'slug'>;

const EMPTY_FORM: FormData = {
  name: '', department: 'mode', category: 'hauts', gender: 'unisexe',
  price: 0, promoPrice: undefined, isPromo: false, currency: 'DT',
  images: [], colors: [], sizes: [],
  description: '', brand: '', volume: '',
  stockQuantity: 1,
};

// ─── Reusable UI atoms ────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 pb-5 last:border-b-0">
      <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-4">{title}</p>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label, accent }: {
  checked: boolean; onChange: () => void; label: string; accent?: string;
}) {
  return (
    <button type="button" onClick={onChange} className="flex items-center gap-2 group">
      <div className={cn(
        'w-4 h-4 border flex-shrink-0 flex items-center justify-center transition-colors',
        checked ? (accent ?? 'bg-brand-black border-brand-black') : 'border-gray-300 group-hover:border-gray-500',
      )}>
        {checked && <Check size={9} className="text-white" strokeWidth={3} />}
      </div>
      <span className={cn('text-xs font-medium', accent ? 'text-red-600' : 'text-gray-700')}>{label}</span>
    </button>
  );
}

// ─── Size selector ────────────────────────────────────────────────────────────

function SizeSelector({ sizes, onChange }: { sizes: string[]; onChange: (s: string[]) => void }) {
  const toggle = (s: string) => onChange(sizes.includes(s) ? sizes.filter((x) => x !== s) : [...sizes, s]);
  const Pill = ({ s }: { s: string }) => (
    <button
      type="button"
      onClick={() => toggle(s)}
      className={cn(
        'text-[11px] font-medium border px-2 py-1 transition-all leading-none',
        sizes.includes(s) ? 'border-brand-black bg-brand-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400',
      )}
    >
      {s}
    </button>
  );
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[9px] tracking-widest uppercase text-gray-400 mb-1.5">Vêtements</p>
        <div className="flex flex-wrap gap-1.5">{CLOTHING_SIZES.map((s) => <Pill key={s} s={s} />)}</div>
      </div>
      <div>
        <p className="text-[9px] tracking-widest uppercase text-gray-400 mb-1.5">Chaussures</p>
        <div className="flex flex-wrap gap-1.5">{SHOE_SIZES.map((s) => <Pill key={s} s={s} />)}</div>
      </div>
      <div className="flex items-center gap-2">
        <Pill s="unique" />
        <Pill s="OS" />
      </div>
      {sizes.length > 0 && (
        <p className="text-[10px] text-gray-400">
          Sélectionnées : <span className="font-medium text-brand-black">{sizes.join(', ')}</span>
        </p>
      )}
    </div>
  );
}

// ─── Color selector ───────────────────────────────────────────────────────────

function ColorSelector({ colors, onChange }: { colors: string[]; onChange: (c: string[]) => void }) {
  const toggle = (c: string) => onChange(colors.includes(c) ? colors.filter((x) => x !== c) : [...colors, c]);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => toggle(c.value)}
            title={c.label}
            className="flex flex-col items-center gap-1 group"
          >
            <div
              className={cn(
                'w-7 h-7 rounded-full transition-all flex items-center justify-center',
                colors.includes(c.value) ? 'ring-2 ring-offset-1 ring-brand-black scale-110' : 'hover:scale-105',
                !c.hex && 'bg-gradient-to-br from-red-400 via-green-400 to-blue-400',
                c.outline && 'border border-gray-300',
              )}
              style={c.hex ? { backgroundColor: c.hex } : undefined}
            >
              {colors.includes(c.value) && (
                <Check size={11} strokeWidth={3} className={c.outline ? 'text-gray-800' : 'text-white'} />
              )}
            </div>
            <span className="text-[9px] text-gray-400 leading-none truncate max-w-[28px]">{c.label}</span>
          </button>
        ))}
      </div>
      {colors.length > 0 && (
        <p className="text-[10px] text-gray-400">
          Sélectionnées : <span className="font-medium text-brand-black capitalize">{colors.join(', ')}</span>
        </p>
      )}
    </div>
  );
}

// ─── Image manager ────────────────────────────────────────────────────────────

function ImageManager({ images, onChange, hasError }: {
  images: string[];
  onChange: (urls: string[]) => void;
  hasError?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const uploadFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!arr.length) return;
    setUploading((n) => n + arr.length);
    const newUrls: string[] = [];
    for (const file of arr) {
      try {
        const path = `products/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const sRef = storageRef(storage, path);
        await uploadBytes(sRef, file);
        newUrls.push(await getDownloadURL(sRef));
      } catch (err) {
        console.error('Upload failed', err);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    onChange([...images, ...newUrls]);
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed && !images.includes(trimmed)) {
      onChange([...images, trimmed]);
      setUrlInput('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          uploadFiles(e.dataTransfer.files);
        }}
        className={cn(
          'border-2 border-dashed flex flex-col items-center justify-center py-7 gap-2 cursor-pointer transition-colors',
          isDragging
            ? 'border-brand-black bg-gray-50'
            : hasError
            ? 'border-red-300 hover:border-red-400'
            : 'border-gray-200 hover:border-gray-400',
        )}
      >
        {uploading > 0 ? (
          <>
            <Loader2 size={22} className="text-gray-400 animate-spin" />
            <p className="text-xs text-gray-500 font-medium">
              {uploading} photo{uploading > 1 ? 's' : ''} en cours d&apos;envoi…
            </p>
          </>
        ) : (
          <>
            <Upload size={20} className="text-gray-300" />
            <p className="text-xs text-gray-500">
              Glisser les photos ici ou{' '}
              <span className="text-brand-black font-semibold underline underline-offset-2">parcourir</span>
            </p>
            <p className="text-[10px] text-gray-300">JPG, PNG, WEBP · max 10 MB par fichier</p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />

      {/* Thumbnail grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative group w-20 h-24 bg-gray-100 overflow-hidden flex-shrink-0">
              <Image src={url} alt={`image ${i + 1}`} fill className="object-cover" sizes="80px" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <button
                type="button"
                onClick={() => onChange(images.filter((u) => u !== url))}
                className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={9} />
              </button>
              <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] text-center py-0.5">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Paste URL fallback */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <ImageIcon size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            placeholder="Ou coller une URL d'image…"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
            className={cn(inputCls, 'pl-8 text-xs')}
          />
        </div>
        <button
          type="button"
          onClick={addUrl}
          disabled={!urlInput.trim()}
          className="border border-gray-200 px-3 text-xs font-medium hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────

interface ProductFormProps {
  initial?: Partial<FormData> & { id?: string };
  onClose: () => void;
  onSave: (data: FormData, id?: string) => Promise<void>;
  saving: boolean;
}

function ProductForm({ initial, onClose, onSave, saving }: ProductFormProps) {
  const initialSnapshot = useRef<FormData>({ ...EMPTY_FORM, ...initial });
  const [form, setForm] = useState<FormData>({ ...EMPTY_FORM, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialSnapshot.current);

  const requestClose = () => {
    if (isDirty) {
      const ok = window.confirm(
        'Vous avez des modifications non enregistrées. Fermer quand même ?',
      );
      if (!ok) return;
    }
    onClose();
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim())         e.name = 'Nom requis';
    if (form.price <= 0)           e.price = 'Prix invalide';
    if (form.images.length === 0)  e.images = 'Au moins une image requise';
    if (!form.description.trim())  e.description = 'Description requise';
    if (form.sizes.length === 0)   e.sizes = 'Au moins une taille requise';
    if (form.isPromo && !form.promoPrice) {
      e.promoPrice = 'Renseignez le prix promotionnel';
    }
    if (
      form.isPromo &&
      form.promoPrice !== undefined &&
      form.promoPrice >= form.price
    ) {
      e.promoPrice = 'Le prix promo doit être inférieur au prix normal';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSave(form, initial?.id);
  };

  const ErrMsg = ({ field }: { field: keyof FormData }) =>
    errors[field] ? (
      <p className="flex items-center gap-1 text-[10px] text-red-500 mt-1">
        <AlertCircle size={10} />{errors[field]}
      </p>
    ) : null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.2 }}
        className="bg-white w-full sm:max-w-2xl h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-sm font-bold tracking-widest uppercase">
            {initial?.id ? 'Modifier le produit' : 'Ajouter un produit'}
            {isDirty && (
              <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-brand-warm align-middle" title="Modifications non enregistrées" />
            )}
          </h2>
          <button onClick={requestClose} className="text-gray-400 hover:text-brand-black transition-colors p-1" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">

            {/* Identité */}
            <FormSection title="Identité du produit">
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Nom du produit</FieldLabel>
                  <input
                    className={cn(inputCls, errors.name && 'border-red-300')}
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    placeholder="Ex : Vintage Nike Hoodie"
                  />
                  <ErrMsg field="name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Catégorie</FieldLabel>
                    <select
                      className={selectCls}
                      value={form.category}
                      onChange={(e) => {
                        const cat = e.target.value as ProductCategory;
                        const dept = departmentForCategory(cat);
                        // Known category → set its rayon automatically.
                        // 'Autre' is ambiguous → keep the current rayon (the admin
                        // confirms it with the Mode/Beauté buttons below).
                        setForm((f) => ({ ...f, category: cat, department: dept ?? f.department }));
                      }}
                    >
                      <optgroup label="Mode">
                        {MODE_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
                      </optgroup>
                      <optgroup label="Beauté">
                        {BEAUTE_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>)}
                      </optgroup>
                      <option value="autre">Autre</option>
                    </select>

                    {/* Rayon — auto for known categories, manual choice for "Autre" */}
                    {form.category === 'autre' ? (
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400">Rayon :</span>
                        {DEPARTMENTS.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => set('department', d)}
                            className={cn(
                              'text-[10px] font-medium px-2 py-0.5 border transition-colors',
                              form.department === d
                                ? 'bg-brand-black text-white border-brand-black'
                                : 'border-gray-200 text-gray-500 hover:border-gray-400',
                            )}
                          >
                            {DEPARTMENT_LABELS[d]}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1.5 text-[10px] text-gray-400">
                        Rayon : <span className="font-medium text-gray-600">{DEPARTMENT_LABELS[form.department]}</span>
                        <span className="text-gray-300"> (automatique)</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <FieldLabel>Genre</FieldLabel>
                    <select className={selectCls} value={form.gender} onChange={(e) => set('gender', e.target.value as FormData['gender'])}>
                      {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Prix */}
            <FormSection title="Prix">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel required>Prix normal (DT)</FieldLabel>
                    <input
                      className={cn(inputCls, errors.price && 'border-red-300')}
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.price || ''}
                      onChange={(e) => set('price', Number(e.target.value))}
                      placeholder="0"
                    />
                    <ErrMsg field="price" />
                  </div>
                  <div>
                    <FieldLabel>Prix promotionnel (DT)</FieldLabel>
                    <input
                      className={cn(inputCls, errors.promoPrice && 'border-red-300')}
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.promoPrice ?? ''}
                      onChange={(e) => set('promoPrice', e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Optionnel"
                    />
                    <ErrMsg field="promoPrice" />
                  </div>
                </div>
                <Toggle
                  checked={!!form.isPromo}
                  onChange={() => set('isPromo', !form.isPromo)}
                  label="Activer la promotion"
                  accent="red"
                />
                {form.isPromo && !form.promoPrice && !errors.promoPrice && (
                  <p className="text-[10px] text-amber-600 flex items-center gap-1">
                    <AlertCircle size={10} /> Renseignez un prix promotionnel ci-dessus.
                  </p>
                )}

                <div>
                  <FieldLabel>Quantité en stock</FieldLabel>
                  <input
                    className={cn(inputCls, 'max-w-[140px]')}
                    type="number"
                    min={1}
                    step="1"
                    value={form.stockQuantity ?? 1}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      set('stockQuantity', Number.isFinite(n) && n >= 1 ? n : 1);
                    }}
                    placeholder="1"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Nombre d&apos;exemplaires disponibles à la boutique. Laisser à 1 pour
                    une pièce unique (vintage, seconde main…).
                  </p>
                </div>
              </div>
            </FormSection>

            {/* Tailles */}
            <FormSection title="Tailles disponibles">
              <SizeSelector sizes={form.sizes} onChange={(s) => set('sizes', s)} />
              <ErrMsg field="sizes" />
            </FormSection>

            {/* Couleurs */}
            <FormSection title="Couleurs disponibles">
              <ColorSelector colors={form.colors} onChange={(c) => set('colors', c)} />
            </FormSection>

            {/* Images */}
            <FormSection title="Images du produit">
              <ImageManager
                images={form.images}
                onChange={(urls) => set('images', urls)}
                hasError={!!errors.images}
              />
              {errors.images && (
                <p className="flex items-center gap-1 text-[10px] text-red-500 mt-1">
                  <AlertCircle size={10} />{errors.images}
                </p>
              )}
            </FormSection>

            {/* Description */}
            <FormSection title="Description">
              <div>
                <FieldLabel required>Description</FieldLabel>
                <textarea
                  className={cn(inputCls, 'h-20 resize-none', errors.description && 'border-red-300')}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Décrivez le produit : particularités, coupe, détails…"
                />
                <ErrMsg field="description" />
              </div>
            </FormSection>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={requestClose}
              className="flex-1 border border-gray-200 bg-white text-xs font-bold tracking-widest uppercase py-3 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-brand-black text-white text-xs font-bold tracking-widest uppercase py-3 hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {initial?.id ? 'Enregistrer les modifications' : 'Ajouter le produit'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

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

  const handleSave = async (data: FormData, id?: string) => {
    setSaving(true);
    try {
      // promoPrice is `undefined` whenever there's no active promo, and Firestore
      // rejects undefined values. Pull it out and handle it explicitly: write the
      // number when there's a promo, otherwise omit it (create) or clear it
      // (update, via deleteField) so an old promo can't linger.
      const { promoPrice, ...rest } = data;
      const hasPromo = data.isPromo && typeof promoPrice === 'number';
      // department + category are chosen explicitly in the form (and kept
      // consistent there), so persist them as-is.
      const base = { ...rest, slug: slugify(data.name), updatedAt: serverTimestamp() };
      if (id) {
        await updateDoc(doc(db, 'products', id), {
          ...base,
          promoPrice: hasPromo ? promoPrice : deleteField(),
        });
        toast.success('Produit mis à jour.');
      } else {
        await addDoc(collection(db, 'products'), {
          ...base,
          ...(hasPromo ? { promoPrice } : {}),
          createdAt: serverTimestamp(),
        });
        toast.success('Produit ajouté.');
      }
      await fetchProducts();
      setFormOpen(false);
      setEditTarget(null);
    } catch (err) {
      console.error('handleSave failed', err);
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      // Surface the actual cause — most often "Missing or insufficient
      // permissions" from a misconfigured rules deploy.
      toast.error(`Échec de l'enregistrement: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

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

      {/* Sticky top bar — sits flush under the global navbar (28 px announcement + 64 px nav) */}
      <div className="bg-white border-b border-gray-100 sticky top-[92px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex-1">
            <Shield size={16} strokeWidth={1.5} className="text-brand-black flex-shrink-0" />
            <h1 className="text-xs font-bold tracking-widest uppercase flex-shrink-0">Administration</h1>
            <span className="text-xs text-gray-400 hidden sm:inline flex-shrink-0">— {products.length} produit{products.length !== 1 ? 's' : ''}</span>
            <Link
              href="/admin/clients"
              className="ml-3 text-[11px] font-bold tracking-widest uppercase text-gray-400 hover:text-brand-black transition-colors inline-flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Clients</span>
              <span className="text-gray-300">→</span>
            </Link>
            <Link
              href="/admin/reservations"
              className="ml-3 text-[11px] font-bold tracking-widest uppercase text-gray-400 hover:text-brand-black transition-colors inline-flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Réservations</span>
              <span className="text-gray-300">→</span>
            </Link>
            <Link
              href="/admin/avis"
              className="ml-3 text-[11px] font-bold tracking-widest uppercase text-gray-400 hover:text-brand-black transition-colors inline-flex items-center gap-1.5 flex-shrink-0"
            >
              <span>Avis</span>
              <span className="text-gray-300">→</span>
            </Link>
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

      {/* Form modal */}
      <AnimatePresence>
        {formOpen && (
          <ProductForm
            initial={editTarget ?? undefined}
            onClose={() => { setFormOpen(false); setEditTarget(null); }}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </AnimatePresence>

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
