import { parseLinesToRanges } from '../parse'
import type { IngestionResult } from '../types'
import type { AdapterInput, SourceAdapter } from './types'

/**
 * PDF adapter (Handover §6.1b). Extracts selectable text with pdf.js, reconstructs lines from
 * text-item positions (so tabular price/spec sheets keep their rows), then runs the shared
 * line parser. Scanned PDFs with no text layer report a clear warning — OCR needs a vision/OCR
 * key (gated), so it is not attempted here.
 */
export class PdfAdapter implements SourceAdapter {
  readonly kind = 'pdf' as const

  async extract(input: AdapterInput): Promise<IngestionResult> {
    let bytes: Uint8Array
    if (typeof input.content === 'string') {
      const b64 = input.content.replace(/^data:[^;]*;base64,/, '')
      bytes = Uint8Array.from(Buffer.from(b64, 'base64'))
    } else {
      bytes = input.content
    }

    let lines: string[]
    try {
      lines = await extractPdfLines(bytes)
    } catch (err) {
      return {
        kind: 'pdf',
        ranges: [],
        sourceRef: input.sourceRef,
        warnings: [`PDF text extraction failed: ${err instanceof Error ? err.message : String(err)}`],
      }
    }

    if (lines.join('').trim() === '') {
      return {
        kind: 'pdf',
        ranges: [],
        sourceRef: input.sourceRef,
        warnings: [
          'No selectable text — this looks like a scanned PDF. OCR is not configured (needs a vision/OCR key); re-supply as text or CSV.',
        ],
      }
    }

    const parsed = parseLinesToRanges(lines)
    return {
      kind: 'pdf',
      ranges: parsed.ranges,
      sourceRef: input.sourceRef,
      warnings: [
        ...parsed.warnings,
        'PDF drafts are low-confidence — review every field before publishing.',
      ],
    }
  }
}

/** Extract text from a PDF as lines, grouping text items by vertical position. */
async function extractPdfLines(bytes: Uint8Array): Promise<string[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  // Node has no web worker; point workerSrc at the worker module so pdf.js runs it in-process
  // (an empty workerSrc throws "No GlobalWorkerOptions.workerSrc specified").
  try {
    const { createRequire } = await import('node:module')
    const { pathToFileURL } = await import('node:url')
    const require = createRequire(import.meta.url)
    // pdf.js imports this as ESM; on Windows the resolved absolute path must be a file:// URL.
    ;(pdfjs as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc =
      pathToFileURL(require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')).href
  } catch {
    /* leave default; getDocument falls back to the main-thread fake worker */
  }
  const doc = await pdfjs.getDocument({ data: bytes }).promise

  const out: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const rows = new Map<number, { x: number; str: string }[]>()
    for (const item of content.items as { str?: string; transform?: number[] }[]) {
      if (!item.str || !item.str.trim() || !item.transform) continue
      const yBucket = Math.round(item.transform[5]! / 3) * 3
      if (!rows.has(yBucket)) rows.set(yBucket, [])
      rows.get(yBucket)!.push({ x: item.transform[4]!, str: item.str })
    }
    for (const y of [...rows.keys()].sort((a, b) => b - a)) {
      out.push(
        rows
          .get(y)!
          .sort((a, b) => a.x - b.x)
          .map((c) => c.str)
          .join(' '),
      )
    }
  }
  return out
}
