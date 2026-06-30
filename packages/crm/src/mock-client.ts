import type { CrmClient } from './client'
import { FORM_ROUTING, formSubmissionSchema } from './types'
import type { CrmContact, FormSubmission, SubmitResult } from './types'

/**
 * In-memory Lead Connect client. Keeps the app building/testing before GHL keys
 * arrive (Handover §10). Records submissions so tests can assert routing.
 */
export class MockCrmClient implements CrmClient {
  readonly driver = 'mock' as const
  readonly contacts = new Map<string, CrmContact>()
  readonly submissions: FormSubmission[] = []
  private seq = 0

  async submitForm(submission: FormSubmission): Promise<SubmitResult> {
    const parsed = formSubmissionSchema.safeParse(submission)
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid submission' }
    }
    const data = parsed.data
    if (data.company_website) return { ok: false, error: 'Rejected' } // honeypot tripped

    const routing = FORM_ROUTING[data.type]
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
    this.submissions.push(data)
    return { ok: true, contactId: id }
  }

  async upsertContact(contact: CrmContact): Promise<{ id: string }> {
    // Dedup on the best available channel (email, else WhatsApp, else phone); a contact with
    // no channel always gets a fresh id rather than collapsing onto other channel-less rows.
    const key = contact.email ?? contact.whatsapp ?? contact.phone
    const existing = key
      ? [...this.contacts.entries()].find(
          ([, c]) => (c.email ?? c.whatsapp ?? c.phone) === key,
        )
      : undefined
    const id = existing?.[0] ?? `mock_${++this.seq}`
    this.contacts.set(id, { ...existing?.[1], ...contact })
    return { id }
  }
}
