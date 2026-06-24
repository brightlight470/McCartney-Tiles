/**
 * Bootstrap product taxonomy in the DB from name-hint classifiers (effect/colour/finish/
 * format/size band), filling only empty fields. Persists what was index-only so the PIM,
 * search and ingestion agree. Staff can correct any value in the admin afterwards.
 * Run: pnpm --filter @mccartney/cms migrate:taxonomy
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import {
  classifyColour,
  classifyEffect,
  classifyFinish,
  classifyFormat,
  classifySizeBand,
} from '@mccartney/ingestion'
import { indexProductsFromDb } from './lib/index-products'

const dirname = path.dirname(fileURLToPath(import.meta.url))

interface ProductRow {
  id: string | number
  name: string
  sizeMm?: string | null
  sizeBand?: string | null
  colourGroup?: string | null
  finish?: string | null
  effect?: string | null
  format?: string | null
}

async function main(): Promise<void> {
  try {
    process.loadEnvFile?.(path.resolve(dirname, '../../../.env'))
  } catch {
    /* ambient env */
  }

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  const res = await payload.find({ collection: 'products', limit: 5000, depth: 0 })
  let updated = 0
  for (const p of res.docs as unknown as ProductRow[]) {
    const patch: Record<string, string> = {}
    if (!p.effect) {
      const v = classifyEffect(p.name).value
      if (v) patch.effect = v
    }
    if (!p.colourGroup) {
      const v = classifyColour(p.name).value
      if (v) patch.colourGroup = v
    }
    if (!p.finish) {
      const v = classifyFinish(p.name).value
      if (v) patch.finish = v
    }
    if (!p.format) {
      const v = classifyFormat(p.name).value
      if (v) patch.format = v
    }
    if (!p.sizeBand) {
      const v = classifySizeBand(p.sizeMm ?? null).value
      if (v) patch.sizeBand = v
    }
    if (Object.keys(patch).length === 0) continue
    await payload.update({
      collection: 'products',
      id: p.id,
      data: patch as unknown as never,
    })
    updated++
  }
  payload.logger.info(`Taxonomy bootstrapped on ${updated} products`)

  if (process.env.MEILISEARCH_HOST) {
    const idx = await indexProductsFromDb(payload, { all: true })
    payload.logger.info(`Reindexed ${idx.indexed} products`)
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
