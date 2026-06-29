import type { IngestionResult, SourceKind } from '../types'
import { NotImplementedAdapterError } from './types'
import type { AdapterInput, SourceAdapter } from './types'

/**
 * Image adapter placeholder (Handover §6.1d): a vision model extracts range name, sizes and
 * colour cues from a range photo. Implementation waits on a vision API key (gated input); the
 * interface is stable so the pipeline and UI can branch on it now. (CSV, URL and PDF adapters
 * are implemented in their own modules.)
 */
class StubAdapter implements SourceAdapter {
  constructor(readonly kind: SourceKind) {}
  async extract(_input: AdapterInput): Promise<IngestionResult> {
    throw new NotImplementedAdapterError(this.kind)
  }
}

export class ImageAdapter extends StubAdapter {
  constructor() {
    super('image')
  }
}
