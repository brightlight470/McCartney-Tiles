import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { removeFromBasket } from '@/lib/baskets'

/** Trade/staff only: remove a product from a basket. */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser()
  if (user?.role !== 'trade' && user?.role !== 'staff') {
    return NextResponse.json({ ok: false, error: 'Trade sign-in required' }, { status: 403 })
  }
  let body: { basketId?: string | number; productId?: string | number }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.basketId || !body.productId) {
    return NextResponse.json({ ok: false, error: 'Missing ids' }, { status: 422 })
  }
  const result = await removeFromBasket(body.basketId, body.productId)
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
