/**
 * Publish every range — set showOnWebsite=true so the seeded catalogue appears
 * on the public site. Seeding leaves ranges as drafts (showOnWebsite=false);
 * this flips them all live in one pass.
 *
 * Run: pnpm --filter @mccartney/cms publish:all   (requires DATABASE_URI + PAYLOAD_SECRET).
 * Then run reindex so Meilisearch reflects the now-published ranges.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

async function main(): Promise<void> {
  try {
    process.loadEnvFile?.(path.resolve(dirname, '../../../.env'))
  } catch {
    /* ambient env */
  }

  // Per-row writes here; skip search indexing — the reindex script handles it in bulk.
  delete process.env.MEILISEARCH_HOST

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  // Updated ranges drop out of the not-published filter, so repeatedly drain
  // page one until nothing unpublished remains.
  let published = 0
  for (;;) {
    const res = await payload.find({
      collection: 'ranges',
      where: { showOnWebsite: { not_equals: true } },
      limit: 100,
      depth: 0,
    })
    if (res.docs.length === 0) break
    for (const doc of res.docs) {
      await payload.update({
        collection: 'ranges',
        id: (doc as { id: string | number }).id,
        data: { showOnWebsite: true },
      })
      published++
    }
  }

  const total = await payload.count({ collection: 'ranges' })
  payload.logger.info(
    `Published ${published} ranges this run; ${total.totalDocs} ranges total, all now showOnWebsite=true.`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
