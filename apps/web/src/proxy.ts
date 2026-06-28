import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { REGION_COOKIE, resolveRegion } from './lib/region'

const COOKIE = 'mc_preview'
const LOGIN_PATH = '/preview-login'
const ONE_YEAR = 60 * 60 * 24 * 365

// Public asset paths that bypass the gate
const BYPASS = [LOGIN_PATH, '/_next', '/favicon', '/icon', '/hero', '/brand', '/robots', '/sitemap']

/**
 * Pass the request through, seeding the region cookie from edge geo-IP on first visit. A manual
 * region choice (cookie already present) always wins, so geo never overrides the visitor.
 */
function passThrough(req: NextRequest): NextResponse {
  const res = NextResponse.next()
  if (!req.cookies.get(REGION_COOKIE)) {
    const country = req.headers.get('x-vercel-ip-country') ?? req.headers.get('cf-ipcountry')
    res.cookies.set(REGION_COOKIE, resolveRegion(country), {
      path: '/',
      maxAge: ONE_YEAR,
      sameSite: 'lax',
    })
  }
  return res
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const password = process.env.PREVIEW_PASSWORD

  // No password configured → gate is off (local dev without env var)
  if (!password) return passThrough(req)

  // Always allow the login page and static assets
  if (BYPASS.some((p) => pathname.startsWith(p))) return passThrough(req)

  const token = req.cookies.get(COOKIE)?.value
  if (token === password) return passThrough(req)

  // Redirect to login, preserving intended destination
  const url = req.nextUrl.clone()
  url.pathname = LOGIN_PATH
  url.searchParams.set('from', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
