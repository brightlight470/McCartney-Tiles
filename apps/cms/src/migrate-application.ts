/**
 * Tag products with their application (wall / floor / wall-floor / outdoor) by crawling the
 * legacy site's category pages (Handover §8 wants a usable wall/floor/exterior filter). A range
 * is matched into a category by its name (brand-alias aware) or its known product-image filename.
 *
 *   outdoor          → appears in /outdoor-porcelain/
 *   wall-floor       → in a wall category AND a floor category (the common case + default)
 *   wall (wall-only) → in a wall category but not a floor category
 *   floor            → in a floor category only
 *
 * Coverage is approximate (the legacy Tile Viewer is paginated) — unmatched ranges default to
 * wall-floor, the safe general case; staff refine in the PIM. Run reindex afterwards.
 *
 * Run: pnpm --filter @mccartney/cms migrate:application   (needs internet + a running DB).
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(dirname, '../../../..')
const MANIFEST = path.join(ROOT, 'code-kickoff', 'product-image-manifest.csv')
const BASE = 'https://www.mccartneytiles.com'

// Spreadsheet spelling → how the live site spells the range (from pull-product-images.py).
const ALIAS: Record<string, string> = {
  balti: 'baltimore', medovio: 'medioevo', photon: 'phorma', tempra: 'tempo', toddy: 'today',
  prior: 'prioraton', megane: 'megeve', indicta: 'indiana', yuko: 'yukatan', murreto: 'muretto',
  terrazo: 'terrazzo',
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], field = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else q = false } else field += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((f) => f !== '')) rows.push(row)
      row = []
    } else field += c
  }
  if (field !== '' || row.length) { row.push(field); if (row.some((f) => f !== '')) rows.push(row) }
  return rows
}

const firstToken = (name: string): string => {
  const t = name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)
  const base = t[0] ?? name.toLowerCase()
  return ALIAS[base] ?? base
}

async function getPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'McCartneyTiles-Application/1.0' } })
    return res.ok ? (await res.text()).toLowerCase() : ''
  } catch {
    return ''
  }
}

async function main(): Promise<void> {
  try {
    process.loadEnvFile?.(path.join(ROOT, 'mccartney', '.env'))
  } catch {
    /* ambient env */
  }
  delete process.env.MEILISEARCH_HOST

  // range name → legacy image filename base (size/ext stripped) for a second match signal.
  const imgBase = new Map<string, string>()
  const rows = parseCsv(readFileSync(MANIFEST, 'utf8'))
  const header = rows[0]!
  const iName = header.indexOf('range_name')
  const iUrl = header.indexOf('image_url')
  for (const r of rows.slice(1)) {
    const url = (r[iUrl] ?? '').trim()
    if (!url) continue
    const f = (url.split('/').pop() ?? '')
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, '')
      .replace(/-\d+x\d+.*$/, '')
    if (f) imgBase.set((r[iName] ?? '').trim(), f)
  }

  const pages = {
    wall: await getPage(`${BASE}/wall-tiles/`),
    outdoor: await getPage(`${BASE}/outdoor-porcelain/`),
    floor: await getPage(`${BASE}/porcelain-tiles/`),
    wood: await getPage(`${BASE}/wood-effect-ranges/`),
  }

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  const inPage = (name: string, html: string): boolean => {
    if (!html) return false
    if (new RegExp(`\\b${firstToken(name)}\\b`).test(html)) return true
    const b = imgBase.get(name)
    return Boolean(b && html.includes(b))
  }
  type Application = 'wall' | 'floor' | 'wall-floor' | 'outdoor'
  const applicationFor = (name: string): Application => {
    if (inPage(name, pages.outdoor)) return 'outdoor'
    const wall = inPage(name, pages.wall)
    const floor = inPage(name, pages.floor) || inPage(name, pages.wood)
    if (wall && floor) return 'wall-floor'
    if (wall) return 'wall'
    if (floor) return 'floor'
    return 'wall-floor'
  }

  const ranges = await payload.find({ collection: 'ranges', limit: 500, depth: 0 })
  const tally: Record<Application, number> = { wall: 0, floor: 0, 'wall-floor': 0, outdoor: 0 }
  let products = 0

  for (const range of ranges.docs as unknown as { id: string | number; name: string }[]) {
    const application = applicationFor(range.name)
    tally[application] = (tally[application] ?? 0) + 1
    const prods = await payload.find({
      collection: 'products',
      where: { range: { equals: range.id } },
      limit: 500,
      depth: 0,
    })
    for (const p of prods.docs as unknown as { id: string | number }[]) {
      await payload.update({ collection: 'products', id: p.id, data: { application } })
      products++
    }
  }

  payload.logger.info(
    `Application tagged on ${products} products across ${ranges.docs.length} ranges: ${JSON.stringify(tally)}`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
