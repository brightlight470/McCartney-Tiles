import { options as taxOptions } from '@mccartney/db'

export type RawParams = Record<string, string | string[] | undefined>

export interface FacetDef {
  param: string // URL param
  attr: string // Meilisearch attribute (ProductDocument key)
  label: string
  options: { label: string; value: string }[]
}

// Suitability filter (Handover §8) on the multi-value `applications` attribute: a wall-and-floor
// tile matches both Wall and Floor; Exterior maps to outdoor.
const APPLICATION_OPTIONS = [
  { value: 'wall', label: 'Wall' },
  { value: 'floor', label: 'Floor' },
  { value: 'outdoor', label: 'Exterior' },
]

/** Facet groups shown in the sidebar, mapped to taxonomy options. */
export const FACETS: FacetDef[] = [
  { param: 'colour', attr: 'colourGroup', label: 'Colour', options: taxOptions('colourGroup') },
  { param: 'effect', attr: 'effect', label: 'Effect', options: taxOptions('effect') },
  { param: 'finish', attr: 'finish', label: 'Finish', options: taxOptions('finish') },
  { param: 'material', attr: 'material', label: 'Material', options: taxOptions('material') },
  { param: 'application', attr: 'applications', label: 'Application', options: APPLICATION_OPTIONS },
  { param: 'edge', attr: 'edge', label: 'Edge', options: taxOptions('edge') },
  { param: 'size', attr: 'sizeBands', label: 'Size', options: taxOptions('sizeBand') },
  { param: 'format', attr: 'format', label: 'Format', options: taxOptions('format') },
]

const ALL_PARAMS = [...FACETS.map((f) => f.param), 'stock', 'q', 'sort', 'page']

const BASE = '/products'

function listParam(v: string | string[] | undefined): string[] {
  if (!v) return []
  const s = Array.isArray(v) ? v.join(',') : v
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

export interface ParsedParams {
  q: string
  page: number
  sort?: string[]
  filters: Record<string, string[]>
}

export function parseSearchParams(sp: RawParams): ParsedParams {
  const filters: Record<string, string[]> = {}
  for (const f of FACETS) {
    const vals = listParam(sp[f.param])
    if (vals.length) filters[f.attr] = vals
  }
  if (listParam(sp.stock).includes('in')) filters.inStock = ['true']

  const q = typeof sp.q === 'string' ? sp.q : ''
  const page = Math.max(1, Number(typeof sp.page === 'string' ? sp.page : 1) || 1)
  const sortRaw = typeof sp.sort === 'string' ? sp.sort : undefined
  const sort =
    sortRaw === 'name' ? ['name:asc'] : sortRaw === 'price' ? ['priceBandOrder:asc'] : undefined

  return { q, page, sort, filters }
}

type Overrides = Record<string, string[] | string | undefined>

export function buildQuery(sp: RawParams, overrides: Overrides = {}): string {
  const usp = new URLSearchParams()
  const get = (p: string): string[] => {
    if (p in overrides) {
      const o = overrides[p]
      return o == null ? [] : Array.isArray(o) ? o : [o]
    }
    return listParam(sp[p])
  }
  for (const p of ALL_PARAMS) {
    const vals = get(p)
    if (vals.length) usp.set(p, vals.join(','))
  }
  const s = usp.toString()
  return s ? `${BASE}?${s}` : BASE
}

/** Toggle a facet value on/off; resets pagination. */
export function toggleHref(sp: RawParams, param: string, value: string): string {
  const current = listParam(sp[param])
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
  return buildQuery(sp, { [param]: next, page: undefined })
}

export function isActive(sp: RawParams, param: string, value: string): boolean {
  return listParam(sp[param]).includes(value)
}

export function pageHref(sp: RawParams, page: number): string {
  return buildQuery(sp, { page: page > 1 ? String(page) : undefined })
}

export function sortHref(sp: RawParams, sort: string | undefined): string {
  return buildQuery(sp, { sort, page: undefined })
}

export function clearHref(): string {
  return BASE
}

/** Active filter chips (param/value/label) for the "active filters" row. */
export function activeFilters(sp: RawParams): { param: string; value: string; label: string }[] {
  const out: { param: string; value: string; label: string }[] = []
  for (const f of FACETS) {
    for (const value of listParam(sp[f.param])) {
      const opt = f.options.find((o) => o.value === value)
      out.push({ param: f.param, value, label: `${f.label}: ${opt?.label ?? value}` })
    }
  }
  if (listParam(sp.stock).includes('in')) {
    out.push({ param: 'stock', value: 'in', label: 'In stock' })
  }
  return out
}
