import { NextResponse } from 'next/server'
import { CsvAdapter } from '@mccartney/ingestion'
import { getCurrentUser } from '@/lib/auth'

/** Staff-only: parse uploaded CSV into draft ranges/products with name-hint suggestions. */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser()
  if (user?.role !== 'staff') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }
  let body: { csv?: string; columnMap?: { range?: string; name?: string; size?: string } }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.csv || body.csv.trim() === '') {
    return NextResponse.json({ ok: false, error: 'Paste or upload CSV content' }, { status: 422 })
  }
  const result = await new CsvAdapter().extract({
    content: body.csv,
    sourceRef: 'staff-upload',
    columnMap: body.columnMap,
  })
  return NextResponse.json({ ok: true, result })
}
