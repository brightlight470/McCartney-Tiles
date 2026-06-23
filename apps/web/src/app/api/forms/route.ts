import { NextResponse } from 'next/server'
import { formSubmissionSchema, getCrmClient } from '@mccartney/crm'

/**
 * Public form intake → Lead Connect. Validates server-side at the boundary (security),
 * then routes to the active CRM driver (mock until GHL keys arrive). Honeypot enforced
 * inside the CRM client.
 */
export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = formSubmissionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid submission' },
      { status: 422 },
    )
  }

  const result = await getCrmClient().submitForm(parsed.data)
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
