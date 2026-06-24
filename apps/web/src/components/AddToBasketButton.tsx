'use client'

import { useState } from 'react'

export function AddToBasketButton({ productId }: { productId: string | number }) {
  const [status, setStatus] = useState<'idle' | 'adding' | 'added' | 'error'>('idle')

  async function add() {
    setStatus('adding')
    try {
      const res = await fetch('/api/account/basket/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = (await res.json()) as { ok: boolean }
      setStatus(data.ok ? 'added' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={status === 'adding' || status === 'added'}
      className="inline-flex h-12 items-center justify-center rounded border border-border px-6 font-display font-semibold text-ink hover:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
    >
      {status === 'added'
        ? 'Added to project'
        : status === 'adding'
          ? 'Adding…'
          : status === 'error'
            ? 'Try again'
            : 'Add to project basket'}
    </button>
  )
}
