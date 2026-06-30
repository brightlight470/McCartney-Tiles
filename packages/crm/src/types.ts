import { z } from 'zod'

/**
 * Lead Connect form payloads. Whitelabelled — "GHL" never surfaces in UI/copy.
 * Each schema validates at the server boundary before any CRM call (security gate).
 * Honeypot field `company_website` must be empty (bot trap).
 */

const base = {
  name: z.string().min(1, 'Enter your name').max(120),
  email: z.string().email('Enter a valid email'),
  phone: z.string().max(40).optional(),
  /** Honeypot — real users leave this blank. */
  company_website: z.string().max(0).optional(),
  /** Region context for routing (IE | NI | ROW). */
  region: z.enum(['IE', 'NI', 'ROW']).optional(),
}

export const contactSchema = z.object({
  type: z.literal('contact'),
  ...base,
  message: z.string().min(1, 'Enter a message').max(4000),
})

/**
 * Brochure download intake (bathrooms page popup). Low-friction: the visitor supplies an
 * email OR a WhatsApp number — name is optional. "At least one contact channel" is enforced
 * at the route/client boundary (a refine here would make this a ZodEffects and break the
 * discriminatedUnion below).
 */
export const brochureSchema = z.object({
  type: z.literal('request-brochure'),
  name: z.string().max(120).optional(),
  email: z.string().email('Enter a valid email').optional(),
  phone: z.string().max(40).optional(),
  whatsapp: z.string().max(40).optional(),
  company_website: z.string().max(0).optional(),
  region: z.enum(['IE', 'NI', 'ROW']).optional(),
})

/** True when a brochure submission carries at least one usable contact channel. */
export function brochureHasContact(data: { email?: string; whatsapp?: string }): boolean {
  return Boolean(data.email?.trim() || data.whatsapp?.trim())
}

export const showroomVisitSchema = z.object({
  type: z.literal('book-showroom-visit'),
  ...base,
  showroom: z.string().min(1).max(120),
  preferredDate: z.string().max(40).optional(),
})

export const tradeApplicationSchema = z.object({
  type: z.literal('trade-account-application'),
  ...base,
  companyName: z.string().min(1, 'Enter your company name').max(160),
  vatNumber: z.string().max(40).optional(),
})

export const sampleRequestSchema = z.object({
  type: z.literal('sample-request'),
  ...base,
  productSlug: z.string().min(1).max(160),
  address: z.string().min(1, 'Enter a delivery address').max(400),
})

export const formSubmissionSchema = z.discriminatedUnion('type', [
  contactSchema,
  brochureSchema,
  showroomVisitSchema,
  tradeApplicationSchema,
  sampleRequestSchema,
])

export type FormSubmission = z.infer<typeof formSubmissionSchema>
export type FormType = FormSubmission['type']

/** GHL pipeline stage + tags each form maps to (Cowork owns the workflow design). */
export const FORM_ROUTING: Record<FormType, { tags: string[]; pipelineStage: string }> = {
  contact: { tags: ['web', 'enquiry'], pipelineStage: 'new-enquiry' },
  'request-brochure': { tags: ['web', 'brochure'], pipelineStage: 'brochure-requested' },
  'book-showroom-visit': { tags: ['web', 'showroom-visit'], pipelineStage: 'visit-requested' },
  'trade-account-application': {
    tags: ['web', 'trade-application'],
    pipelineStage: 'trade-applied',
  },
  'sample-request': { tags: ['web', 'sample'], pipelineStage: 'sample-requested' },
}

export interface CrmContact {
  name: string
  email?: string
  phone?: string
  whatsapp?: string
  companyName?: string
  tags?: string[]
  pipelineStage?: string
  region?: 'IE' | 'NI' | 'ROW'
}

export type SubmitResult = { ok: true; contactId: string } | { ok: false; error: string }
