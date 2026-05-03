import type { Metadata } from 'next';
import { Inter, Cairo } from 'next/font/google';
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

export const metadata: Metadata = {
  title: { default: 'Winners Superfrip — Mode Vintage & Streetwear', template: '%s | Winners Superfrip' },
  description: 'La mode durable à petit prix. Pièces vintage, seconde main et neuves importées d\'Europe. Streetwear, chic, vintage — découvrez notre boutique.',
  keywords: ['frip', 'friperie', 'vintage', 'streetwear', 'seconde main', 'mode', 'algérie'],
  openGraph: {
    type: 'website',
    locale: 'fr_DZ',
    siteName: 'Winners Superfrip',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" className={`${inter.variable} ${cairo.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
