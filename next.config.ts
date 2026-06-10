import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Editorial product photos (placeholder catalog).
      { protocol: 'https', hostname: 'images.unsplash.com' },

      // Legacy Firebase Storage CDN.
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },

      // Current Firebase Storage CDN (project bucket: winners-superfrip.firebasestorage.app).
      { protocol: 'https', hostname: '*.firebasestorage.app' },

      // Google profile pictures used by the auth avatar.
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh4.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh5.googleusercontent.com' },
      { protocol: 'https', hostname: 'lh6.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
