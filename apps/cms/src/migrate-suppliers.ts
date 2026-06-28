/**
 * Migrate supplier/brand logos from the legacy site into Payload media + Supplier records.
 * Brand-list driven: each supplier's logo is located in the crawl manifest by filename token
 * (any folder/extension), downloaded, uploaded to media, and a Supplier upserted by name.
 * Idempotent — suppliers that already exist are skipped, so re-runs only add missing brands.
 *
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

// The ~18 brands in the homepage "Finest Tiles" strip. `token` matches the start of the logo's
// filename (lower-cased, extension-agnostic); `name` is the canonical Supplier name.
const SUPPLIERS: { name: string; token: string }[] = [
  { name: 'Grespania', token: 'grespania' },
  { name: 'Bella Casa', token: 'bella-casa' },
  { name: 'Porcelanite', token: 'porcelanite' },
  { name: 'Abitare', token: 'abitare' },
  { name: 'NewKer', token: 'newker' },
  { name: 'Durstone', token: 'durstone' },
  { name: 'Cerdisa', token: 'cerdisa' },
  { name: 'Ricchetti', token: 'ricchetti' },
  { name: 'Tagina', token: 'tagina' },
  { name: 'ABK', token: 'abk' },
  { name: 'Arcana', token: 'arcana' },
  { name: 'Baldocer', token: 'baldocer' },
  { name: 'Unicom', token: 'unicom' },
  { name: 'Settecento', token: 'settecento' },
  { name: 'Elios Ceramica', token: 'elios' },
  { name: 'Porcelánicos HDC', token: 'porcelanicos-hdc' },
  { name: 'GCR', token: 'gcr' },
]

const baseName = (url: string): string =>
  decodeURIComponent(url.split('/').pop() ?? '')
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()

function findLogo(images: string[], token: string): string | undefined {
  // Prefer an exact base match, then a prefix match (handles -eNNN / -size suffixes).
  return (
    images.find((u) => baseName(u) === token) ??
    images.find((u) => baseName(u).startsWith(token))
  )
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
  const images = manifest.default.images

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'mc-logos-'))

  let created = 0
  let skipped = 0
  let notFound = 0

  for (const { name, token } of SUPPLIERS) {
    const existing = await payload.find({
      collection: 'suppliers',
      where: { name: { equals: name } },
      limit: 1,
    })
    if (existing.docs.length > 0) {
      skipped++
      continue
    }

    const url = findLogo(images, token)
    if (!url) {
      notFound++
      payload.logger.warn(`No logo found for ${name} (token ${token})`)
      continue
    }

    try {
      const file = url.split('/').pop()!
      const res = await fetch(url)
      if (!res.ok) {
        payload.logger.warn(`Skip ${name}: HTTP ${res.status}`)
        continue
      }
      const filePath = path.join(tmp, file)
      writeFileSync(filePath, Buffer.from(await res.arrayBuffer()))

      const media = await payload.create({
        collection: 'media',
        data: { alt: `${name} logo`, credit: 'mccartneytiles.com' },
        filePath,
      })
      await payload.create({
        collection: 'suppliers',
        data: { name, logo: media.id as number },
      })
      created++
      payload.logger.info(`Imported supplier ${name} (${file})`)
    } catch (err) {
      payload.logger.error({ err }, `Failed importing ${name}`)
    }
  }

  payload.logger.info(
    `Suppliers: ${created} created, ${skipped} already existed, ${notFound} logo not found.`,
  )
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
