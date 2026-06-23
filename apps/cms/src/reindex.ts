/**
 * Build the Meilisearch products index from the database (Handover §7).
 * Indexes products whose parent range is published; set INDEX_ALL=1 to index regardless
 * (local verification). Never indexes raw price.
 *
 * Run: pnpm --filter @mccartney/cms reindex   (needs MEILISEARCH_HOST + a seeded DB).
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'
import { searchProducts } from '@mccartney/search'
import { indexProductsFromDb } from './lib/index-products'

const dirname = path.dirname(fileURLToPath(import.meta.url))

async function main(): Promise<void> {
  try {
    process.loadEnvFile?.(path.resolve(dirname, '../../../.env'))
  } catch {
    /* ambient env */
  }
  if (!process.env.MEILISEARCH_HOST) {
    throw new Error('MEILISEARCH_HOST is not set — start Meilisearch and set the env first')
  }
  const all = process.env.INDEX_ALL === '1'

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  const result = await indexProductsFromDb(payload, { all })
  payload.logger.info(
    `Indexed ${result.indexed}, removed ${result.removed}, skipped ${result.skipped} unpublished${all ? '' : ' (set INDEX_ALL=1 to include)'}`,
  )

  let total = 0
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000))
    total = (await searchProducts({ hitsPerPage: 1 })).total
    if (total >= result.indexed && result.indexed > 0) break
  }
  payload.logger.info(`Searchable now: ${total} products`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
