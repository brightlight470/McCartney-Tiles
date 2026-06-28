import { describe, expect, it } from 'vitest'
import { legacyRedirects } from './redirects.mjs'

describe('legacyRedirects', () => {
  const redirects = legacyRedirects()

  it('returns many permanent redirects', () => {
    expect(redirects.length).toBeGreaterThan(50)
    expect(redirects.every((r) => r.permanent === true)).toBe(true)
  })

  it('has unique sources (no conflicting rules)', () => {
    const sources = redirects.map((r) => r.source)
    expect(new Set(sources).size).toBe(sources.length)
  })

  it('maps a known category to pre-filtered search', () => {
    expect(redirects.find((r) => r.source === '/wood-effect-ranges')?.destination).toBe(
      '/ranges?effect=wood',
    )
    expect(redirects.find((r) => r.source === '/about-us')?.destination).toBe('/about')
  })

  it('maps legacy size pages to their category facet', () => {
    expect(redirects.find((r) => r.source === '/600x600-mm-porcelain-tiles')?.destination).toBe(
      '/ranges?material=porcelain',
    )
    expect(redirects.find((r) => r.source === '/300x600-mm-wall-tiles')?.destination).toBe(
      '/ranges?application=wall',
    )
    expect(redirects.find((r) => r.source === '/600x600-mm-wood-effect-tiles')?.destination).toBe(
      '/ranges?effect=wood',
    )
    expect(redirects.find((r) => r.source === '/600x600x20-mm-outdoor-tiles')?.destination).toBe(
      '/ranges?application=outdoor',
    )
  })
})
