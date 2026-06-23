import taxonomyJson from '../seed/taxonomy.json' with { type: 'json' }

export interface TaxonomyTerm {
  slug: string
  label: string
  synonyms?: string[]
  raw?: string
}

type RawTaxonomy = {
  application: TaxonomyTerm[]
  material: TaxonomyTerm[]
  colourGroup: TaxonomyTerm[]
  effect: TaxonomyTerm[]
  design: TaxonomyTerm[]
  finish: TaxonomyTerm[]
  edge: TaxonomyTerm[]
  format: TaxonomyTerm[]
  sizeBand: TaxonomyTerm[]
  sizesFloorSeed_mm: string[]
  stockStatus: TaxonomyTerm[]
}

export const taxonomy = taxonomyJson as unknown as RawTaxonomy

/** Facet keys that are first-class taxonomies (drive PIM selects + search facets). */
export const FACET_KEYS = [
  'application',
  'material',
  'colourGroup',
  'effect',
  'design',
  'finish',
  'edge',
  'format',
  'sizeBand',
] as const
export type FacetKey = (typeof FACET_KEYS)[number]

/** Payload/HTML <select>-shaped options for a taxonomy group. */
export function options(key: FacetKey): { label: string; value: string }[] {
  return (taxonomy[key] as TaxonomyTerm[]).map((t) => ({ label: t.label, value: t.slug }))
}

/** Resolve a slug to its human label within a group; falls back to the slug. */
export function labelFor(key: FacetKey | 'stockStatus', slug: string): string {
  const term = (taxonomy[key] as TaxonomyTerm[]).find((t) => t.slug === slug)
  return term?.label ?? slug
}

export const stockStatusOptions = taxonomy.stockStatus.map((t) => ({
  label: t.label,
  value: t.slug,
}))
