/**
 * Migrate supplier logos from the legacy site into Payload media + Supplier records.
 * Reads the crawl manifest, downloads each logo, uploads to media, upserts the Supplier.
 * Run: pnpm --filter @mccartney/cms migrate:suppliers   (needs internet + a running DB).
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

/** "Bella-Casa", "NewKer-e1639658517237" → "Bella Casa", "NewKer". */
function nameFromFile(file: string): string {
  return file
    .replace(/\.png$/i, '')
    .replace(/-e\d{6,}$/i, '')
    .replace(/-\d+x\d+$/i, '')
    .replace(/-/g, ' ')
    .trim()
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
  const logos = manifest.default.images.filter((u) => /\/uploads\/2020\/10\/[^/]+\.png$/i.test(u))

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'mc-logos-'))

  let created = 0
  let skipped = 0
  for (const url of logos) {
    const file = url.split('/').pop()!
    const name = nameFromFile(file)

    const existing = await payload.find({
      collection: 'suppliers',
      where: { name: { equals: name } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      skipped++
      continue
    }

    try {
      const res = await fetch(url)
      if (!res.ok) {
        payload.logger.warn(`Skip ${name}: HTTP ${res.status}`)
        continue
      }
      const buf = Buffer.from(await res.arrayBuffer())
      const filePath = path.join(tmp, file)
      writeFileSync(filePath, buf)

      const media = await payload.create({
        collection: 'media',
        data: { alt: `${name} logo` },
        filePath,
      })
      await payload.create({
        collection: 'suppliers',
        data: { name, logo: media.id as number },
      })
      created++
      payload.logger.info(`Imported supplier ${name}`)
    } catch (err) {
      payload.logger.error({ err }, `Failed importing ${name}`)
    }
  }

  payload.logger.info(`Suppliers: ${created} created, ${skipped} already existed`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
