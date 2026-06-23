import { NextResponse } from 'next/server'

/** Clear the Payload auth cookie on the web origin. */
export async function POST(): Promise<NextResponse> {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('payload-token', '', { maxAge: 0, path: '/' })
  return res
}
