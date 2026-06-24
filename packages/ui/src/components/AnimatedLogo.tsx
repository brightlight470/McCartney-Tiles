'use client'

import { useEffect, useRef } from 'react'

interface AnimatedLogoProps {
  /** Reversed swaps the wordmark to light tones for dark backgrounds. */
  reversed?: boolean
  className?: string
  title?: string
  /** Replay the entrance on every mount. Default plays once per page load. */
  replay?: boolean
}

/**
 * McCartney Tiles lockup with the "tiles set into place" entrance (Brand
 * Identity v1.0): the eight emblem tiles drop into the grid, then the wordmark
 * fades in. Identical geometry and colours to the static {@link Logo}.
 *
 * Static by default — the SVG renders the final lockup on the server and with
 * JavaScript disabled. The entrance is added after hydration via the `.mc-anim`
 * class (keyframes live in the brand theme stylesheet) and is suppressed for
 * `prefers-reduced-motion`.
 */

// Plays once per full page load. Client-side route changes that remount the
// header render the lockup static instead of re-running the entrance.
let hasPlayed = false

export function AnimatedLogo({
  reversed = false,
  className,
  title = 'McCartney Tiles',
  replay = false,
}: AnimatedLogoProps) {
  const ref = useRef<SVGSVGElement>(null)
  const blue = '#23349d'
  const yellow = '#fae351'
  const word = reversed ? '#ffffff' : blue
  const sub = reversed ? '#e7eaf1' : '#6b7280'
  const font = "'Trebuchet MS','Segoe UI',Arial,sans-serif"

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    if (!replay && hasPlayed) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    svg.classList.add('mc-anim')
    hasPlayed = true
    return () => svg.classList.remove('mc-anim')
  }, [replay])

  return (
    <svg
      ref={ref}
      viewBox="0 0 1480 260"
      role="img"
      aria-label={title}
      className={['mc-logo', className].filter(Boolean).join(' ')}
    >
      <title>{title}</title>
      <g transform="translate(0,24)">
        <rect className="mc-tile" style={{ animationDelay: '0s' }} x="0" y="0" width="100" height="100" fill={blue} />
        <rect className="mc-tile" style={{ animationDelay: '.30s' }} x="112" y="0" width="100" height="100" fill={blue} />
        <rect className="mc-tile" style={{ animationDelay: '.36s' }} x="224" y="0" width="100" height="100" fill={blue} />
        <rect className="mc-tile" style={{ animationDelay: '.12s' }} x="336" y="0" width="100" height="100" fill={blue} />
        <polygon className="mc-tile" style={{ animationDelay: '.48s' }} points="112,0 212,0 212,100" fill={yellow} />
        <polygon className="mc-tile" style={{ animationDelay: '.54s' }} points="324,0 224,0 224,100" fill={yellow} />
        <rect className="mc-tile" style={{ animationDelay: '.06s' }} x="0" y="112" width="100" height="100" fill={blue} />
        <rect className="mc-tile" style={{ animationDelay: '.42s' }} x="112" y="112" width="100" height="100" fill={yellow} />
        <rect className="mc-tile" style={{ animationDelay: '.60s' }} x="224" y="112" width="100" height="100" fill={yellow} />
        <rect className="mc-tile" style={{ animationDelay: '.18s' }} x="336" y="112" width="100" height="100" fill={blue} />
      </g>
      <g className="mc-wm">
        <text x="516" y="150" fontFamily={font} fontWeight="700" fontSize="132" fill={word} letterSpacing="-2">
          McCartney
        </text>
        <text x="520" y="232" fontFamily={font} fontWeight="700" fontSize="72" fill={sub} letterSpacing="34">
          TILES
        </text>
      </g>
    </svg>
  )
}
