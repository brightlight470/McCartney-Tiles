'use client'

import { REGION_COOKIE, REGION_LABELS, REGIONS, type Region } from '@/lib/region'

const ONE_YEAR = 60 * 60 * 24 * 365

/**
 * Manual region switcher (Handover §8). Persists the choice in a cookie that overrides geo-IP;
 * reloads so the server re-resolves capabilities. The control gates commerce capability, never
 * indexable content.
 */
export function RegionSwitcher({ current }: { current: Region }) {
  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    document.cookie = `${REGION_COOKIE}=${e.target.value}; path=/; max-age=${ONE_YEAR}; samesite=lax`
    window.location.reload()
  }
  return (
    <label className="flex items-center gap-2 text-sm text-slate">
      <span>Region</span>
      <select
        value={current}
        onChange={onChange}
        className="rounded-sm border border-border bg-white px-2 py-1 text-ink focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            {REGION_LABELS[r]}
          </option>
        ))}
      </select>
    </label>
  )
}
