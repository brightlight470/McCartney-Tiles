import { describe, expect, it } from 'vitest'
import { priceBandFor, toProductDocument } from './product-document'

describe('priceBandFor', () => {
  it('returns null band for unpriced products', () => {
    expect(priceBandFor(null).band).toBeNull()
    expect(priceBandFor(undefined).band).toBeNull()
  })

  it('maps retail £/m² to coarse bands', () => {
    expect(priceBandFor(20).band).toBe('£')
    expect(priceBandFor(35).band).toBe('££')
    expect(priceBandFor(60).band).toBe('£££')
    expect(priceBandFor(120).band).toBe('££££')
  })
})

describe('toProductDocument', () => {
  it('never carries a raw price field through', () => {
    const doc = toProductDocument({
      id: '1',
      rangeName: 'Balti Grey',
      rangeSlug: 'balti-grey',
      name: 'Balti Grey 500x500',
      slug: 'balti-grey-500x500',
      retailPerM2: 32,
      inStock: true,
    })
    expect(doc.priceBand).toBe('££')
    expect(doc).not.toHaveProperty('retailPerM2')
    expect(doc).not.toHaveProperty('tradePerM2')
    expect(doc).not.toHaveProperty('costPerM2')
  })
})
