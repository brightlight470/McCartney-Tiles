/** Normalised stock status slugs (mirror taxonomy.stockStatus). */
export type StockStatusSlug =
  | 'in_stock'
  | 'out_of_stock'
  | 'on_order'
  | 'special_offer'
  | 'clearance'

/** Account roles for price/stock gating. */
export type Role = 'public' | 'trade' | 'staff'

/** A range grouped from the stock seed. */
export interface SeedRange {
  name: string
  slug: string
}

/** A product (range + size) grouped from the stock seed. */
export interface SeedProduct {
  rangeSlug: string
  rangeName: string
  name: string
  slug: string
  sizeMm: string
  tilesPerBox: number | null
  m2PerBox: number | null
  tilesPerM2: number | null
}

/** A batch-level stock record (one CSV row). */
export interface SeedStock {
  productSlug: string
  status: StockStatusSlug
  statusRaw: string
  batch: string | null
  boxes: number | null
  looseTiles: number | null
  qtyTiles: number | null
  m2: number | null
}

export interface SeedDataset {
  ranges: SeedRange[]
  products: SeedProduct[]
  stock: SeedStock[]
}
