import { legacyRedirects } from './redirects.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@mccartney/ui',
    '@mccartney/crm',
    '@mccartney/search',
    '@mccartney/db',
    '@mccartney/ingestion',
  ],
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
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "img-src 'self' data: https://www.mccartneytiles.com https://mccartneytiles.com",
      // Next.js requires 'unsafe-inline'/'unsafe-eval' without nonces; tighten with a nonce middleware later.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self'",
    ].join('; ')
    const headers = [
      { key: 'Content-Security-Policy', value: csp },
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
