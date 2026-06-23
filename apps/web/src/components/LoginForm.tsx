'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FIELD =
  'mt-1 h-11 w-full rounded border border-border bg-white px-3 text-base focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none'

export function LoginForm() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setError(null)
    const fd = new FormData(event.currentTarget)
    try {
      const res = await fetch('/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fd.get('email'), password: fd.get('password') }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (data.ok) {
        router.push('/account')
        router.refresh()
      } else {
        setStatus('error')
        setError(data.error ?? 'Sign-in failed')
      }
    } catch {
      setStatus('error')
      setError('Could not reach the server. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="login-email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={FIELD}
        />
      </div>
      <div>
        <label htmlFor="login-password" className="text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={FIELD}
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm font-medium text-status-out-of-stock">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex h-12 items-center justify-center rounded bg-brand-blue px-6 font-display font-semibold text-white hover:bg-ink focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
      >
        {status === 'submitting' ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
