'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const CONSENT_COOKIE = 'mc_consent'
const ONE_YEAR = 60 * 60 * 24 * 365

/**
 * Minimal cookie-consent banner (Handover §8). Shows until acknowledged; the choice is
 * remembered in a cookie. Phase 1 sets only necessary cookies (preview gate, region, consent),
 * so this is acknowledgement rather than a full preference manager.
 */
export function ConsentBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const accepted = document.cookie.split('; ').some((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    setShow(!accepted)
  }, [])

  if (!show) return null

  function accept() {
    document.cookie = `${CONSENT_COOKIE}=1; path=/; max-age=${ONE_YEAR}; samesite=lax`
    setShow(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 text-sm text-slate sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl">
          We use only necessary cookies to run this site and remember your region. See our{' '}
          <Link href="/privacy" className="font-medium text-brand-blue hover:underline">
            privacy notice
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded bg-brand-blue px-5 font-display font-semibold text-white hover:bg-ink focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
