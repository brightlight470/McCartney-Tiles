'use client'

import { useState } from 'react'
import { options } from '@mccartney/db'

interface Suggestion {
  value: string | null
}
interface DraftProduct {
  name: string
  sizeMm: Suggestion
  sizeBand: Suggestion
  application: Suggestion
  colourGroup: Suggestion
  finish: Suggestion
  effect: Suggestion
  material: Suggestion
  edge: Suggestion
  format: Suggestion
}
interface DraftRange {
  name: string
  products: DraftProduct[]
}

interface EditProduct {
  name: string
  sizeMm: string
  effect: string
  colourGroup: string
  finish: string
  format: string
  application: string
}
interface EditRange {
  name: string
  products: EditProduct[]
}

const COLS = [
  { key: 'effect', label: 'Effect', opts: options('effect') },
  { key: 'colourGroup', label: 'Colour', opts: options('colourGroup') },
  { key: 'finish', label: 'Finish', opts: options('finish') },
  { key: 'format', label: 'Format', opts: options('format') },
  { key: 'application', label: 'Application', opts: options('application') },
] as const

const SELECT =
  'h-9 w-full rounded-sm border border-border bg-white px-2 text-sm focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none'

function toEdit(ranges: DraftRange[]): EditRange[] {
  return ranges.map((r) => ({
    name: r.name,
    products: r.products.map((p) => ({
      name: p.name,
      sizeMm: p.sizeMm.value ?? '',
      effect: p.effect.value ?? '',
      colourGroup: p.colourGroup.value ?? '',
      finish: p.finish.value ?? '',
      format: p.format.value ?? '',
      application: p.application.value ?? '',
    })),
  }))
}

export function IngestionTool() {
  const [csv, setCsv] = useState('')
  const [stage, setStage] = useState<'input' | 'review' | 'done'>('input')
  const [ranges, setRanges] = useState<EditRange[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<{
    rangesUpserted: number
    productsUpserted: number
    indexed: number
  } | null>(null)

  async function preview() {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/staff/ingest/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      })
      const data = (await res.json()) as {
        ok: boolean
        error?: string
        result?: { ranges: DraftRange[] }
      }
      if (!data.ok || !data.result) {
        setError(data.error ?? 'Preview failed')
      } else {
        setRanges(toEdit(data.result.ranges))
        setStage('review')
      }
    } catch {
      setError('Could not reach the server')
    } finally {
      setBusy(false)
    }
  }

  function update(ri: number, pi: number, field: keyof EditProduct, value: string) {
    setRanges((prev) => {
      const next = structuredClone(prev)
      next[ri]!.products[pi]![field] = value
      return next
    })
  }

  async function publish() {
    setBusy(true)
    setError(null)
    try {
      const payload = {
        publish: true,
        ranges: ranges.map((r) => ({
          name: r.name,
          products: r.products.map((p) => ({
            name: p.name,
            sizeMm: p.sizeMm || null,
            effect: p.effect || null,
            colourGroup: p.colourGroup || null,
            finish: p.finish || null,
            format: p.format || null,
            application: p.application || null,
            material: 'porcelain',
          })),
        })),
      }
      const res = await fetch('/api/staff/ingest/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as {
        ok: boolean
        error?: string
        rangesUpserted?: number
        productsUpserted?: number
        indexed?: number
      }
      if (!data.ok) {
        setError(data.error ?? 'Publish failed')
      } else {
        setSummary({
          rangesUpserted: data.rangesUpserted ?? 0,
          productsUpserted: data.productsUpserted ?? 0,
          indexed: data.indexed ?? 0,
        })
        setStage('done')
      }
    } catch {
      setError('Could not reach the server')
    } finally {
      setBusy(false)
    }
  }

  const productCount = ranges.reduce((n, r) => n + r.products.length, 0)

  if (stage === 'done' && summary) {
    return (
      <div className="rounded border border-border bg-white p-6">
        <p className="font-display font-semibold text-ink">Published.</p>
        <p className="mt-2 text-sm text-slate">
          {summary.rangesUpserted} ranges and {summary.productsUpserted} products written;{' '}
          {summary.indexed} products indexed for search.
        </p>
        <button
          type="button"
          onClick={() => {
            setStage('input')
            setCsv('')
            setRanges([])
            setSummary(null)
          }}
          className="mt-4 inline-flex h-10 items-center rounded border border-border px-4 text-sm font-medium hover:border-brand-blue"
        >
          Ingest another file
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p role="alert" className="text-sm font-medium text-status-out-of-stock">
          {error}
        </p>
      ) : null}

      {stage === 'input' ? (
        <div className="space-y-4">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) setCsv(await file.text())
            }}
            className="block text-sm"
          />
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={10}
            placeholder="range_name,size_mm,...  (paste CSV or choose a file above)"
            className="w-full rounded border border-border bg-white p-3 font-mono text-xs focus-visible:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:outline-none"
          />
          <button
            type="button"
            disabled={busy || !csv.trim()}
            onClick={preview}
            className="inline-flex h-11 items-center rounded bg-brand-blue px-5 font-display font-semibold text-white hover:bg-ink disabled:opacity-50"
          >
            {busy ? 'Reading…' : 'Preview'}
          </button>
        </div>
      ) : null}

      {stage === 'review' ? (
        <div className="space-y-8">
          <p className="text-sm text-slate">
            Review {ranges.length} ranges / {productCount} products. Suggested values are pre-filled
            — correct anything, then publish.
          </p>
          {ranges.map((range, ri) => (
            <div key={range.name}>
              <h2 className="font-display text-lg font-semibold text-ink">{range.name}</h2>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-slate uppercase">
                      <th className="py-2 pr-3">Product</th>
                      <th className="py-2 pr-3">Size</th>
                      {COLS.map((c) => (
                        <th key={c.key} className="py-2 pr-3">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {range.products.map((p, pi) => (
                      <tr key={p.name} className="border-b border-border">
                        <td className="py-2 pr-3 font-medium text-ink">{p.name}</td>
                        <td className="py-2 pr-3">
                          <input
                            value={p.sizeMm}
                            onChange={(e) => update(ri, pi, 'sizeMm', e.target.value)}
                            className={`${SELECT} w-24`}
                          />
                        </td>
                        {COLS.map((c) => (
                          <td key={c.key} className="py-2 pr-3">
                            <select
                              value={p[c.key]}
                              onChange={(e) => update(ri, pi, c.key, e.target.value)}
                              className={SELECT}
                            >
                              <option value="">—</option>
                              {c.opts.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={busy}
              onClick={publish}
              className="inline-flex h-11 items-center rounded bg-brand-blue px-5 font-display font-semibold text-white hover:bg-ink disabled:opacity-50"
            >
              {busy ? 'Publishing…' : 'Publish to website'}
            </button>
            <button
              type="button"
              onClick={() => setStage('input')}
              className="text-sm font-medium text-slate hover:text-ink"
            >
              Start over
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
