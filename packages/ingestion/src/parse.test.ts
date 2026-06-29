import { describe, expect, it } from 'vitest'
import { extractCandidateLines, parseLinesToRanges } from './parse'

describe('parseLinesToRanges', () => {
  it('groups sizes of one name into a single range and splits the size token', () => {
    const { ranges } = parseLinesToRanges([
      'Balti Grey 600x600',
      'Balti Grey 300x600',
      'Balti White 600x600',
    ])
    const balti = ranges.find((r) => r.name === 'Balti Grey')
    expect(balti?.products).toHaveLength(2)
    expect(balti?.products.map((p) => p.sizeMm.value).sort()).toEqual(['300x600', '600x600'])
    expect(ranges.find((r) => r.name === 'Balti White')?.products).toHaveLength(1)
  })

  it('filters noise lines and de-duplicates identical rows', () => {
    const { ranges } = parseLinesToRanges([
      'Price List',
      'Page 1',
      '£24.99',
      'Tempo Gris 600x1200',
      'Tempo Gris 600x1200',
    ])
    expect(ranges).toHaveLength(1)
    expect(ranges[0]!.name).toBe('Tempo Gris')
    expect(ranges[0]!.products).toHaveLength(1)
  })

  it('warns when nothing usable is found', () => {
    const { ranges, warnings } = parseLinesToRanges(['', '   ', '123'])
    expect(ranges).toHaveLength(0)
    expect(warnings.join(' ')).toMatch(/No products detected/)
  })
})

describe('extractCandidateLines', () => {
  it('pulls names from image alt text, filenames and headings', () => {
    const html = `
      <img alt="Bloka Beige 800x800" src="https://x/Bloka-Beige-800x800-F.I.png">
      <h2>Tercio Blanco</h2>
      <figcaption>Yuko Beige 600x1200</figcaption>
    `
    const lines = extractCandidateLines(html)
    expect(lines.some((l) => l.includes('Bloka Beige'))).toBe(true)
    expect(lines.some((l) => l.includes('Tercio Blanco'))).toBe(true)
    expect(lines.some((l) => /Yuko Beige/.test(l))).toBe(true)
  })
})
