/**
 * One-off: collapse the per-size product rows into one product per colour, with the sizes moved
 * into the new `sizes` array (the approved Range → Product(colour) → size IA).
 *
 * Ordering matters: the new Products schema drops the old size columns when Payload pushes the
 * schema, so the previous size data is read from a dump taken from the *old-schema* CMS
 * (apps/cms/.migration/products.json — see the README at the top of the rollout). Each colour
 * group keeps its representative product's id (its stock rows are re-pointed onto it, then the
 * other members are deleted) so stock survives. Old → new slug pairs are written out for the 301
 * redirect map.
 *
 * Run (old-schema CMS must be stopped; dump already written):
 *   pnpm --filter @mccartney/cms migrate:colours
 * Then: pnpm --filter @mccartney/cms reindex
 */
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const MCC = path.resolve(dirname, '../../..') // mccartney/
const MIG = path.resolve(dirname, '..', '.migration')

interface DumpProduct {
  id: number
  name: string
  slug: string
  range: number
  sizeMm?: string | null
  sizeBand?: string | null
  thicknessMm?: number | null
  tilesPerBox?: number | null
  m2PerBox?: number | null
  tilesPerM2?: number | null
  application?: string | null
  colourGroup?: string | null
  finish?: string | null
  effect?: string | null
  material?: string | null
  edge?: string | null
  format?: string | null
  images?: (number | { id: number })[] | null
  descriptiveSymbols?: string[] | null
}

const SIZE_RE = /\s+\d+\s*[x×]\s*\d+(?:\s*[x×]\s*\d+)?\s*$/i
const stripSize = (name: string): string => name.replace(SIZE_RE, '').trim()
const slugify = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
const area = (sizeMm?: string | null): number => {
  const m = (sizeMm ?? '').match(/(\d+)\s*[x×]\s*(\d+)/i)
  return m ? Number(m[1]) * Number(m[2]) : Number.POSITIVE_INFINITY
}
const titleCase = (s: string): string => s.replace(/\b\w/g, (c) => c.toUpperCase())
const imageId = (i: number | { id: number }): number => (typeof i === 'object' ? i.id : i)

async function main(): Promise<void> {
  try {
    process.loadEnvFile?.(path.join(MCC, '.env'))
  } catch {
    /* ambient env */
  }
  // Don't sync each update to Meili one-by-one — reindex once at the end.
  delete process.env.MEILISEARCH_HOST

  const products = (JSON.parse(readFileSync(path.join(MIG, 'products.json'), 'utf8')).docs ??
    []) as DumpProduct[]
  const ranges = (JSON.parse(readFileSync(path.join(MIG, 'ranges.json'), 'utf8')).docs ?? []) as {
    id: number
    name: string
    slug: string
  }[]
  const rangeById = new Map(ranges.map((r) => [r.id, r]))

  // Group by range + colour identity (name with the trailing size token stripped).
  const groups = new Map<string, DumpProduct[]>()
  for (const p of products) {
    const key = `${p.range}::${stripSize(p.name).toLowerCase()}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(p)
  }

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  // Clear saved baskets (trade moodboards) first — their items FK-reference products and would
  // block the colour merge. These are test/dev rows; trade users re-save after the restructure.
  const baskets = await payload.find({ collection: 'baskets', limit: 1000, depth: 0 })
  for (const b of baskets.docs as unknown as { id: number }[]) {
    await payload.delete({ collection: 'baskets', id: b.id })
  }
  if (baskets.docs.length) payload.logger.info(`Cleared ${baskets.docs.length} saved baskets.`)

  const usedSlugs = new Set<string>()
  const redirects: { from: string; to: string }[] = []
  let stockRepointed = 0
  let deleted = 0
  let updated = 0

  for (const members of groups.values()) {
    const rep = members.find((m) => (m.images?.length ?? 0) > 0) ?? members[0]!
    const range = rangeById.get(rep.range)
    const rangeName = range?.name ?? ''
    const identity = stripSize(rep.name)

    // Colour label = identity minus the range-name prefix; fall back to colour group / identity.
    let colour = identity
    if (rangeName && identity.toLowerCase().startsWith(rangeName.toLowerCase())) {
      colour = identity.slice(rangeName.length).trim()
    }
    if (!colour) colour = rep.colourGroup ? titleCase(rep.colourGroup) : identity

    // Sizes: one entry per distinct sizeMm, smallest first.
    const seen = new Set<string>()
    const sizes = members
      .filter((m) => m.sizeMm && !seen.has(m.sizeMm) && seen.add(m.sizeMm))
      .sort((a, b) => area(a.sizeMm) - area(b.sizeMm))
      .map((m) => ({
        sizeMm: m.sizeMm!,
        sizeBand: m.sizeBand ?? undefined,
        thicknessMm: m.thicknessMm ?? undefined,
        tilesPerBox: m.tilesPerBox ?? undefined,
        m2PerBox: m.m2PerBox ?? undefined,
        tilesPerM2: m.tilesPerM2 ?? undefined,
      }))

    // Merge image ids across members (rep first), de-duplicated.
    const images = [
      ...new Set(
        [rep, ...members.filter((m) => m !== rep)].flatMap((m) =>
          (m.images ?? []).map(imageId),
        ),
      ),
    ]

    // Unique slug from the colour identity.
    let slug = slugify(identity) || slugify(`${rangeName}-${colour}`) || `product-${rep.id}`
    if (usedSlugs.has(slug)) {
      const rangeSlug = range?.slug ?? String(rep.range)
      slug = `${slug}-${rangeSlug}`
      let n = 2
      while (usedSlugs.has(slug)) slug = `${slugify(identity)}-${rangeSlug}-${n++}`
    }
    usedSlugs.add(slug)

    await payload.update({
      collection: 'products',
      id: rep.id,
      data: {
        name: identity,
        colour,
        slug,
        images,
        sizes,
        application: rep.application ?? undefined,
        colourGroup: rep.colourGroup ?? undefined,
        finish: rep.finish ?? undefined,
        effect: rep.effect ?? undefined,
        material: rep.material ?? undefined,
        edge: rep.edge ?? undefined,
        format: rep.format ?? undefined,
        descriptiveSymbols: rep.descriptiveSymbols ?? undefined,
        // Cast: the dump carries loose taxonomy strings; Payload's generated enums are narrower.
      } as never,
    })
    updated++

    // Re-point each non-representative member's stock onto the representative, then delete it.
    for (const m of members) {
      if (m === rep) continue
      const stock = await payload.find({
        collection: 'stock',
        where: { product: { equals: m.id } },
        limit: 1000,
        depth: 0,
      })
      for (const s of stock.docs as unknown as { id: number }[]) {
        await payload.update({ collection: 'stock', id: s.id, data: { product: rep.id } })
        stockRepointed++
      }
      // Guard: on a re-run some members are already gone — ignore "not found".
      try {
        await payload.delete({ collection: 'products', id: m.id })
        deleted++
      } catch {
        /* already deleted on a prior run */
      }
    }

    // Redirects: every old slug in the group → the new colour-product slug.
    for (const m of members) {
      if (m.slug !== slug) redirects.push({ from: `/product/${m.slug}`, to: `/product/${slug}` })
    }
  }

  writeFileSync(path.join(MIG, 'product-redirects.json'), JSON.stringify(redirects, null, 2))

  payload.logger.info(
    `Colour migration: ${products.length} size-rows → ${updated} colour-products; ` +
      `deleted ${deleted}, stock re-pointed ${stockRepointed}, redirects ${redirects.length}.`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
