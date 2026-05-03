import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getProductById, getRelatedProducts, products } from '@/data/products';
// --- FIREBASE (à réactiver pour le déploiement) ---
// import { doc, getDoc, getFirestore } from 'firebase/firestore/lite';
// import app from '@/lib/firebase';
// --------------------------------------------------
import ProductDetailClient from './ProductDetailClient';
import ProductGrid from '@/components/ProductGrid';
import type { Product } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

// Allow product IDs that aren't in generateStaticParams
export const dynamicParams = true;

export async function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

async function fetchProduct(id: string): Promise<Product | null> {
  // Mode local : données statiques uniquement
  const local = getProductById(id);
  if (local) return local;

  /* --- FIREBASE FALLBACK (à réactiver pour le déploiement) ---
  try {
    const db = getFirestore(app);
    const snap = await getDoc(doc(db, 'products', id));
    if (snap.exists()) {
      const data = snap.data();
      if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate().toISOString();
      if (data.updatedAt?.toDate) data.updatedAt = data.updatedAt.toDate().toISOString();
      const plainData = JSON.parse(JSON.stringify(data));
      return { id: snap.id, ...plainData } as Product;
    }
  } catch (error) {
    console.error(`Failed to fetch product ${id} from Firestore:`, error);
  }
  ------------------------------------------------------------ */

  return null;
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);
  if (!product) return { title: 'Produit introuvable' };
  return {
    title: product.name,
    description: product.description,
    openGraph: { images: [product.images[0]] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) notFound();

  // Related products: from local catalog (same category/gender)
  const related = getRelatedProducts(product, 4);

  return (
    <div className="min-h-screen">
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
