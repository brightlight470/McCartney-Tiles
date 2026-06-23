/**
 * Supplier ingestion types (Handover §6). The pipeline produces DRAFT records with
 * per-field confidence; a human reviews and confirms before publish — no silent auto-publish.
 */

export type SourceKind = 'csv' | 'excel' | 'pdf' | 'url' | 'image'

/** A single proposed field value with provenance + confidence (0–1). */
export interface FieldSuggestion<T = string> {
  value: T | null
  confidence: number
  /** Where the value came from: 'name-hint' | 'column' | 'llm' | 'manual'. */
  source: 'name-hint' | 'column' | 'llm' | 'manual'
}

export interface DraftProduct {
  name: string
  sizeMm: FieldSuggestion
  sizeBand: FieldSuggestion
  application: FieldSuggestion
  colourGroup: FieldSuggestion
  finish: FieldSuggestion
  effect: FieldSuggestion
  material: FieldSuggestion
  edge: FieldSuggestion
  format: FieldSuggestion
}

export interface DraftRange {
  name: string
  slug: string
  products: DraftProduct[]
}

/** Output of an adapter run, ready for the review screen. */
export interface IngestionResult {
  kind: SourceKind
  ranges: DraftRange[]
  /** Raw source kept attached for audit (file ref, URL, sheet name…). */
  sourceRef: string
  warnings: string[]
}

/** Publish toggles set on the review screen (Handover §6.4). */
export interface PublishToggles {
  showOnWebsite: boolean
  pushToStore: boolean // Phase 2
}
