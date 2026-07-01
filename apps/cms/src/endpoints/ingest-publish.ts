import { addDataAndFileToRequest, type Endpoint, type PayloadRequest } from 'payload'
import { slugify } from '@mccartney/db'
import { indexProductsFromDb } from '../lib/index-products'

interface PublishProduct {
  name: string
  sizeMm?: string | null
  application?: string | null
  colourGroup?: string | null
  finish?: string | null
  effect?: string | null
  material?: string | null
  edge?: string | null
  format?: string | null
  sizeBand?: string | null
}
interface PublishRange {
  name: string
  description?: string | null
  products: PublishProduct[]
}

const clean = (v: string | null | undefined): string | undefined =>
  v == null || v === '' ? undefined : v

function isStaff(req: PayloadRequest): boolean {
  return (req.user as { role?: string } | undefined)?.role === 'staff'
}

/**
 * Staff-only publish: upsert reviewed ranges/products, set showOnWebsite, then reindex.
 * The review/confirm step happens client-side; this writes the confirmed values.
 */
export const ingestPublishEndpoint: Endpoint = {
  path: '/ingest/publish',
  method: 'post',
  handler: async (req) => {
    if (!isStaff(req)) {
      return Response.json({ ok: false, error: 'Forbidden' }, { status: 403 })
    }
    await addDataAndFileToRequest(req)
    const body = (req.data ?? {}) as { ranges?: PublishRange[]; publish?: boolean }
    const ranges = body.ranges ?? []
    const publish = body.publish ?? true

    let rangesUpserted = 0
    let productsUpserted = 0

    for (const r of ranges) {
      if (!r.name) continue
      const rangeSlug = slugify(r.name)
      const existingRange = await req.payload.find({
        collection: 'ranges',
        where: { slug: { equals: rangeSlug } },
        limit: 1,
        depth: 0,
      })
      let rangeId: string | number
      if (existingRange.docs[0]) {
        rangeId = (existingRange.docs[0] as { id: string | number }).id
        await req.payload.update({
          collection: 'ranges',
          id: rangeId,
          data: { showOnWebsite: publish, description: clean(r.description) },
        })
      } else {
        const created = await req.payload.create({
          collection: 'ranges',
          data: {
            name: r.name,
            slug: rangeSlug,
            description: clean(r.description),
            status: 'active',
            showOnWebsite: publish,
          },
        })
        rangeId = created.id
      }
      rangesUpserted++

      for (const p of r.products) {
        if (!p.name) continue
        const productSlug = slugify(p.name)
        const sizeMm = clean(p.sizeMm)
        const data = {
          range: rangeId as number,
          name: p.name,
          slug: productSlug,
          application: clean(p.application),
          colourGroup: clean(p.colourGroup),
          finish: clean(p.finish),
          effect: clean(p.effect),
          material: clean(p.material) ?? 'porcelain',
          edge: clean(p.edge),
          format: clean(p.format),
          // Colour-level model: the ingested size becomes a single entry in the sizes array.
          sizes: sizeMm ? [{ sizeMm, sizeBand: clean(p.sizeBand) }] : [],
        }
        const existingProduct = await req.payload.find({
          collection: 'products',
          where: { slug: { equals: productSlug } },
          limit: 1,
          depth: 0,
        })
        // Generated types narrow select fields to literal unions; ingestion writes validated
        // taxonomy slugs, so pass through the loose payload data type.
        const productData = data as unknown as never
        if (existingProduct.docs[0]) {
          await req.payload.update({
            collection: 'products',
            id: (existingProduct.docs[0] as { id: string | number }).id,
            data: productData,
          })
        } else {
          await req.payload.create({ collection: 'products', data: productData })
        }
        productsUpserted++
      }
    }

    let indexed = 0
    try {
      indexed = (await indexProductsFromDb(req.payload, { all: false })).indexed
    } catch (err) {
      req.payload.logger.error({ err }, 'ingest publish: reindex failed')
    }

    return Response.json({ ok: true, rangesUpserted, productsUpserted, indexed })
  },
}
