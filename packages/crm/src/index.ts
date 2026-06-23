import type { CrmClient } from './client'
import { GhlCrmClient } from './ghl-client'
import { MockCrmClient } from './mock-client'

let cached: CrmClient | null = null

/**
 * Resolve the active Lead Connect client from env.
 * CRM_DRIVER=ghl uses the live client (needs token + location id); anything else → mock.
 */
export function getCrmClient(): CrmClient {
  if (cached) return cached
  const driver = process.env.CRM_DRIVER ?? 'mock'
  if (driver === 'ghl') {
    cached = new GhlCrmClient(process.env.GHL_API_TOKEN ?? '', process.env.GHL_LOCATION_ID ?? '')
  } else {
    cached = new MockCrmClient()
  }
  return cached
}

/** Reset the memoised client (tests). */
export function resetCrmClient(): void {
  cached = null
}

export { MockCrmClient } from './mock-client'
export { GhlCrmClient } from './ghl-client'
export type { CrmClient } from './client'
export {
  formSubmissionSchema,
  contactSchema,
  brochureSchema,
  showroomVisitSchema,
  tradeApplicationSchema,
  sampleRequestSchema,
  FORM_ROUTING,
} from './types'
export type { FormSubmission, FormType, CrmContact, SubmitResult } from './types'
