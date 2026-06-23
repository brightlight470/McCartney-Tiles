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
      name: data.name,
      email: data.email,
      phone: data.phone,
      companyName: 'companyName' in data ? data.companyName : undefined,
      tags: routing.tags,
      pipelineStage: routing.pipelineStage,
      region: data.region,
    })
    this.submissions.push(data)
    return { ok: true, contactId: id }
  }

  async upsertContact(contact: CrmContact): Promise<{ id: string }> {
    const existing = [...this.contacts.entries()].find(([, c]) => c.email === contact.email)
    const id = existing?.[0] ?? `mock_${++this.seq}`
    this.contacts.set(id, { ...existing?.[1], ...contact })
    return { id }
  }
}
