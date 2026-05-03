'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronUp, Check, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  COLORS, CATEGORIES, CONDITIONS, GENDERS, STYLES, ORIGINS,
  PRICE_RANGES, CLOTHING_SIZES, SHOE_SIZES, CONDITION_LABELS,
  type ColorEntry,
} from '@/lib/constants';
import type { FilterState, ProductCategory, ProductCondition, ProductGender, ProductStyle, ProductOrigin } from '@/types';

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children, defaultOpen = false, count = 0 }: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <span className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-widest uppercase text-gray-700 group-hover:text-brand-black transition-colors">
            {title}
          </span>
          {count > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-black text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
              {count}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={11} className="text-gray-400" /> : <ChevronDown size={11} className="text-gray-400" />}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

// ─── Checkbox row ─────────────────────────────────────────────────────────────

function CheckRow({ label, checked, onChange, accent }: {
  label: string;
  checked: boolean;
  onChange: () => void;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center gap-2.5 w-full py-1 group"
    >
      <div className={cn(
        'w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center transition-colors',
        checked ? 'border-brand-black bg-brand-black' : 'border-gray-300 group-hover:border-gray-500',
      )}>
        {checked && <Check size={8} className="text-white" strokeWidth={3} />}
      </div>
      <span className={cn('text-xs capitalize leading-none', accent ?? 'text-gray-600 group-hover:text-brand-black transition-colors')}>
        {label}
      </span>
    </button>
  );
}

// ─── Size pills ───────────────────────────────────────────────────────────────

function SizePill({ size, selected, onClick }: { size: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-[11px] font-medium border px-2.5 py-1 transition-all leading-none',
        selected
          ? 'border-brand-black bg-brand-black text-white'
          : 'border-gray-200 text-gray-600 hover:border-gray-400',
      )}
    >
      {size}
    </button>
  );
}

// ─── Color swatch ─────────────────────────────────────────────────────────────

