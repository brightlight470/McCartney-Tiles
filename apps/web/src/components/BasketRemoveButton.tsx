'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function BasketRemoveButton({
  basketId,
  productId,
}: {
  basketId: string | number
  productId: string | number
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  async function remove() {
    setBusy(true)
    await fetch('/api/account/basket/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ basketId, productId }),
    })
    router.refresh()
  }
  return (
    <button
      type="button"
      onClick={remove}
      disabled={busy}
      className="text-xs font-medium text-status-out-of-stock hover:underline disabled:opacity-50"
    >
      Remove
    </button>
  )
}
