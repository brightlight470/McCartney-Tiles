import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

const CMS_URL = process.env.CMS_URL ?? 'http://localhost:3001'

/** Staff-only: forward the reviewed payload to the CMS publish endpoint (with the auth cookie). */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser()
  if (user?.role !== 'staff') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }
  const token = (await cookies()).get('payload-token')?.value
  const body = await request.text()
  try {
    const upstream = await fetch(`${CMS_URL}/api/ingest/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { cookie: `payload-token=${token}` } : {}),
      },
      body,
    })
    const data = await upstream.json().catch(() => ({}))
    return NextResponse.json(data, { status: upstream.status })
  } catch {
    return NextResponse.json({ ok: false, error: 'Publish service unavailable' }, { status: 502 })
  }
}
