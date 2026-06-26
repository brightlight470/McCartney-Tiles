'use client'

import { useEffect, useId, useRef } from 'react'

interface AnimatedLogoProps {
  /** Reversed swaps the wordmark to light tones for dark backgrounds. */
  reversed?: boolean
  className?: string
  title?: string
  /** Re-run the entrance on this cadence, in ms. Default 10000 (every 10s). Pass 0 to play once. */
  loopMs?: number
}

/**
 * McCartney Tiles lockup with the "tiles set into place" entrance (Brand
 * Identity v1.0): the emblem tiles drop into the grid, the wordmark fades in,
 * then a sheen sweeps across the mark. Identical geometry and colours to the
 * static {@link Logo}.
 *
 * Static by default — the SVG renders the final lockup on the server and with
 * JavaScript disabled. The entrance is added after hydration via the `.mc-anim`
 * class (keyframes live in the brand theme stylesheet), replays on the `loopMs`
 * cadence, and is suppressed entirely for `prefers-reduced-motion`.
 */

export function AnimatedLogo({
  reversed = false,
  className,
  title = 'McCartney Tiles',
  loopMs = 10000,
}: AnimatedLogoProps) {
  const ref = useRef<SVGSVGElement>(null)
  const blue = '#23349d'
  const yellow = '#fae351'
  const word = reversed ? '#ffffff' : blue
  const sub = reversed ? '#e7eaf1' : '#6b7280'
  const font = "'Trebuchet MS','Segoe UI',Arial,sans-serif"
  // Sheen tone follows the brand file: white on light, yellow on reversed.
  const sheen = reversed ? yellow : '#ffffff'
  const sheenOpacity = reversed ? 0.45 : 0.55
  // Unique gradient id so multiple lockups on one page do not collide.
  const gradId = `mc-sheen-${useId().replace(/[:]/g, '')}`

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const play = () => {
      // Remove then re-add the class with a reflow in between so the CSS
      // animation restarts from frame zero on every cycle.
      svg.classList.remove('mc-anim')
      void svg.getBoundingClientRect()
      svg.classList.add('mc-anim')
    }

    play()
    if (!loopMs) return () => svg.classList.remove('mc-anim')

    const id = window.setInterval(play, loopMs)
    return () => {
      window.clearInterval(id)
      svg.classList.remove('mc-anim')
    }
  }, [loopMs])

  return (
    <svg
      ref={ref}
      viewBox="0 0 1480 260"
      role="img"
      aria-label={title}
      className={['mc-logo', className].filter(Boolean).join(' ')}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={sheen} stopOpacity="0" />
          <stop offset="0.5" stopColor={sheen} stopOpacity={sheenOpacity} />
          <stop offset="1" stopColor={sheen} stopOpacity="0" />
        </linearGradient>
      </defs>
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
      <g className="mc-sheen">
        <rect x="-220" y="-60" width="300" height="380" fill={`url(#${gradId})`} />
      </g>
    </svg>
  )
}
