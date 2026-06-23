/**
 * Create local test accounts + one price for verifying role-based price gating.
 * DEV ONLY. Run: pnpm --filter @mccartney/cms create:testdata
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

async function ensureUser(
  payload: Awaited<ReturnType<typeof getPayload>>,
  email: string,
  password: string,
  role: 'staff' | 'trade',
  companyName?: string,
): Promise<void> {
  const found = await payload.find({
    collection: 'accounts',
    where: { email: { equals: email } },
    limit: 1,
  })
  if (found.docs.length > 0) {
    payload.logger.info(`User ${email} already exists`)
    return
  }
  await payload.create({
    collection: 'accounts',
    data: {
      email,
      password,
      role,
      companyName,
      tradeStatus: role === 'trade' ? 'approved' : undefined,
    },
  })
  payload.logger.info(`Created ${role} user ${email}`)
}

async function main(): Promise<void> {
  try {
    process.loadEnvFile?.(path.resolve(dirname, '../../../.env'))
  } catch {
    /* ambient env */
  }
  delete process.env.MEILISEARCH_HOST

  const { default: config } = await import('@payload-config')
  const payload = await getPayload({ config })

  await ensureUser(payload, 'staff@mccartney.local', 'staffpass123', 'staff')
  await ensureUser(payload, 'trade@mccartney.local', 'tradepass123', 'trade', 'Test Trade Co')

  const products = await payload.find({ collection: 'products', limit: 1, depth: 0 })
  const product = products.docs[0] as { id: string | number; slug?: string } | undefined
  if (!product) {
    payload.logger.error('No products found — run the seed first')
    process.exit(1)
  }

  const existingPrice = await payload.find({
    collection: 'prices',
    where: { product: { equals: product.id } },
    limit: 1,
  })
  if (existingPrice.docs.length === 0) {
    await payload.create({
      collection: 'prices',
      data: {
        product: product.id as number,
        retailPerM2: 42.5,
        tradePerM2: 31.0,
        costPerM2: 24.0,
        currency: 'GBP',
      },
    })
    payload.logger.info(`Created price for product ${product.slug ?? product.id}`)
  } else {
    payload.logger.info(`Price already exists for product ${product.slug ?? product.id}`)
  }

  payload.logger.info(`PRODUCT_ID=${product.id} PRODUCT_SLUG=${product.slug ?? ''}`)
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
