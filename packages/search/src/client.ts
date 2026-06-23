import { Meilisearch } from 'meilisearch'

let cached: Meilisearch | null = null

/** Meilisearch client from env. Use the admin key server-side only. */
export function createSearchClient(): Meilisearch {
  if (cached) return cached
  const host = process.env.MEILISEARCH_HOST
  const apiKey = process.env.MEILISEARCH_KEY
  if (!host) throw new Error('MEILISEARCH_HOST is not set')
  cached = new Meilisearch({ host, apiKey })
  return cached
}

/** Reset the memoised client (tests / config changes). */
export function resetSearchClient(): void {
  cached = null
}
