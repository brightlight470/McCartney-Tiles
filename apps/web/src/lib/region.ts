/**
 * Geolocation capability gating (Handover §8). Gates commerce capability, NOT indexable
 * content — crawlers and rest-of-world visitors can always browse. Rules are data here so
 * they can move to CMS/config without code change.
 */
export type Region = 'IE' | 'NI' | 'ROW'

export interface Capabilities {
  canBrowse: boolean
  canSeeStore: boolean
  canCheckout: boolean
}

export const REGION_CAPABILITIES: Record<Region, Capabilities> = {
  NI: { canBrowse: true, canSeeStore: true, canCheckout: false },
  IE: { canBrowse: true, canSeeStore: true, canCheckout: false },
  ROW: { canBrowse: true, canSeeStore: false, canCheckout: false },
}

export function capabilitiesFor(region: Region): Capabilities {
  return REGION_CAPABILITIES[region]
}

const DEFAULT_REGION: Region =
  (process.env.NEXT_PUBLIC_DEFAULT_REGION as Region | undefined) ?? 'NI'

/**
 * Resolve a region from an ISO country code (edge geo-IP header).
 * NOTE: NI shares the GB ISO code; subdivision-level refinement lands with the geo provider.
 */
export function resolveRegion(countryCode?: string | null): Region {
  if (!countryCode) return DEFAULT_REGION
  const cc = countryCode.toUpperCase()
  if (cc === 'GB') return 'NI'
  if (cc === 'IE') return 'IE'
  return 'ROW'
}
