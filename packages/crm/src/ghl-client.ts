import type { CrmClient } from './client'
import { FORM_ROUTING, formSubmissionSchema } from './types'
import type { CrmContact, FormSubmission, SubmitResult } from './types'

const GHL_BASE = 'https://services.leadconnectorhq.com'

/**
 * Live Lead Connect (GoHighLevel) client. Wired at the CRM integration gate (task #16),
 * once GHL_API_TOKEN + GHL_LOCATION_ID are supplied. Until then, CRM_DRIVER=mock is used.
 * The contact/upsert call is implemented; workflow triggers are finalised with Cowork's
 * pipeline IDs at the gate (marked TODO).
 */
export class GhlCrmClient implements CrmClient {
  readonly driver = 'ghl' as const

  constructor(
    private readonly token: string,
    private readonly locationId: string,
  ) {
    if (!token || !locationId) {
      throw new Error('GHL_API_TOKEN and GHL_LOCATION_ID are required for the GHL driver')
    }
  }

  async submitForm(submission: FormSubmission): Promise<SubmitResult> {
    const parsed = formSubmissionSchema.safeParse(submission)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid submission' }
    }
    const data = parsed.data
    if (data.company_website) return { ok: false, error: 'Rejected' }

    const routing = FORM_ROUTING[data.type]
    try {
      const { id } = await this.upsertContact({
        name: data.name ?? 'Website visitor',
        email: data.email,
        phone: data.phone,
        whatsapp: 'whatsapp' in data ? data.whatsapp : undefined,
        companyName: 'companyName' in data ? data.companyName : undefined,
        tags: routing.tags,
        pipelineStage: routing.pipelineStage,
        region: data.region,
      })
      // TODO(crm-gate): trigger the per-form workflow with Cowork's pipeline/workflow IDs.
      return { ok: true, contactId: id }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'CRM error' }
    }
  }

  async upsertContact(contact: CrmContact): Promise<{ id: string }> {
    const res = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        Version: '2021-07-28',
      },
      body: JSON.stringify({
        locationId: this.locationId,
        name: contact.name,
        email: contact.email,
        // GHL has no dedicated WhatsApp field on upsert; fall back to phone so the number
        // still lands on the contact for the WhatsApp workflow.
        phone: contact.phone ?? contact.whatsapp,
        companyName: contact.companyName,
        tags: contact.tags,
      }),
    })
    if (!res.ok) throw new Error(`GHL upsert failed: ${res.status}`)
    const json = (await res.json()) as { contact?: { id?: string } }
    const id = json.contact?.id
    if (!id) throw new Error('GHL upsert returned no contact id')
    return { id }
  }
}
