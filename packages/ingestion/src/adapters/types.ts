import type { IngestionResult, SourceKind } from '../types'

export interface AdapterInput {
  /** Raw source bytes (binary adapters) or text (csv/url). */
  content: string | Uint8Array
  /** Human-readable provenance kept for audit (filename, URL, sheet). */
  sourceRef: string
  /** Optional column → field mapping for tabular sources. */
  columnMap?: { range?: string; name?: string; size?: string }
}

export interface SourceAdapter {
  readonly kind: SourceKind
  extract(input: AdapterInput): Promise<IngestionResult>
}

export class NotImplementedAdapterError extends Error {
  constructor(kind: SourceKind) {
    super(`Ingestion adapter "${kind}" is not implemented yet (Sprint 1)`)
    this.name = 'NotImplementedAdapterError'
  }
}
