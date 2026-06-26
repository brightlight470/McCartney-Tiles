/**
 * Catalogue/content data layer. Reads from the Payload REST API. Every call degrades
 * gracefully (try/catch → empty/null) so the web app builds and renders before the CMS
 * is running. `no-store` keeps these dynamic — no build-time prerender against a live CMS.
 */
const CMS_URL = process.env.CMS_URL ?? 'http://localhost:3001'

export interface MediaRef {
  url?: string | null
  alt?: string | null
  sizes?: Record<string, { url?: string | null } | undefined>
}

/**
 * Absolute URL for a Payload media ref, preferring a named image size. Media is served by
 * the CMS, so relative Payload URLs are prefixed with CMS_URL to be browser-loadable.
 */
export function mediaUrl(
  ref?: MediaRef | string | number | null,
  size?: 'thumbnail' | 'card' | 'hero',
): string | null {
  if (!ref || typeof ref !== 'object') return null
  const rel = (size && ref.sizes?.[size]?.url) || ref.url
  if (!rel) return null
  return rel.startsWith('http') ? rel : `${CMS_URL}${rel}`
}

export interface Range {
  id: string | number
  name: string
  slug: string
  description?: string | null
  story?: unknown
  heroImage?: MediaRef | null
  effect?: string[] | null
  design?: string[] | null
  showOnWebsite?: boolean
  seo?: { title?: string | null; description?: string | null } | null
}

export interface Product {
  id: string | number
  name: string
  slug: string
  range?: Range | string | number | null
  sizeMm?: string | null
  sizeBand?: string | null
  application?: string | null
  colourGroup?: string | null
  finish?: string | null
  effect?: string | null
  material?: string | null
  edge?: string | null
  format?: string | null
  thicknessMm?: number | null
  tilesPerBox?: number | null
  m2PerBox?: number | null
  tilesPerM2?: number | null
  images?: MediaRef[] | null
}

export interface Showroom {
  id: string | number
  name: string
  address: string
  postcode?: string | null
  hours?: string | null
  lat?: number | null
  lng?: number | null
}

export interface Project {
  id: string | number
  title: string
  slug: string
  location?: string | null
  images?: MediaRef[] | null
}

export interface Faq {
  id: string | number
  question: string
  answer: string
  category?: string | null
  order?: number
}

export interface Testimonial {
  id: string | number
  author: string
  rating?: number | null
  text: string
  source?: string | null
  date?: string | null
}

interface PayloadList<T> {
  docs: T[]
}

async function cmsList<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${CMS_URL}${path}`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = (await res.json()) as PayloadList<T>
    return json.docs ?? []
  } catch {
    return []
  }
}

export async function getPublishedRanges(): Promise<Range[]> {
  return cmsList<Range>('/api/ranges?where[showOnWebsite][equals]=true&limit=200&depth=1')
}

export async function getRangeBySlug(slug: string): Promise<Range | null> {
  const docs = await cmsList<Range>(
    `/api/ranges?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=1`,
  )
  return docs[0] ?? null
}

export async function getProductsForRange(rangeId: string | number): Promise<Product[]> {
  return cmsList<Product>(`/api/products?where[range][equals]=${rangeId}&limit=200&depth=1`)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const docs = await cmsList<Product>(
    `/api/products?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=2`,
  )
  return docs[0] ?? null
}

export async function getShowrooms(): Promise<Showroom[]> {
  return cmsList<Showroom>('/api/showrooms?limit=50')
}

export async function getProjects(): Promise<Project[]> {
  return cmsList<Project>('/api/projects?limit=50&depth=1')
}

export async function getFaqs(): Promise<Faq[]> {
  return cmsList<Faq>('/api/faqs?limit=200&sort=order')
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return cmsList<Testimonial>('/api/testimonials?limit=100&sort=-date')
}

export interface StockSummary {
  inStock: boolean
  status: string | null
  totalM2: number | null
}

interface StockRow {
  status?: string | null
  m2?: number | null
}

/** Public availability for a product (no price). Aggregates batch rows. */
export async function getStockForProduct(productId: string | number): Promise<StockSummary> {
  const rows = await cmsList<StockRow>(
    `/api/stock?where[product][equals]=${productId}&limit=500&depth=0`,
  )
  if (rows.length === 0) return { inStock: false, status: null, totalM2: null }
  const inStock = rows.some((r) => r.status === 'in_stock')
  const totalM2 = rows.reduce((sum, r) => sum + (r.m2 ?? 0), 0)
  return {
    inStock,
    status: inStock ? 'in_stock' : (rows[0]?.status ?? null),
    totalM2: Number.isFinite(totalM2) ? Math.round(totalM2 * 100) / 100 : null,
  }
}
