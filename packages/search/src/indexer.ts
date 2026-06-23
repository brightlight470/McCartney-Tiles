import { createSearchClient } from './client'
import { PRODUCTS_INDEX, PRODUCTS_SETTINGS } from './index-config'
import type { ProductDocument } from './product-document'

/** Apply searchable/filterable/sortable settings to the products index. */
export async function configureIndex(): Promise<void> {
  const client = createSearchClient()
  await client.createIndex(PRODUCTS_INDEX, { primaryKey: 'id' }).catch(() => undefined)
  const index = client.index<ProductDocument>(PRODUCTS_INDEX)
  await index.updateSettings(PRODUCTS_SETTINGS)
}

/** Upsert published product documents. */
export async function upsertProducts(docs: ProductDocument[]): Promise<void> {
  if (docs.length === 0) return
  const index = createSearchClient().index<ProductDocument>(PRODUCTS_INDEX)
  await index.addDocuments(docs, { primaryKey: 'id' })
}

/** Remove products from the index (e.g. when unpublished). */
export async function deleteProducts(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const index = createSearchClient().index<ProductDocument>(PRODUCTS_INDEX)
  await index.deleteDocuments(ids)
}

/** Empty the index (full reindex flows). */
export async function clearIndex(): Promise<void> {
  const index = createSearchClient().index<ProductDocument>(PRODUCTS_INDEX)
  await index.deleteAllDocuments()
}
