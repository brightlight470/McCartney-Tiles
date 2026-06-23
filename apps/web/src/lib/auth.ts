import { cookies } from 'next/headers'

/**
 * Identity + price access via Payload auth. Payload's access control is the single
 * server-side enforcement point: /api/prices only returns price docs to trade/staff,
 * and cost price only to staff. The web app reflects that — it never re-implements
 * (or can bypass) the gate.
 */
const CMS_URL = process.env.CMS_URL ?? 'http://localhost:3001'
const TOKEN_COOKIE = 'payload-token'

export type Role = 'public' | 'trade' | 'staff'

export interface CurrentUser {
  id: string
  email: string
  role: Role
  companyName?: string | null
  tradeStatus?: string | null
}

async function authHeader(): Promise<Record<string, string>> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value
  return token ? { cookie: `${TOKEN_COOKIE}=${token}` } : {}
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const headers = await authHeader()
  if (!headers.cookie) return null
  try {
    const res = await fetch(`${CMS_URL}/api/accounts/me`, { headers, cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as { user?: CurrentUser | null }
    return data.user ?? null
  } catch {
    return null
  }
}

export interface PriceInfo {
  retailPerM2: number | null
  tradePerM2: number | null
  costPerM2: number | null
  currency: string
}

/**
 * Price for a product, fetched with the caller's token. Returns null for public users
 * (Payload refuses to return the doc), so price never reaches an unauthenticated render.
 */
export async function getProductPrice(productId: string | number): Promise<PriceInfo | null> {
  const headers = await authHeader()
  if (!headers.cookie) return null
  try {
    const res = await fetch(
      `${CMS_URL}/api/prices?where[product][equals]=${productId}&limit=1&depth=0`,
      { headers, cache: 'no-store' },
    )
    if (!res.ok) return null
    const data = (await res.json()) as {
      docs?: { retailPerM2?: number; tradePerM2?: number; costPerM2?: number; currency?: string }[]
    }
    const p = data.docs?.[0]
    if (!p) return null
    return {
      retailPerM2: p.retailPerM2 ?? null,
      tradePerM2: p.tradePerM2 ?? null,
      costPerM2: p.costPerM2 ?? null,
      currency: p.currency ?? 'GBP',
    }
  } catch {
    return null
  }
}
