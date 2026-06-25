import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const COOKIE = 'mc_preview'
const LOGIN_PATH = '/preview-login'

// Public asset paths that bypass the gate
const BYPASS = [LOGIN_PATH, '/_next', '/favicon', '/icon', '/hero', '/brand', '/robots', '/sitemap']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const password = process.env.PREVIEW_PASSWORD

  // No password configured → gate is off (local dev without env var)
  if (!password) return NextResponse.next()

  // Always allow the login page and static assets
  if (BYPASS.some((p) => pathname.startsWith(p))) return NextResponse.next()

  const token = req.cookies.get(COOKIE)?.value
  if (token === password) return NextResponse.next()

  // Redirect to login, preserving intended destination
  const url = req.nextUrl.clone()
  url.pathname = LOGIN_PATH
  url.searchParams.set('from', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
