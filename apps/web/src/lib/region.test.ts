import { describe, expect, it } from 'vitest'
import { capabilitiesFor, isRegion, resolveActiveRegion, resolveRegion } from './region'

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

describe('isRegion', () => {
  it('accepts only the three regions', () => {
    expect(isRegion('NI')).toBe(true)
    expect(isRegion('ROW')).toBe(true)
    expect(isRegion('gb')).toBe(false)
    expect(isRegion(undefined)).toBe(false)
  })
})

describe('resolveActiveRegion', () => {
  it('prefers a valid manual cookie choice over geo-IP', () => {
    expect(resolveActiveRegion('IE', 'GB')).toBe('IE')
    expect(resolveActiveRegion('ROW', 'IE')).toBe('ROW')
  })
  it('falls back to geo-IP when the cookie is missing or invalid', () => {
    expect(resolveActiveRegion(null, 'GB')).toBe('NI')
    expect(resolveActiveRegion('nonsense', 'IE')).toBe('IE')
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
