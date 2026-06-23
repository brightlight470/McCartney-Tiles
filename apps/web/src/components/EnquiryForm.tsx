'use client'

import { useState } from 'react'

export type EnquiryType =
  | 'contact'
  | 'request-brochure'
  | 'book-showroom-visit'
  | 'trade-account-application'
  | 'sample-request'

interface Props {
  type?: EnquiryType
  productSlug?: string
}

const FIELD_BASE =
  'mt-1 h-11 w-full rounded border border-border bg-white px-3 text-base focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none'

export function EnquiryForm({ type = 'contact', productSlug }: Props) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setError(null)
    const form = new FormData(event.currentTarget)
    const payload: Record<string, string> = { type }
    form.forEach((value, key) => {
      if (typeof value === 'string') payload[key] = value
    })
    if (productSlug) payload.productSlug = productSlug

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

  if (status === 'success') {
    return (
      <div className="rounded border border-border bg-white p-6">
        <p className="font-display font-semibold text-ink">Thank you — your enquiry is in.</p>
        <p className="mt-2 text-sm text-slate">A member of the team will be in touch shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot — keep empty. Hidden from users and assistive tech. */}
      <div aria-hidden="true" className="hidden">
        <label>
          Company website
          <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="ef-name" className="text-sm font-medium text-ink">
          Name
        </label>
        <input id="ef-name" name="name" required className={FIELD_BASE} autoComplete="name" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ef-email" className="text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="ef-email"
            name="email"
            type="email"
            required
            className={FIELD_BASE}
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="ef-phone" className="text-sm font-medium text-ink">
            Phone <span className="text-slate">(optional)</span>
          </label>
          <input id="ef-phone" name="phone" className={FIELD_BASE} autoComplete="tel" />
        </div>
      </div>

      {type === 'trade-account-application' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ef-company" className="text-sm font-medium text-ink">
              Company name
            </label>
            <input id="ef-company" name="companyName" required className={FIELD_BASE} />
          </div>
          <div>
            <label htmlFor="ef-vat" className="text-sm font-medium text-ink">
              VAT number <span className="text-slate">(optional)</span>
            </label>
            <input id="ef-vat" name="vatNumber" className={FIELD_BASE} />
          </div>
        </div>
      ) : null}

      {type === 'book-showroom-visit' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ef-showroom" className="text-sm font-medium text-ink">
              Showroom
            </label>
            <input id="ef-showroom" name="showroom" required className={FIELD_BASE} />
          </div>
          <div>
            <label htmlFor="ef-date" className="text-sm font-medium text-ink">
              Preferred date <span className="text-slate">(optional)</span>
            </label>
            <input id="ef-date" name="preferredDate" type="date" className={FIELD_BASE} />
          </div>
        </div>
      ) : null}

      {type === 'sample-request' ? (
        <div>
          <label htmlFor="ef-address" className="text-sm font-medium text-ink">
            Delivery address
          </label>
          <textarea
            id="ef-address"
            name="address"
            required
            rows={3}
            className={`${FIELD_BASE} h-auto py-2`}
          />
        </div>
      ) : null}

      {type === 'contact' ? (
        <div>
          <label htmlFor="ef-message" className="text-sm font-medium text-ink">
            Message
          </label>
          <textarea
            id="ef-message"
            name="message"
            required
            rows={5}
            className={`${FIELD_BASE} h-auto py-2`}
          />
        </div>
      ) : null}

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
        {status === 'submitting' ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  )
}
