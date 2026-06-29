import { extractCandidateLines, parseLinesToRanges } from '../parse'
import type { IngestionResult } from '../types'
import type { AdapterInput, SourceAdapter } from './types'

/**
 * URL adapter (Handover §6.1c). Fetches a supplier/category page and scrapes candidate product
 * names (image alt text + filenames + headings) into draft ranges for review. If `content` is
 * HTML rather than a URL it is parsed directly — keeps the scrape logic unit-testable offline.
 */
export class UrlAdapter implements SourceAdapter {
  readonly kind = 'url' as const

  async extract(input: AdapterInput): Promise<IngestionResult> {
    const raw = typeof input.content === 'string' ? input.content : new TextDecoder().decode(input.content)
    const warnings: string[] = []
    let html = raw

    if (/^https?:\/\//i.test(raw.trim())) {
      try {
        const res = await fetch(raw.trim(), {
          headers: { 'User-Agent': 'McCartneyTiles-Ingestion/1.0' },
        })
        if (!res.ok) {
          return {
            kind: 'url',
            ranges: [],
            sourceRef: input.sourceRef,
            warnings: [`Fetch failed: HTTP ${res.status}`],
          }
        }
        html = await res.text()
      } catch (err) {
        return {
          kind: 'url',
          ranges: [],
          sourceRef: input.sourceRef,
          warnings: [`Fetch error: ${err instanceof Error ? err.message : String(err)}`],
        }
      }
    }

    const lines = extractCandidateLines(html)
    const parsed = parseLinesToRanges(lines)
    warnings.push(...parsed.warnings)
    warnings.push('Scraped drafts are low-confidence — review every field before publishing.')

    return { kind: 'url', ranges: parsed.ranges, sourceRef: input.sourceRef, warnings }
  }
}
