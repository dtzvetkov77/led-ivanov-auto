import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ivanov-auto.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async redirects() {
    return [
      // WooCommerce product URLs → new product URLs
      { source: '/product/:slug', destination: '/products/:slug', permanent: true },
      { source: '/produkt/:slug', destination: '/products/:slug', permanent: true },
      { source: '/products-category/:cat', destination: '/products', permanent: true },
      // Old catalog URLs
      { source: '/katalog/:make', destination: '/products?make=:make', permanent: true },
      { source: '/katalog', destination: '/products', permanent: true },
      // WooCommerce misc pages
      { source: '/koshnica', destination: '/cart', permanent: true },
      { source: '/checkout', destination: '/checkout', permanent: false },
      { source: '/zhelani-produkti', destination: '/', permanent: true },
      { source: '/moy-akount', destination: '/', permanent: true },
      { source: '/moy-akount/:path*', destination: '/', permanent: true },
      { source: '/shop', destination: '/products', permanent: true },
      { source: '/shop/:path*', destination: '/products', permanent: true },
      { source: '/magazin', destination: '/products', permanent: true },
      { source: '/magazin/:path*', destination: '/products', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

export default nextConfig
