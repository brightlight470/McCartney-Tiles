import { describe, expect, it } from 'vitest'
import { mapSeedCsv } from './seed-mapping'

const CSV = `range_name,size_mm,status_raw,status,batch,tiles_per_box,m2_per_box,tiles_per_m2,boxes,loose_tiles,qty_tiles,m2
Balti Grey,500x500,Current Stock,in_stock,03/02,4,1,4,1,2,6,1.5
Balti Grey,500x500,Current Stock,in_stock,10/2,4,1,4,2,1,9,2.25
Balti White,500x500,Current Stock,in_stock,05/02,4,1,4,2,1,9,2.25
Blackwater Slate,600x600,Out of Stock,out_of_stock,OOS,4,1.44,2.78,,,0,0`

describe('mapSeedCsv', () => {
  const ds = mapSeedCsv(CSV)

  it('creates one Range per distinct range_name', () => {
    expect(ds.ranges.map((r) => r.slug).sort()).toEqual([
      'balti-grey',
      'balti-white',
      'blackwater-slate',
    ])
  })

  it('creates one Product per (range_name, size_mm)', () => {
    expect(ds.products).toHaveLength(3)
    const balti = ds.products.find((p) => p.slug === 'balti-grey-500x500')
    expect(balti?.sizeMm).toBe('500x500')
    expect(balti?.tilesPerBox).toBe(4)
  })

  it('creates one Stock record per CSV row', () => {
    expect(ds.stock).toHaveLength(4)
    const baltiGrey = ds.stock.filter((s) => s.productSlug === 'balti-grey-500x500')
    expect(baltiGrey).toHaveLength(2)
  })

  it('parses empties to null and keeps raw status for audit', () => {
    const oos = ds.stock.find((s) => s.productSlug === 'blackwater-slate-600x600')
    expect(oos?.boxes).toBeNull()
    expect(oos?.status).toBe('out_of_stock')
    expect(oos?.statusRaw).toBe('Out of Stock')
  })
})
