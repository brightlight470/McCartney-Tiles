import { legacyRedirects } from './redirects.mjs'

// Media is served by the CMS (Payload) on its own origin; env-driven so prod picks up the
// hosted CMS domain. Shared by next/image remotePatterns and the img-src CSP below.
const CMS_ORIGIN = process.env.CMS_URL ?? 'http://localhost:3001'
const cmsUrl = new URL(CMS_ORIGIN)
// In local dev the CMS is on localhost, which the image optimiser's SSRF guard blocks. Allow
// it only for a private/local CMS host; production (public CMS domain) keeps the guard on.
const cmsIsLocal = ['localhost', '127.0.0.1', '::1'].includes(cmsUrl.hostname)

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
    dangerouslyAllowLocalIP: cmsIsLocal,
    remotePatterns: [
      // Self-hosted catalogue media, served by the CMS (Payload).
      {
        protocol: cmsUrl.protocol.replace(':', ''),
        hostname: cmsUrl.hostname,
        port: cmsUrl.port || undefined,
        pathname: '/api/media/**',
      },
      // Legacy WordPress site (migration source).
      { protocol: 'https', hostname: 'www.mccartneytiles.com' },
      { protocol: 'https', hostname: 'mccartneytiles.com' },
    ],
  },
  async headers() {
    // Optimised images are same-origin (/_next/image); the CMS origin still needs allowing for
    // any direct media references and as the next/image upstream.
    const cmsOrigin = CMS_ORIGIN
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      `img-src 'self' data: ${cmsOrigin} https://www.mccartneytiles.com https://mccartneytiles.com`,
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
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ]
    return [{ source: '/:path*', headers }]
  },
}

export default nextConfig
