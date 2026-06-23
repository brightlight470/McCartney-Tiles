interface LogoProps {
  /** Reversed swaps the wordmark to light tones for dark backgrounds. */
  reversed?: boolean
  className?: string
  title?: string
}

/**
 * McCartney Tiles lockup — 8-tile emblem (4×2 grid) + wordmark.
 * Recreation; the production master is autotraced from the original 5565px PNG.
 * Brand colours are the locked tokens.
 */
export function Logo({ reversed = false, className, title = 'McCartney Tiles' }: LogoProps) {
  const blue = '#23349d'
  const yellow = '#fae351'
  const word = reversed ? '#ffffff' : blue
  const sub = reversed ? '#e7eaf1' : '#6b7280'
  return (
    <svg viewBox="0 0 1480 260" role="img" aria-label={title} className={className}>
      <title>{title}</title>
      <g transform="translate(0,24)">
        <rect x="0" y="0" width="100" height="100" fill={blue} />
        <rect x="112" y="0" width="100" height="100" fill={blue} />
        <rect x="224" y="0" width="100" height="100" fill={blue} />
        <rect x="336" y="0" width="100" height="100" fill={blue} />
        <polygon points="112,0 212,0 212,100" fill={yellow} />
        <polygon points="324,0 224,0 224,100" fill={yellow} />
        <rect x="0" y="112" width="100" height="100" fill={blue} />
        <rect x="112" y="112" width="100" height="100" fill={yellow} />
        <rect x="224" y="112" width="100" height="100" fill={yellow} />
        <rect x="336" y="112" width="100" height="100" fill={blue} />
      </g>
      <text
        x="516"
        y="150"
        fontFamily="'Trebuchet MS','Segoe UI',Arial,sans-serif"
        fontWeight="700"
        fontSize="132"
        fill={word}
        letterSpacing="-2"
      >
        McCartney
      </text>
      <text
        x="520"
        y="232"
        fontFamily="'Trebuchet MS','Segoe UI',Arial,sans-serif"
        fontWeight="700"
        fontSize="72"
        fill={sub}
        letterSpacing="34"
      >
        TILES
      </text>
    </svg>
  )
}
