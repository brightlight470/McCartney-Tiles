'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  async function logout() {
    await fetch('/api/account/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }
  return (
    <button
      type="button"
      onClick={logout}
      className="inline-flex h-10 items-center justify-center rounded border border-border px-4 text-sm font-medium hover:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
    >
      Sign out
    </button>
  )
}
