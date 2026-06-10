import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { doc, getDoc, getFirestore } from 'firebase/firestore/lite';
import app from '@/lib/firebase';
import { getProductById, getRelatedProducts, products } from '@/data/products';
import ProductDetailClient from './ProductDetailClient';
import ProductGrid from '@/components/ProductGrid';
import type { Product } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

// Allow product IDs that aren't in generateStaticParams (e.g. products added
// via the admin after build).
export const dynamicParams = true;

// Re-generate the page at most once a minute so admin edits / deletions
// propagate to the live product URL without a redeploy.
export const revalidate = 60;

export async function generateStaticParams() {
  // Pre-render the known seed catalog for fast first loads + SEO. New products
  // are rendered on demand thanks to dynamicParams.
  return products.map((p) => ({ id: p.id }));
}

async function fetchProduct(id: string): Promise<Product | null> {
  // Firestore is the source of truth for live management. We read with the
  // lightweight `firebase/firestore/lite` SDK (no realtime listeners) since
  // this runs on the server.
  try {
    const fdb = getFirestore(app);
    const snap = await getDoc(doc(fdb, 'products', id));
    if (snap.exists()) {
      // Strip Firestore Timestamps (createdAt / updatedAt) — they're not part
      // of the Product type and aren't serializable to the client component.
      const { createdAt: _c, updatedAt: _u, ...rest } = snap.data() as Record<string, unknown>;
      void _c; void _u;
      const plain = JSON.parse(JSON.stringify(rest));
      return { id: snap.id, ...plain } as Product;
    }
  } catch (error) {
    // Network / unseeded / offline build → fall through to the static seed so
    // the page still renders. Once Firestore is seeded it wins.
    console.error(`Firestore fetch failed for ${id}, using static fallback:`, error);
  }

  return getProductById(id) ?? null;
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) return { title: 'Produit introuvable' };

  const priceLabel =
    product.isPromo && product.promoPrice
      ? `${product.promoPrice} DT (au lieu de ${product.price} DT)`
      : `${product.price} DT`;

  const description = `${product.description.slice(0, 155)}${
    product.description.length > 155 ? '…' : ''
  }`;

  return {
    title: product.name,
    description: `${product.name} — ${priceLabel}. ${description}`,
    openGraph: {
      type: 'website',
      title: `${product.name} — ${priceLabel}`,
      description,
      images: product.images.slice(0, 4).map((url) => ({ url })),
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: product.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) notFound();

  // Related products: from local catalog (same category/gender)
  const related = getRelatedProducts(product, 4);

  // Google-rich-result-friendly Product JSON-LD.  Prices in TND; availability
  // mirrors the boutique reality (in-stock if a single unit remains).
  const stockMax = product.stockQuantity ?? 1;
  const price = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'TND',
      price,
      availability:
        stockMax > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition:
        product.condition === 'neuf'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
    },
  };

  return (
    <div className="min-h-screen">
      {/* Rich-result structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-black transition-colors">Accueil</Link>
          <ChevronRight size={10} />
          <Link href="/shop" className="hover:text-brand-black transition-colors">Boutique</Link>
          <ChevronRight size={10} />
          <span className="text-brand-black truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      <ProductDetailClient product={product} />

      {/* Related Products */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-100">
          <h2 className="text-lg font-bold tracking-tight mb-8">Vous aimerez aussi</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
