'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Check, Shield, Upload, ImageIcon, X, Loader2, AlertCircle,
} from 'lucide-react';
import {
  doc, getDoc, addDoc, collection, updateDoc, serverTimestamp, deleteField
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
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { currentUser, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const resolvedParams = use(params);
  const isNew = resolvedParams.id === 'new';
  const id = resolvedParams.id;
  
  const initialSnapshot = useRef<FormData>(EMPTY_FORM);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  
  const [fetching, setFetching] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) router.push('/login');
  }, [currentUser, isAdmin, authLoading, router]);

  useEffect(() => {
    async function loadProduct() {
      if (isNew) return;
      try {
        const snap = await getDoc(doc(db, 'products', id));
        if (snap.exists()) {
          const data = snap.data() as Product;
          const merged = { ...EMPTY_FORM, ...data };
          setForm(merged);
          initialSnapshot.current = merged;
        } else {
          toast.error('Produit introuvable');
          router.push('/admin');
        }
      } catch (err) {
        console.error('loadProduct failed', err);
        toast.error('Erreur lors du chargement');
      } finally {
        setFetching(false);
      }
    }
    if (isAdmin) loadProduct();
  }, [isAdmin, isNew, id, router]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setSaving(true);
    try {
      const { promoPrice, ...rest } = form;
      const hasPromo = form.isPromo && typeof promoPrice === 'number';
      const base = { ...rest, slug: slugify(form.name), updatedAt: serverTimestamp() };
      
      if (!isNew) {
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
      router.push('/admin');
    } catch (err) {
      console.error('handleSave failed', err);
      toast.error(`Échec de l'enregistrement`);
    } finally {
      setSaving(false);
    }
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialSnapshot.current);

  const handleCancel = () => {
    if (isDirty) {
      if (!window.confirm('Vous avez des modifications non enregistrées. Quitter quand même ?')) {
        return;
      }
    }
    router.push('/admin');
  };

  if (authLoading || !isAdmin || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={24} className="animate-spin text-gray-300" />
      </div>
    );
  }

  const ErrMsg = ({ field }: { field: keyof FormData }) =>
    errors[field] ? (
      <p className="flex items-center gap-1 text-[10px] text-red-500 mt-1">
        <AlertCircle size={10} />{errors[field]}
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Sticky top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-[64px] z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-4">
          <button onClick={handleCancel} className="text-gray-400 hover:text-brand-black transition-colors">
            <ArrowLeft size={16} />
          </button>
          <Shield size={16} strokeWidth={1.5} className="text-brand-black" />
          <h1 className="text-xs font-bold tracking-widest uppercase truncate">
            {isNew ? 'Ajouter un produit' : 'Modifier le produit'}
          </h1>
          {isDirty && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-warm flex-shrink-0" title="Modifications non enregistrées" />
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <form onSubmit={handleSave} className="bg-white border border-gray-100 shadow-sm">
          <div className="p-6 space-y-8">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Catégorie</FieldLabel>
                    <select
                      className={selectCls}
                      value={form.category}
                      onChange={(e) => {
                        const cat = e.target.value as ProductCategory;
                        const dept = departmentForCategory(cat);
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

                    {form.category === 'autre' ? (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
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
                    Nombre d&apos;exemplaires disponibles. Laisser à 1 pour une pièce unique.
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
              <ErrMsg field="images" />
            </FormSection>

            {/* Description */}
            <FormSection title="Description">
              <div>
                <FieldLabel required>Description</FieldLabel>
                <textarea
                  className={cn(inputCls, 'h-32 resize-y', errors.description && 'border-red-300')}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Décrivez le produit : particularités, coupe, détails…"
                />
                <ErrMsg field="description" />
              </div>
            </FormSection>
          </div>

          {/* Footer - Sticky Bottom Bar */}
          <div className="sticky bottom-0 bg-white border-t border-gray-100 flex gap-3 p-4 flex-shrink-0 z-20 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
            <button
              type="button"
              onClick={handleCancel}
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
              {isNew ? 'Ajouter' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
