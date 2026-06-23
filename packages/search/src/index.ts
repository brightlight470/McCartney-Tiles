export { createSearchClient, resetSearchClient } from './client'
export { configureIndex, upsertProducts, deleteProducts, clearIndex } from './indexer'
export { searchProducts } from './search'
export type { SearchParams, SearchResult } from './search'
export { PRODUCTS_INDEX, PRODUCTS_SETTINGS, FACET_ATTRIBUTES } from './index-config'
export {
  toProductDocument,
  priceBandFor,
  type ProductDocument,
  type IndexableProduct,
  type PriceBand,
} from './product-document'
