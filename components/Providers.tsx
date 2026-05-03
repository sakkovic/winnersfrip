'use client';

import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import CartSidebar from './CartSidebar';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          {children}
          <CartSidebar />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '2px', background: '#0A0A0A', color: '#fff', fontSize: '14px' },
              success: { iconTheme: { primary: '#fff', secondary: '#0A0A0A' } },
            }}
          />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
