import { NextResponse } from 'next/server'
import { CsvAdapter, PdfAdapter, UrlAdapter } from '@mccartney/ingestion'
import { getCurrentUser } from '@/lib/auth'

/** Staff-only: parse an uploaded source (CSV / URL / PDF) into draft ranges with suggestions. */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser()
  if (user?.role !== 'staff') {
    return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 })
  }

  let body: {
    kind?: 'csv' | 'url' | 'pdf'
    csv?: string
    url?: string
    pdf?: string
    columnMap?: { range?: string; name?: string; size?: string }
  }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const kind = body.kind ?? 'csv'
  try {
    if (kind === 'url') {
      if (!body.url?.trim()) {
        return NextResponse.json({ ok: false, error: 'Enter a URL' }, { status: 422 })
      }
      const result = await new UrlAdapter().extract({
        content: body.url.trim(),
        sourceRef: body.url.trim(),
      })
      return NextResponse.json({ ok: true, result })
    }

    if (kind === 'pdf') {
      if (!body.pdf) {
        return NextResponse.json({ ok: false, error: 'Upload a PDF' }, { status: 422 })
      }
      const result = await new PdfAdapter().extract({
        content: body.pdf,
        sourceRef: 'staff-pdf-upload',
      })
      return NextResponse.json({ ok: true, result })
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
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Ingestion failed' },
      { status: 500 },
    )
  }
}
