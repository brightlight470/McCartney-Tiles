import Papa from 'papaparse'
import { slugify } from '@mccartney/db'
import { buildDraftProduct } from '../draft'
import type { DraftProduct, DraftRange, IngestionResult } from '../types'
import type { AdapterInput, SourceAdapter } from './types'

/**
 * CSV/Excel-export adapter. Maps tabular supplier data to draft ranges/products,
 * running name-hint classifiers. The review screen lets staff confirm or correct.
 */
export class CsvAdapter implements SourceAdapter {
  readonly kind = 'csv' as const

  async extract(input: AdapterInput): Promise<IngestionResult> {
    const text =
      typeof input.content === 'string' ? input.content : new TextDecoder().decode(input.content)
    const cols = {
      range: input.columnMap?.range ?? 'range_name',
      name: input.columnMap?.name ?? 'range_name',
      size: input.columnMap?.size ?? 'size_mm',
    }
    const warnings: string[] = []

    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    })

    const byRange = new Map<string, DraftRange>()
    for (const row of parsed.data) {
      const rangeName = (row[cols.range] ?? '').trim()
      const baseName = (row[cols.name] ?? rangeName).trim()
      const size = (row[cols.size] ?? '').trim() || null
      if (!rangeName) {
        warnings.push('Row skipped: missing range name')
        continue
      }
      const slug = slugify(rangeName)
      if (!byRange.has(slug)) byRange.set(slug, { name: rangeName, slug, products: [] })
      const productName = size ? `${baseName} ${size}` : baseName
      const draft: DraftProduct = buildDraftProduct(productName, size)
      byRange.get(slug)!.products.push(draft)
    }

    return {
      kind: 'csv',
      ranges: [...byRange.values()],
      sourceRef: input.sourceRef,
      warnings,
    }
  }
}
