import { describe, expect, it } from 'vitest'
import { activeFilters, isActive, parseSearchParams, toggleHref } from './search-facets'

describe('parseSearchParams', () => {
  it('parses facets, in-stock, page and sort', () => {
    const p = parseSearchParams({
      colour: 'grey,white',
      finish: 'natural',
      stock: 'in',
      page: '2',
      sort: 'name',
    })
    expect(p.filters.colourGroup).toEqual(['grey', 'white'])
    expect(p.filters.finish).toEqual(['natural'])
    expect(p.filters.inStock).toEqual(['true'])
    expect(p.page).toBe(2)
    expect(p.sort).toEqual(['name:asc'])
  })

  it('applies safe defaults', () => {
    const p = parseSearchParams({})
    expect(p.q).toBe('')
    expect(p.page).toBe(1)
    expect(p.sort).toBeUndefined()
    expect(Object.keys(p.filters)).toHaveLength(0)
  })
})

describe('toggleHref', () => {
  it('adds a value and drops pagination', () => {
    const href = toggleHref({ page: '3' }, 'colour', 'grey')
    expect(href).toContain('colour=grey')
    expect(href).not.toContain('page=')
  })
  it('removing the last value returns the bare path', () => {
    expect(toggleHref({ colour: 'grey' }, 'colour', 'grey')).toBe('/products')
  })
})

describe('isActive', () => {
  it('detects a selected value', () => {
    expect(isActive({ colour: 'grey,white' }, 'colour', 'white')).toBe(true)
    expect(isActive({ colour: 'grey' }, 'colour', 'blue')).toBe(false)
  })
})

describe('activeFilters', () => {
  it('lists chips including in-stock', () => {
    const f = activeFilters({ colour: 'grey', stock: 'in' })
    expect(f.some((x) => x.label.startsWith('Colour'))).toBe(true)
    expect(f.some((x) => x.value === 'in')).toBe(true)
  })
})
