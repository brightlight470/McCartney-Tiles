import { NextResponse } from 'next/server'
import { brochureHasContact, formSubmissionSchema, getCrmClient } from '@mccartney/crm'

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

  // Brochure popup takes an email OR a WhatsApp number — require at least one channel.
  if (parsed.data.type === 'request-brochure' && !brochureHasContact(parsed.data)) {
    return NextResponse.json(
      { ok: false, error: 'Enter an email or WhatsApp number' },
      { status: 422 },
    )
  }

  const result = await getCrmClient().submitForm(parsed.data)
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
