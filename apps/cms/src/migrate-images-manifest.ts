/**
 * Attach range photography from the AUTHORITATIVE Cowork manifest
 * (code-kickoff/product-image-manifest.csv + code-kickoff/assets/products/<file>, produced by
 * pull-product-images.py --live). For each range with a downloaded swatch it creates a Payload
 * media doc and sets it as the range heroImage plus the image on every product in that range.
 *
 * This supersedes the heuristic migrate:images — it matches by the manifest's exact range_name
 * and OVERWRITES any prior heroImage/product image so earlier mis-matches are corrected.
 * Idempotent: media is reused by filename; ranges with no downloaded file are skipped.
 *
 * Run: pnpm --filter @mccartney/cms migrate:images:manifest   (after pull-product-images.py).
 * Then run `reindex` so search-card thumbnails refresh.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(dirname, '../../../..') // .../McCartney Tiles
const MANIFEST = path.join(ROOT, 'code-kickoff', 'product-image-manifest.csv')
const ASSETS = path.join(ROOT, 'code-kickoff', 'assets', 'products')

/** Minimal RFC-4180 CSV parser (handles quoted fields with embedded commas/quotes). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else if (c === '"') inQuotes = true
    else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((f) => f !== '')) rows.push(row)
      row = []
    } else field += c
  }
  if (field !== '' || row.length > 0) {
    row.push(field)
    if (row.some((f) => f !== '')) rows.push(row)
  }
  return rows
}

async function main(): Promise<void> {
  try {
    process.loadEnvFile?.(path.join(ROOT, 'mccartney', '.env'))
  } catch {
    /* ambient env */
  }
  delete process.env.MEILISEARCH_HOST // bulk reindex runs separately

  if (!existsSync(MANIFEST)) throw new Error(`Manifest not found: ${MANIFEST}`)
  const rows = parseCsv(readFileSync(MANIFEST, 'utf8'))
  const header = rows[0]!.map((h) => h.trim())
  const col = (name: string) => header.indexOf(name)
  const iName = col('range_name')
  const iFile = col('suggested_filename')
  const iConf = col('confidence')

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  let attached = 0
  let reused = 0
  let noFile = 0
  let noRange = 0
  const missingRanges: string[] = []

  for (const r of rows.slice(1)) {
    const name = (r[iName] ?? '').trim()
    const file = (r[iFile] ?? '').trim()
    const conf = (r[iConf] ?? '').trim()
    if (!name || conf === 'not_found' || !file) continue

    const filePath = path.join(ASSETS, file)
    if (!existsSync(filePath)) {
      noFile++
      continue
    }

    const range = await payload.find({
      collection: 'ranges',
      where: { name: { equals: name } },
      limit: 1,
      depth: 0,
    })
    const rangeDoc = range.docs[0] as { id: string | number } | undefined
    if (!rangeDoc) {
      noRange++
      missingRanges.push(name)
      continue
    }

    // Reuse media by filename so re-runs do not pile up duplicates.
    let mediaId: string | number
    const found = await payload.find({
      collection: 'media',
      where: { filename: { equals: file } },
      limit: 1,
      depth: 0,
    })
    const existingMedia = found.docs[0] as { id: string | number } | undefined
    if (existingMedia) {
      mediaId = existingMedia.id
      reused++
    } else {
      const media = await payload.create({
        collection: 'media',
        data: { alt: `${name} tile`, credit: 'mccartneytiles.com' },
        filePath,
      })
      mediaId = media.id as number
    }

    await payload.update({
      collection: 'ranges',
      id: rangeDoc.id,
      data: { heroImage: mediaId as number },
    })
    const products = await payload.find({
      collection: 'products',
      where: { range: { equals: rangeDoc.id } },
      limit: 500,
      depth: 0,
    })
    for (const p of products.docs as unknown as { id: string | number }[]) {
      await payload.update({
        collection: 'products',
        id: p.id,
        data: { images: [mediaId as number] },
      })
    }
    attached++
    payload.logger.info(`${name} ← ${file}`)
  }

  payload.logger.info(
    `Manifest images: ${attached} ranges attached (${reused} media reused), ${noFile} missing file, ${noRange} range not found.`,
  )
  if (missingRanges.length) payload.logger.info(`Range name mismatch: ${missingRanges.join(', ')}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
