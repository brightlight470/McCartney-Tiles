import { NextResponse } from 'next/server'

const CMS_URL = process.env.CMS_URL ?? 'http://localhost:3001'

/**
 * Proxy login to Payload and forward its auth cookie to the browser on the web origin.
 * Keeps the payload-token httpOnly; the web app never holds the password.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }
  const { email, password } = (body ?? {}) as { email?: string; password?: string }
  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'Enter email and password' }, { status: 422 })
  }

  let upstream: Response
  try {
    upstream = await fetch(`${CMS_URL}/api/accounts/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'Sign-in service unavailable' }, { status: 502 })
  }

  const data = (await upstream.json().catch(() => ({}))) as { user?: { role?: string } }
  const res = NextResponse.json(
    {
      ok: upstream.ok,
      role: data.user?.role ?? null,
      error: upstream.ok ? undefined : 'Invalid credentials',
    },
    { status: upstream.ok ? 200 : 401 },
  )
  const setCookie = upstream.headers.get('set-cookie')
  if (setCookie) res.headers.set('set-cookie', setCookie)
  return res
}
