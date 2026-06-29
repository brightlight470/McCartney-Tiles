import { slugify } from '@mccartney/db'
import { buildDraftProduct } from './draft'
import type { DraftRange } from './types'

/** Tile dimensions: 600x600, 600 x 600 mm, 600x600x20. Captures the W×H. */
const SIZE_RE = /\b(\d{2,4})\s?[x×]\s?(\d{2,4})(?:\s?[x×]\s?\d{1,3})?\s?(?:mm)?\b/i

/** Lines that are clearly not product names. */
const NOISE_RE =
  /^(page\b|price|total|subtotal|vat|www\.|https?:|tel\b|email|©|copyright|home\b|menu\b|search\b|\d+%?$|[£$€]\s?\d)/i

/**
 * Turn free-text lines (from a PDF, a scraped page, or pasted text) into draft ranges. Each line
 * becomes a product; a size token is split out so multiple sizes of one name group into a single
 * range. Name-hint classifiers fill taxonomy. Confidence is inherently low — staff review.
 */
export function parseLinesToRanges(lines: string[]): { ranges: DraftRange[]; warnings: string[] } {
  const warnings: string[] = []
  const byRange = new Map<string, DraftRange>()
  const seenProduct = new Set<string>()
  let skipped = 0

  for (const raw of lines) {
    const line = raw.replace(/\s+/g, ' ').trim()
    if (!line || NOISE_RE.test(line)) continue

    const m = line.match(SIZE_RE)
    const size = m ? `${m[1]!}x${m[2]!}` : null
    let name = (m ? line.replace(m[0], ' ') : line).replace(/\s+/g, ' ').trim()
    name = name.replace(/^[•·\-–—:|,]+|[•·\-–—:|,]+$/g, '').trim()

    // Need at least two letters in the name to be a plausible product.
    if ((name.match(/[a-z]/gi)?.length ?? 0) < 2) {
      skipped++
      continue
    }

    const slug = slugify(name)
    if (!byRange.has(slug)) byRange.set(slug, { name, slug, products: [] })
    const productName = size ? `${name} ${size}` : name
    const dedupeKey = `${slug}|${size ?? ''}`
    if (seenProduct.has(dedupeKey)) continue
    seenProduct.add(dedupeKey)
    byRange.get(slug)!.products.push(buildDraftProduct(productName, size))
  }

  if (skipped) warnings.push(`${skipped} line(s) skipped — no usable product name.`)
  if (byRange.size === 0) {
    warnings.push('No products detected. Check the source, or use the CSV upload for tabular data.')
  }
  return { ranges: [...byRange.values()], warnings }
}

/** Pull candidate product names from an HTML page: image alt text + filenames + headings. */
export function extractCandidateLines(html: string): string[] {
  const out: string[] = []
  for (const m of html.matchAll(/<img[^>]*\balt="([^"]+)"/gi)) out.push(m[1]!)
  for (const m of html.matchAll(/<img[^>]*\bsrc="([^"]+\.(?:jpe?g|png|webp))"/gi)) {
    const file = (m[1] ?? '').split('/').pop() ?? ''
    out.push(
      decodeURIComponent(file)
        .replace(/\.[a-z0-9]+$/i, '')
        .replace(/[-_]+/g, ' '),
    )
  }
  for (const m of html.matchAll(/<(h[1-4]|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    out.push((m[2] ?? '').replace(/<[^>]+>/g, ' '))
  }
  return out
}
