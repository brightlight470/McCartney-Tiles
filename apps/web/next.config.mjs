import { legacyRedirects } from './redirects.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mccartney/ui', '@mccartney/crm', '@mccartney/search', '@mccartney/db'],
  async redirects() {
    return legacyRedirects()
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Sprint 1: migrate imagery directly from the legacy WordPress site.
      { protocol: 'https', hostname: 'www.mccartneytiles.com' },
      { protocol: 'https', hostname: 'mccartneytiles.com' },
    ],
  },
  async headers() {
    // Baseline security headers (full CSP tuned at Sprint 7 hardening).
    const headers = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(self)',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
    ]
    return [{ source: '/:path*', headers }]
  },
}

export default nextConfig
