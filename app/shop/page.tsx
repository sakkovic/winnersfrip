'use client';

import { useMemo, useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';
import { useProducts } from '@/lib/products';
import { CONDITION_LABELS, PRICE_RANGES } from '@/lib/constants';
import type { FilterState, SortOption } from '@/types';

// ─── Config ───────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 12;

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: FilterState = {
  category: [], condition: [], origin: [], gender: [], style: [],
  size: [], color: [], priceRange: [], promotions: false, newArrivals: false,
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest',     label: 'Plus récents' },
  { value: 'price-asc',  label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
];

// ─── Active chip strip ────────────────────────────────────────────────────────

function ActiveChips({ filters, search, onChange, onClearSearch, onReset }: {
  filters: FilterState;
  search: string;
  onChange: (f: FilterState) => void;
  onClearSearch: () => void;
  onReset: () => void;
}) {
  const priceLabel = (v: string) => PRICE_RANGES.find((r) => r.value === v)?.label ?? v;
  const condLabel  = (v: string) => CONDITION_LABELS[v] ?? v;

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...(search ? [{ key: 'q', label: `"${search}"`, remove: onClearSearch }] : []),
    ...(filters.newArrivals ? [{ key: 'new', label: 'Nouveautés', remove: () => onChange({ ...filters, newArrivals: false }) }] : []),
    ...(filters.promotions ? [{ key: 'promo', label: 'En promo', remove: () => onChange({ ...filters, promotions: false }) }] : []),
    ...filters.gender.map((g)     => ({ key: `g-${g}`,   label: g,           remove: () => onChange({ ...filters, gender:     filters.gender.filter((x) => x !== g) }) })),
    ...filters.category.map((c)   => ({ key: `c-${c}`,   label: c,           remove: () => onChange({ ...filters, category:   filters.category.filter((x) => x !== c) }) })),
    ...filters.condition.map((c)  => ({ key: `cd-${c}`,  label: condLabel(c), remove: () => onChange({ ...filters, condition:  filters.condition.filter((x) => x !== c) }) })),
    ...filters.style.map((s)      => ({ key: `s-${s}`,   label: s,           remove: () => onChange({ ...filters, style:      filters.style.filter((x) => x !== s) }) })),
    ...filters.color.map((c)      => ({ key: `col-${c}`, label: c,           remove: () => onChange({ ...filters, color:      filters.color.filter((x) => x !== c) }) })),
    ...filters.size.map((s)       => ({ key: `sz-${s}`,  label: s,           remove: () => onChange({ ...filters, size:       filters.size.filter((x) => x !== s) }) })),
    ...filters.origin.map((o)     => ({ key: `o-${o}`,   label: o === 'europe' ? 'Europe' : 'Local', remove: () => onChange({ ...filters, origin: filters.origin.filter((x) => x !== o) }) })),
    ...filters.priceRange.map((p) => ({ key: `p-${p}`,   label: priceLabel(p), remove: () => onChange({ ...filters, priceRange: filters.priceRange.filter((x) => x !== p) }) })),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.remove}
          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 text-[11px] font-medium px-2.5 py-1 transition-colors capitalize group"
        >
          {chip.label}
          <X size={10} className="group-hover:text-red-500" />
        </button>
      ))}
      {chips.length > 1 && (
        <button onClick={onReset} className="text-[11px] text-gray-400 hover:text-red-500 underline underline-offset-2 transition-colors">
          Tout effacer
        </button>
      )}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-12 pt-8 border-t border-gray-100">
      {/* Prev */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-brand-black hover:text-brand-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Page précédente"
      >
        <ChevronLeft size={15} />
      </button>

      {/* Pages */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-9 h-9 flex items-center justify-center text-sm font-medium border transition-colors ${
              p === page
                ? 'bg-brand-black text-white border-brand-black'
                : 'border-gray-200 text-gray-600 hover:border-brand-black hover:text-brand-black'
            }`}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-500 hover:border-brand-black hover:text-brand-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Page suivante"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-100" />
          <div className="mt-3 h-2.5 bg-gray-100 w-3/4 rounded-none" />
          <div className="mt-2 h-2.5 bg-gray-100 w-1/2 rounded-none" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ShopContent() {
  const searchParams = useSearchParams();
  const { products, loading } = useProducts();

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...DEFAULT_FILTERS,
    gender:    searchParams.get('gender')    ? [searchParams.get('gender')    as FilterState['gender'][number]]    : [],
    condition: searchParams.get('condition') ? [searchParams.get('condition') as FilterState['condition'][number]] : [],
    style:     searchParams.get('style')     ? [searchParams.get('style')     as FilterState['style'][number]]     : [],
    category:  searchParams.get('category') ? [searchParams.get('category')  as FilterState['category'][number]]  : [],
    newArrivals: searchParams.get('new') === 'true',
  }));
  const [sort, setSort]   = useState<SortOption>('newest');
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [page, setPage] = useState(1);

  const prevSearchStr = useRef(searchParams.toString());

  useEffect(() => {
    const currentSearchStr = searchParams.toString();
    if (prevSearchStr.current !== currentSearchStr) {
      prevSearchStr.current = currentSearchStr;
      setSearch(searchParams.get('q') ?? '');
      setFilters(() => ({
        ...DEFAULT_FILTERS,
        gender: searchParams.get('gender') ? [searchParams.get('gender') as FilterState['gender'][number]] : [],
        category: searchParams.get('category') ? [searchParams.get('category') as FilterState['category'][number]] : [],
        condition: searchParams.get('condition') ? [searchParams.get('condition') as FilterState['condition'][number]] : [],
        style: searchParams.get('style') ? [searchParams.get('style') as FilterState['style'][number]] : [],
        newArrivals: searchParams.get('new') === 'true',
      }));
    }
  }, [searchParams]);

  // Reset page when filters/search/sort change
  const handleFiltersChange = (f: FilterState) => { setFilters(f); setPage(1); };
  const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };
  const handleSortChange = (v: SortOption) => { setSort(v); setPage(1); };

  const filtered = useMemo(() => {
    let r = products;
    if (filters.newArrivals)     r = r.filter((p) => p.isNewArrival);
    if (filters.promotions)      r = r.filter((p) => p.isPromo);
    if (search)                  r = r.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (filters.category.length) r = r.filter((p) => filters.category.includes(p.category));
    if (filters.condition.length)r = r.filter((p) => filters.condition.includes(p.condition));
    if (filters.origin.length)   r = r.filter((p) => filters.origin.includes(p.origin));
    if (filters.gender.length)   r = r.filter((p) => filters.gender.includes(p.gender));
    if (filters.style.length)    r = r.filter((p) => filters.style.includes(p.style));
    if (filters.size.length)     r = r.filter((p) => p.sizes.some((s) => filters.size.includes(s)));
    if (filters.color.length)    r = r.filter((p) => p.colors.some((c) => filters.color.includes(c)));
    if (filters.priceRange.length) {
      r = r.filter((p) => filters.priceRange.some((range) => {
        const price = p.isPromo && p.promoPrice ? p.promoPrice : p.price;
        if (range === '0-20')   return price <= 20;
        if (range === '20-50')  return price > 20 && price <= 50;
        if (range === '50-100') return price > 50 && price <= 100;
        if (range === '100+')   return price > 100;
        return false;
      }));
    }
    if (sort === 'price-asc')  return [...r].sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') return [...r].sort((a, b) => b.price - a.price);
    return r;
  }, [products, search, filters, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleReset = () => { setFilters(DEFAULT_FILTERS); setSearch(''); setPage(1); };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeCount =
    filters.category.length + filters.condition.length + filters.origin.length +
    filters.gender.length + filters.style.length + filters.size.length +
    filters.color.length + filters.priceRange.length +
    (filters.promotions ? 1 : 0) + (filters.newArrivals ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div className="min-h-screen">
      {/* Compact header + controls in one row */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
          {/* Title */}
          <div className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-none">Boutique</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {loading ? 'Chargement...' : `${filtered.length} article${filtered.length !== 1 ? 's' : ''} — Page ${page} / ${totalPages || 1}`}
            </p>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher..."
            className="hidden sm:block w-48 border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-brand-black transition-colors"
          />

          {/* Mobile filters button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex items-center gap-2 border border-gray-200 px-3 py-1.5 text-xs font-medium tracking-wider uppercase hover:border-gray-400 transition-colors relative"
          >
            <SlidersHorizontal size={13} />
            Filtres
            {activeCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-brand-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative flex items-center border border-gray-200 px-3 py-1.5 gap-2">
            <span className="text-xs text-gray-400 hidden sm:inline whitespace-nowrap">Trier :</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="appearance-none bg-transparent text-xs font-medium outline-none cursor-pointer pr-4"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={11} className="text-gray-400 pointer-events-none absolute right-2" />
          </div>
        </div>

        {/* Mobile search row */}
        <div className="sm:hidden px-4 pb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher..."
            className="w-full border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-brand-black transition-colors"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

        <div className="flex gap-8">
          <ProductFilters
            filters={filters}
            onChange={handleFiltersChange}
            onReset={handleReset}
            isMobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />

          <div className="flex-1 min-w-0">
            <ActiveChips
              filters={filters}
              search={search}
              onChange={handleFiltersChange}
              onClearSearch={() => handleSearchChange('')}
              onReset={handleReset}
            />

            {loading ? (
              <SkeletonGrid />
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-gray-400 text-sm mb-4">Aucun article ne correspond à votre recherche.</p>
                <button
                  onClick={handleReset}
                  className="text-xs tracking-widest uppercase underline underline-offset-4 text-brand-black hover:text-gray-500 transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                  {paginated.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" /></div>}>
      <ShopContent />
    </Suspense>
  );
}
