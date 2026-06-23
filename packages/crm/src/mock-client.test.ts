import { describe, expect, it } from 'vitest'
import { MockCrmClient } from './mock-client'

describe('MockCrmClient', () => {
  it('creates a tagged contact and records the submission', async () => {
    const crm = new MockCrmClient()
    const res = await crm.submitForm({
      type: 'contact',
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Looking for 600x600 wood-effect floor tiles.',
    })
    expect(res.ok).toBe(true)
    expect(crm.submissions).toHaveLength(1)
    const contact = [...crm.contacts.values()][0]
    expect(contact?.tags).toContain('enquiry')
    expect(contact?.pipelineStage).toBe('new-enquiry')
  })

  it('rejects an invalid email at the boundary', async () => {
    const crm = new MockCrmClient()
    const res = await crm.submitForm({
      type: 'request-brochure',
      name: 'No Email',
      email: 'not-an-email',
    })
    expect(res.ok).toBe(false)
  })

  it('rejects a tripped honeypot', async () => {
    const crm = new MockCrmClient()
    const res = await crm.submitForm({
      type: 'request-brochure',
      name: 'Bot',
      email: 'bot@example.com',
      company_website: 'http://spam.example',
    })
    expect(res.ok).toBe(false)
  })

  it('upserts the same email to one contact', async () => {
    const crm = new MockCrmClient()
    await crm.submitForm({ type: 'request-brochure', name: 'A', email: 'same@example.com' })
    await crm.submitForm({
      type: 'contact',
      name: 'A',
      email: 'same@example.com',
      message: 'hello again',
    })
    expect(crm.contacts.size).toBe(1)
  })
})
