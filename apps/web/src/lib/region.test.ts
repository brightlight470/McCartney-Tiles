import { describe, expect, it } from 'vitest'
import { capabilitiesFor, resolveRegion } from './region'

describe('resolveRegion', () => {
  it('maps ISO country codes', () => {
    expect(resolveRegion('GB')).toBe('NI')
    expect(resolveRegion('ie')).toBe('IE')
    expect(resolveRegion('US')).toBe('ROW')
  })
  it('falls back to a default region when unknown', () => {
    expect(['NI', 'IE', 'ROW']).toContain(resolveRegion(null))
  })
})

describe('capabilitiesFor', () => {
  it('gates commerce by region, never browsing', () => {
    expect(capabilitiesFor('ROW').canBrowse).toBe(true)
    expect(capabilitiesFor('ROW').canSeeStore).toBe(false)
    expect(capabilitiesFor('NI').canSeeStore).toBe(true)
    expect(capabilitiesFor('IE').canCheckout).toBe(false)
  })
})
