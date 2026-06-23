import Papa from 'papaparse'
import { slugify } from './slugify'
import type { SeedDataset, SeedProduct, SeedRange, SeedStock, StockStatusSlug } from './types'

interface SeedRow {
  range_name: string
  size_mm: string
  status_raw: string
  status: string
  batch: string
  tiles_per_box: string
  m2_per_box: string
  tiles_per_m2: string
  boxes: string
  loose_tiles: string
  qty_tiles: string
  m2: string
}

const VALID_STATUS: ReadonlySet<string> = new Set<StockStatusSlug>([
  'in_stock',
  'out_of_stock',
  'on_order',
  'special_offer',
  'clearance',
])

function num(value: string | undefined): number | null {
  if (value == null || value.trim() === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function str(value: string | undefined): string | null {
  const t = (value ?? '').trim()
  return t === '' ? null : t
}

function normaliseStatus(raw: string): StockStatusSlug {
  return VALID_STATUS.has(raw) ? (raw as StockStatusSlug) : 'out_of_stock'
}

/**
 * Map the cleaned "Floors" stock seed CSV into Range/Product/Stock records.
 * Grouping (per data-model.md): distinct range_name → Range;
 * (range_name, size_mm) → Product; each row → Stock batch.
 */
export function mapSeedCsv(csv: string): SeedDataset {
  const parsed = Papa.parse<SeedRow>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  const ranges = new Map<string, SeedRange>()
  const products = new Map<string, SeedProduct>()
  const stock: SeedStock[] = []

  for (const row of parsed.data) {
    const rangeName = (row.range_name ?? '').trim()
    const sizeMm = (row.size_mm ?? '').trim()
    if (!rangeName || !sizeMm) continue

    const rangeSlug = slugify(rangeName)
    if (!ranges.has(rangeSlug)) ranges.set(rangeSlug, { name: rangeName, slug: rangeSlug })

    const productName = `${rangeName} ${sizeMm}`
    const productSlug = slugify(productName)
    if (!products.has(productSlug)) {
      products.set(productSlug, {
        rangeSlug,
        rangeName,
        name: productName,
        slug: productSlug,
        sizeMm,
        tilesPerBox: num(row.tiles_per_box),
        m2PerBox: num(row.m2_per_box),
        tilesPerM2: num(row.tiles_per_m2),
      })
    }

    stock.push({
      productSlug,
      status: normaliseStatus((row.status ?? '').trim()),
      statusRaw: (row.status_raw ?? '').trim(),
      batch: str(row.batch),
      boxes: num(row.boxes),
      looseTiles: num(row.loose_tiles),
      qtyTiles: num(row.qty_tiles),
      m2: num(row.m2),
    })
  }

  return {
    ranges: [...ranges.values()],
    products: [...products.values()],
    stock,
  }
}

export type { SeedDataset, SeedProduct, SeedRange, SeedStock }
