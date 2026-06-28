import { cookies, headers } from 'next/headers'
import {
  capabilitiesFor,
  REGION_COOKIE,
  resolveActiveRegion,
  type Capabilities,
  type Region,
} from './region'

/**
 * Resolve the visitor's region server-side: manual cookie choice first, then the edge geo-IP
 * country header (Vercel/Cloudflare), then the default. Reading cookies/headers makes the
 * caller dynamic — fine, the catalogue pages are already force-dynamic.
 */
export async function getRegion(): Promise<{ region: Region; capabilities: Capabilities }> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()])
  const cookieValue = cookieStore.get(REGION_COOKIE)?.value
  const country =
    headerStore.get('x-vercel-ip-country') ?? headerStore.get('cf-ipcountry') ?? null
  const region = resolveActiveRegion(cookieValue, country)
  return { region, capabilities: capabilitiesFor(region) }
}
