import type { Metadata } from 'next';
import { Inter, Cairo, Fraunces } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://winners-superfrip.vercel.app'),
  title: { default: 'Winners Mode — Mode & Beauté', template: '%s | Winners Mode' },
  description: 'Mode vintage, streetwear, parfums, soins, maquillage. Une sélection pointue, importée d\'Europe, à prix doux. Boutique à Monastir.',
  keywords: ['mode', 'vintage', 'streetwear', 'beauté', 'parfum', 'soins', 'cheveux', 'maquillage', 'friperie', 'monastir', 'tunisie'],
  icons: {
    icon: [
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    siteName: 'Winners Mode',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${cairo.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="pt-[92px]">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
