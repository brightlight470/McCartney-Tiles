import type { ReactNode } from 'react'

/**
 * Suitability symbol shown on each tile (legacy "descriptive symbols"): a green house for
 * exterior use, a blue mark for walls & floors, and a purple wall for walls-only (the legacy
 * site showed this in red — re-coloured to purple, off the brand's no-red palette).
 */
const HOUSE = (
  <>
    <path d="M3 9.5 10 4l7 5.5" />
    <path d="M5 8.5V16h10V8.5" />
  </>
)
const WALL = (
  <>
    <rect x="3" y="4" width="14" height="12" rx="1" />
    <line x1="3" y1="8" x2="17" y2="8" />
    <line x1="3" y1="12" x2="17" y2="12" />
    <line x1="8" y1="4" x2="8" y2="8" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="8" y1="12" x2="8" y2="16" />
  </>
)
const WALL_FLOOR = (
  <>
    <rect x="5" y="4" width="10" height="9" rx="1" />
    <line x1="3" y1="16" x2="17" y2="16" />
  </>
)
const FLOOR = (
  <>
    <line x1="3" y1="7" x2="17" y2="7" />
    <line x1="3" y1="11" x2="17" y2="11" />
    <line x1="3" y1="15" x2="17" y2="15" />
  </>
)

const SYMBOLS: Record<string, { label: string; color: string; icon: ReactNode }> = {
  outdoor: { label: 'Suitable for exterior use', color: 'text-app-outdoor', icon: HOUSE },
  'wall-floor': { label: 'Suitable for walls and floors', color: 'text-app-both', icon: WALL_FLOOR },
  floor: { label: 'Suitable for floors', color: 'text-app-both', icon: FLOOR },
  wall: { label: 'Suitable for walls only', color: 'text-app-wall', icon: WALL },
}

export function ApplicationSymbol({
  application,
  className,
}: {
  application?: string | null
  className?: string
}) {
  const sym = application ? SYMBOLS[application] : undefined
  if (!sym) return null
  return (
    <span
      title={sym.label}
      className={['inline-flex items-center', sym.color, className].filter(Boolean).join(' ')}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {sym.icon}
      </svg>
      <span className="sr-only">{sym.label}</span>
    </span>
  )
}
