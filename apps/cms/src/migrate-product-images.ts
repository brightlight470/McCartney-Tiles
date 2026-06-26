/**
 * Attach range photography from the legacy-site crawl (packages/db/seed/image-manifest.json).
 * For each range it picks the best matching feature image — family name + colour, with
 * Spanish/Italian colour synonyms (gris→grey, blanco→white) and generic descriptors
 * (natural, mod, matt…) ignored — downloads it, creates a Payload media doc, and sets it as
 * the range heroImage plus the image on every product in that range.
 *
 * Idempotent: ranges that already have a heroImage are skipped. Coverage is PARTIAL — many
 * stock-sheet ranges have no photo on the legacy site, and those are left with the placeholder.
 *
 * Run: pnpm --filter @mccartney/cms migrate:images   (needs internet + a running DB).
 * Then run `reindex` so search-card thumbnails appear.
 */
import { mkdtempSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

interface Manifest {
  images: string[]
}

// Colour terms the legacy site uses in other languages, folded to one canonical word.
const SYN: Record<string, string> = {
  gris: 'grey',
  gray: 'grey',
  grigio: 'grey',
  blanco: 'white',
  blanc: 'white',
  bianco: 'white',
  negro: 'black',
  nero: 'black',
  crema: 'cream',
  marron: 'brown',
  moka: 'brown',
  mocha: 'brown',
}

// Generic descriptors that vary between the stock sheet and the site filename — ignored
// when matching so "Berwyn Alerce Natural" still matches "Berwyn-Alerce-F.I.".
const DESC = new Set([
  'mod',
  'modular',
  'matt',
  'matte',
  'gloss',
  'rect',
  'rectified',
  'lappato',
  'polished',
  'semi',
  'anti',
  'slip',
  'natural',
  'nature',
  'special',
  'offer',
  'so',
  'clearance',
  'dec',
  'multi',
  'ret',
  'feat',
  'fi',
  'f',
  'i',
  'customer',
  'project',
  'projects',
  'still',
  'life',
  'amb',
  'mm',
])

const tokens = (s: string): string[] =>
  decodeURIComponent(s)
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)

const canon = (toks: string[]): string[] =>
  toks.map((t) => SYN[t] ?? t).filter((t) => !DESC.has(t) && !/^\d/.test(t))

const area = (u: string): number => {
  const m = u.match(/(\d{2,4})x(\d{2,4})/)
  return m ? Number(m[1]) * Number(m[2]) : 0
}
const isFeature = (u: string): boolean => /f-?\.?i-?\.?\.|feat/i.test(u)

interface Candidate {
  url: string
  toks: Set<string>
}

function bestImageFor(name: string, pool: Candidate[]): string | null {
  const want = canon(tokens(name))
  if (want.length === 0) return null
  const matches = pool.filter((c) => want.every((t) => c.toks.has(t)))
  if (matches.length === 0) return null
  matches.sort(
    (a, b) => Number(isFeature(b.url)) - Number(isFeature(a.url)) || area(b.url) - area(a.url),
  )
  return matches[0]!.url
}

async function main(): Promise<void> {
  try {
    process.loadEnvFile?.(path.resolve(dirname, '../../../.env'))
  } catch {
    /* ambient env */
  }
  delete process.env.MEILISEARCH_HOST // no per-row indexing during media writes

  const manifest = (await import('../../../packages/db/seed/image-manifest.json', {
    with: { type: 'json' },
  })) as unknown as { default: Manifest }

  const pool: Candidate[] = manifest.default.images
    .filter((u) => /wp-content\/uploads\/.+\.(jpe?g|png|webp)$/i.test(u))
    .filter((u) => !/\/uploads\/2020\/10\//.test(u)) // supplier-logo dir
    .filter((u) => !/(logo|icon|scroll|favicon|cropped)/i.test(u))
    .map((u) => ({ url: u, toks: new Set(canon(tokens(u.split('/').pop()!))) }))

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'mc-images-'))

  const ranges = await payload.find({ collection: 'ranges', limit: 500, depth: 0 })

  let attached = 0
  let alreadyHad = 0
  let noMatch = 0
  const unmatched: string[] = []

  for (const range of ranges.docs as unknown as {
    id: string | number
    name: string
    heroImage?: unknown
  }[]) {
    if (range.heroImage) {
      alreadyHad++
      continue
    }
    const url = bestImageFor(range.name, pool)
    if (!url) {
      noMatch++
      unmatched.push(range.name)
      continue
    }

    try {
      const res = await fetch(url)
      if (!res.ok) {
        payload.logger.warn(`Skip ${range.name}: HTTP ${res.status}`)
        continue
      }
      const file = url.split('/').pop()!
      const filePath = path.join(tmp, file)
      writeFileSync(filePath, Buffer.from(await res.arrayBuffer()))

      const media = await payload.create({
        collection: 'media',
        data: { alt: `${range.name} tile`, credit: 'mccartneytiles.com' },
        filePath,
      })

      await payload.update({
        collection: 'ranges',
        id: range.id,
        data: { heroImage: media.id as number },
      })

      const products = await payload.find({
        collection: 'products',
        where: { range: { equals: range.id } },
        limit: 500,
        depth: 0,
      })
      for (const p of products.docs as unknown as { id: string | number; images?: unknown[] }[]) {
        if (p.images && p.images.length > 0) continue
        await payload.update({
          collection: 'products',
          id: p.id,
          data: { images: [media.id as number] },
        })
      }

      attached++
      payload.logger.info(`Attached photo to ${range.name} (${file})`)
    } catch (err) {
      payload.logger.error({ err }, `Failed importing image for ${range.name}`)
    }
  }

  payload.logger.info(
    `Images: ${attached} ranges newly photographed, ${alreadyHad} already had one, ${noMatch} no match on the legacy site.`,
  )
  if (unmatched.length > 0) {
    payload.logger.info(`No photo found for: ${unmatched.join(', ')}`)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
