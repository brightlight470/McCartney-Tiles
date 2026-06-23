import type { CrmContact, FormSubmission, SubmitResult } from './types'

/** Lead Connect driver contract. Implementations: mock (default) and GHL (at key gate). */
export interface CrmClient {
  readonly driver: 'mock' | 'ghl'
  /** Validate-then-route a public form submission; creates/updates the contact + triggers workflow. */
  submitForm(submission: FormSubmission): Promise<SubmitResult>
  /** Lower-level upsert used by submitForm and webhook sync. */
  upsertContact(contact: CrmContact): Promise<{ id: string }>
}
