import type { IngestionResult, SourceKind } from '../types'
import { NotImplementedAdapterError } from './types'
import type { AdapterInput, SourceAdapter } from './types'

/**
 * Placeholders for the remaining input adapters (Handover §6.1). Interfaces are stable;
 * implementations land in Sprint 1:
 *  - PDF: table + text extraction, OCR fallback, LLM field-mapping for messy docs.
 *  - URL: fetch + scrape product attributes/images.
 *  - image: vision model extracts range name, sizes, colour cues.
 */
class StubAdapter implements SourceAdapter {
  constructor(readonly kind: SourceKind) {}
  async extract(_input: AdapterInput): Promise<IngestionResult> {
    throw new NotImplementedAdapterError(this.kind)
  }
}

export class PdfAdapter extends StubAdapter {
  constructor() {
    super('pdf')
  }
}
export class UrlAdapter extends StubAdapter {
  constructor() {
    super('url')
  }
}
export class ImageAdapter extends StubAdapter {
  constructor() {
    super('image')
  }
}
