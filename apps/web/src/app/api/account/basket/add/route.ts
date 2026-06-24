import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { addToBasket } from '@/lib/baskets'

/** Trade/staff only: add a product to the user's basket. */
export async function POST(request: Request): Promise<NextResponse> {
  const user = await getCurrentUser()
  if (user?.role !== 'trade' && user?.role !== 'staff') {
    return NextResponse.json({ ok: false, error: 'Trade sign-in required' }, { status: 403 })
  }
  let body: { productId?: string | number }
  try {
    body = (await request.json()) as typeof body
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }
  if (!body.productId) {
    return NextResponse.json({ ok: false, error: 'Missing productId' }, { status: 422 })
  }
  const result = await addToBasket(user.id, body.productId)
  return NextResponse.json(result, { status: result.ok ? 200 : 400 })
}