function ColorSwatch({ color, selected, onClick }: {
  color: ColorEntry;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={color.label}
      className={cn(
        'flex flex-col items-center gap-1 group',
      )}
    >
      <div
        className={cn(
          'w-6 h-6 rounded-full transition-all',
          selected ? 'ring-2 ring-offset-1 ring-brand-black scale-110' : 'hover:scale-110',
          !color.hex && 'bg-gradient-to-br from-red-400 via-green-400 to-blue-400',
          color.outline && 'border border-gray-300',
        )}
        style={color.hex ? { backgroundColor: color.hex } : undefined}
      >
        {selected && color.hex && (
          <Check
            size={10}
            strokeWidth={3}
            className={cn('m-auto', color.outline ? 'text-gray-800' : 'text-white')}
          />
        )}
      </div>
      <span className="text-[9px] text-gray-400 leading-none truncate max-w-[28px]">{color.label}</span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onReset: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function ProductFilters({ filters, onChange, onReset, isMobileOpen, onMobileClose }: ProductFiltersProps) {
  const toggle = <K extends keyof FilterState>(key: K, value: FilterState[K] extends (infer U)[] ? U : never) => {
    const current = filters[key] as string[];
    onChange({
      ...filters,
      [key]: current.includes(value as string) ? current.filter((v) => v !== value) : [...current, value as string],
    });
  };

  const activeCount =
    filters.category.length + filters.condition.length + filters.origin.length +
    filters.gender.length + filters.style.length + filters.size.length +
    filters.color.length + filters.priceRange.length +
    (filters.promotions ? 1 : 0) + (filters.newArrivals ? 1 : 0);

  const body = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between py-3 border-b border-gray-200 mb-1 flex-shrink-0">
        <span className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
          <SlidersHorizontal size={12} />
          Filtres
          {activeCount > 0 && (
            <span className="bg-brand-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </span>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="text-[10px] tracking-wider uppercase text-gray-400 hover:text-red-500 transition-colors"
            >
              Effacer tout
            </button>
          )}
          <button type="button" onClick={onMobileClose} className="lg:hidden p-0.5 text-gray-500">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto pr-0.5">
        <div className="py-3 border-b border-gray-100 space-y-2">
          <CheckRow
            label="Nouveautés"
            checked={filters.newArrivals}
            onChange={() => onChange({ ...filters, newArrivals: !filters.newArrivals })}
          />
          <CheckRow
            label="En promotion"
            checked={filters.promotions}
            onChange={() => onChange({ ...filters, promotions: !filters.promotions })}
            accent="text-red-600 font-medium"
          />
        </div>

        {/* Price */}
        <Section title="Prix" defaultOpen count={filters.priceRange.length}>
          <div className="space-y-1">
            {PRICE_RANGES.map(({ value, label }) => (
              <CheckRow
                key={value}
                label={label}
                checked={filters.priceRange.includes(value)}
                onChange={() => toggle('priceRange', value as string)}
              />
            ))}
          </div>
        </Section>

        {/* Genre */}
        <Section title="Genre" defaultOpen count={filters.gender.length}>
          <div className="space-y-1">
            {GENDERS.map((g) => (
              <CheckRow
                key={g}
                label={g}
                checked={filters.gender.includes(g)}
                onChange={() => toggle('gender', g as ProductGender)}
              />
            ))}
          </div>
        </Section>

        {/* Catégorie */}
        <Section title="Catégorie" count={filters.category.length}>
          <div className="space-y-1">
            {CATEGORIES.map((c) => (
              <CheckRow
                key={c}
                label={c}
                checked={filters.category.includes(c)}
                onChange={() => toggle('category', c as ProductCategory)}
              />
            ))}
          </div>
        </Section>

        {/* État */}
        <Section title="État" count={filters.condition.length}>
          <div className="space-y-1">
            {CONDITIONS.map((c) => (
              <CheckRow
                key={c}
                label={CONDITION_LABELS[c]}
                checked={filters.condition.includes(c)}
                onChange={() => toggle('condition', c as ProductCondition)}
              />
            ))}
          </div>
        </Section>

        {/* Style */}
        <Section title="Style" count={filters.style.length}>
          <div className="space-y-1">
            {STYLES.map((s) => (
              <CheckRow
                key={s}
                label={s}
                checked={filters.style.includes(s)}
                onChange={() => toggle('style', s as ProductStyle)}
              />
            ))}
          </div>
        </Section>

        {/* Couleurs */}
        <Section title="Couleur" count={filters.color.length}>
          <div className="flex flex-wrap gap-2 pt-1">
            {COLORS.map((c) => (
              <ColorSwatch
                key={c.value}
                color={c}
                selected={filters.color.includes(c.value)}
                onClick={() => toggle('color', c.value as string)}
              />
            ))}
          </div>
        </Section>

        {/* Taille */}
        <Section title="Taille" count={filters.size.length}>
          <div className="space-y-2.5">
            <p className="text-[9px] tracking-widest uppercase text-gray-400">Vêtements</p>
            <div className="flex flex-wrap gap-1.5">
              {CLOTHING_SIZES.map((s) => (
                <SizePill key={s} size={s} selected={filters.size.includes(s)} onClick={() => toggle('size', s as string)} />
              ))}
            </div>
            <p className="text-[9px] tracking-widest uppercase text-gray-400 pt-1">Chaussures</p>
            <div className="flex flex-wrap gap-1.5">
              {SHOE_SIZES.map((s) => (
                <SizePill key={s} size={s} selected={filters.size.includes(s)} onClick={() => toggle('size', s as string)} />
              ))}
            </div>
            <SizePill size="unique" selected={filters.size.includes('unique')} onClick={() => toggle('size', 'unique')} />
          </div>
        </Section>

        {/* Origine */}
        <Section title="Origine" count={filters.origin.length}>
          <div className="space-y-1">
            {ORIGINS.map((o) => (
              <CheckRow
                key={o}
                label={o === 'europe' ? 'Europe' : 'Local'}
                checked={filters.origin.includes(o)}
                onChange={() => toggle('origin', o as ProductOrigin)}
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-48 flex-shrink-0">{body}</aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-white z-50 lg:hidden flex flex-col p-5"
            >
              {body}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
