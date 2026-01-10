/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  
  // Trailing slash (SEO için)
  trailingSlash: false,
  
  // Resim optimizasyonu
  images: {
    domains: ['www.pomonero.com', 'pomonero.com'],
    formats: ['image/webp'],
  },
  
  // HTTP Headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        // robots.txt ve sitemap.xml için cache
        source: '/:path(robots.txt|sitemap.xml)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  
  // Redirects (www -> non-www veya tersi)
  async redirects() {
    return [
      // www olmadan www'ye yönlendir (veya tersi - ihtiyaca göre)
      // {
      //   source: '/:path*',
      //   has: [{ type: 'host', value: 'pomonero.com' }],
      //   destination: 'https://www.pomonero.com/:path*',
      //   permanent: true,
      // },
    ];
  },
}
