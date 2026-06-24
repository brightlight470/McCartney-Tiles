import { cookies } from 'next/headers'

/** Trade basket helpers. All calls carry the user's token; Payload gates to the owner. */
const CMS_URL = process.env.CMS_URL ?? 'http://localhost:3001'

export interface BasketItem {
  product:
    | string
    | number
    | { id: string | number; name?: string; slug?: string; sizeMm?: string | null }
  note?: string | null
}
export interface Basket {
  id: string | number
  title?: string
  items?: BasketItem[]
}

async function token(): Promise<string | undefined> {
  return (await cookies()).get('payload-token')?.value
}

async function cms(path: string, t: string | undefined, init?: RequestInit): Promise<Response> {
  return fetch(`${CMS_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(t ? { cookie: `payload-token=${t}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })
}

/** The raw relationship id (kept numeric where it is — Payload rejects stringified ids). */
const rawProduct = (i: BasketItem): string | number =>
  typeof i.product === 'object' ? i.product.id : i.product
const sameProduct = (a: string | number, b: string | number) => String(a) === String(b)

export async function getMyBaskets(depth = 2): Promise<Basket[]> {
  const t = await token()
  if (!t) return []
  const res = await cms(`/api/baskets?limit=10&depth=${depth}`, t)
  if (!res.ok) return []
  return ((await res.json()) as { docs?: Basket[] }).docs ?? []
}

/** Append a product to the user's first basket (creating one if needed). Idempotent. */
export async function addToBasket(
  accountId: string | number,
  product: string | number,
): Promise<{ ok: boolean; count?: number; error?: string }> {
  const t = await token()
  if (!t) return { ok: false, error: 'Not signed in' }

  const baskets = await getMyBaskets(0)
  if (baskets.length === 0) {
    const res = await cms('/api/baskets', t, {
      method: 'POST',
      body: JSON.stringify({ title: 'My project', account: accountId, items: [{ product }] }),
    })
    return res.ok ? { ok: true, count: 1 } : { ok: false, error: 'Could not create basket' }
  }

  const basket = baskets[0]!
  const items = (basket.items ?? []).map((i) => ({
    product: rawProduct(i),
    note: i.note ?? undefined,
  }))
  if (items.some((i) => sameProduct(i.product, product))) {
    return { ok: true, count: items.length }
  }
  items.push({ product, note: undefined })
  const res = await cms(`/api/baskets/${basket.id}`, t, {
    method: 'PATCH',
    body: JSON.stringify({ items }),
  })
  return res.ok
    ? { ok: true, count: items.length }
    : { ok: false, error: 'Could not update basket' }
}

export async function removeFromBasket(
  basketId: string | number,
  product: string | number,
): Promise<{ ok: boolean }> {
  const t = await token()
  if (!t) return { ok: false }
  const baskets = await getMyBaskets(0)
  const basket = baskets.find((b) => String(b.id) === String(basketId))
  if (!basket) return { ok: false }
  const items = (basket.items ?? [])
    .filter((i) => !sameProduct(rawProduct(i), product))
    .map((i) => ({ product: rawProduct(i), note: i.note ?? undefined }))
  const res = await cms(`/api/baskets/${basket.id}`, await token(), {
    method: 'PATCH',
    body: JSON.stringify({ items }),
  })
  return { ok: res.ok }
}
