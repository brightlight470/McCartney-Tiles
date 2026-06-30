'use client'

import { useEffect, useRef, useState } from 'react'

const FIELD =
  'mt-1 h-11 w-full rounded border border-border bg-white px-3 text-base focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none'

/**
 * Brochure-download CTA. The button opens a modal asking for an email OR a WhatsApp number;
 * the submission posts to /api/forms (type request-brochure) which routes to the CRM. The CRM
 * then runs the workflow that actually sends the brochure — this component only captures the
 * lead. WhatsApp is captured as a number for that workflow; no number is dialled from here.
 */
export function BrochureDialog({ label = 'Download the brochure' }: { label?: string }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    firstFieldRef.current?.focus()
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  function close() {
    setOpen(false)
    // Reset after the close so the form is fresh next open (but not mid-success flash).
    setTimeout(() => {
      setStatus('idle')
      setError(null)
    }, 200)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const whatsapp = String(form.get('whatsapp') ?? '').trim()
    if (!email && !whatsapp) {
      setError('Enter an email or WhatsApp number.')
      return
    }
    setStatus('submitting')

    const payload: Record<string, string> = { type: 'request-brochure' }
    const name = String(form.get('name') ?? '').trim()
    if (name) payload.name = name
    if (email) payload.email = email
    if (whatsapp) payload.whatsapp = whatsapp
    const honeypot = String(form.get('company_website') ?? '')
    if (honeypot) payload.company_website = honeypot

    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (data.ok) {
        setStatus('success')
      } else {
        setStatus('error')
        setError(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setError('Could not reach the server. Please try again.')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 items-center justify-center rounded bg-brand-blue px-6 font-display font-semibold text-white hover:bg-ink focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {label}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="brochure-title"
        >
          <div className="absolute inset-0 bg-ink/50" onClick={close} aria-hidden="true" />
          <div className="relative w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-xl">
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 rounded-sm p-1 text-slate hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
              </svg>
            </button>

            {status === 'success' ? (
              <div>
                <h2 id="brochure-title" className="font-display text-lg font-semibold text-ink">
                  Brochure on its way
                </h2>
                <p className="mt-2 text-sm text-slate">
                  Thank you. We will send the bathrooms brochure to the email or WhatsApp number you
                  gave us shortly.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 inline-flex h-11 items-center justify-center rounded bg-brand-blue px-5 font-display font-semibold text-white hover:bg-ink focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 id="brochure-title" className="font-display text-lg font-semibold text-ink">
                  Get the bathrooms brochure
                </h2>
                <p className="mt-2 text-sm text-slate">
                  Send it to your email or WhatsApp — give us whichever you prefer.
                </p>

                {/* Honeypot — keep empty. */}
                <div aria-hidden="true" className="hidden">
                  <label>
                    Company website
                    <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                <div className="mt-4">
                  <label htmlFor="br-name" className="text-sm font-medium text-ink">
                    Name <span className="text-slate">(optional)</span>
                  </label>
                  <input
                    id="br-name"
                    name="name"
                    ref={firstFieldRef}
                    className={FIELD}
                    autoComplete="name"
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="br-email" className="text-sm font-medium text-ink">
                    Email
                  </label>
                  <input
                    id="br-email"
                    name="email"
                    type="email"
                    className={FIELD}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>

                <p className="mt-3 text-center text-xs font-medium tracking-wide text-slate uppercase">
                  or
                </p>

                <div className="mt-3">
                  <label htmlFor="br-whatsapp" className="text-sm font-medium text-ink">
                    WhatsApp number
                  </label>
                  <input
                    id="br-whatsapp"
                    name="whatsapp"
                    type="tel"
                    className={FIELD}
                    autoComplete="tel"
                    placeholder="+353 …"
                  />
                </div>

                {error ? (
                  <p role="alert" className="mt-4 text-sm font-medium text-status-out-of-stock">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded bg-brand-blue px-6 font-display font-semibold text-white hover:bg-ink focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Sending…' : 'Send me the brochure'}
                </button>
                <p className="mt-3 text-xs text-slate">
                  We use your details only to send the brochure and follow up about your project.
                </p>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
