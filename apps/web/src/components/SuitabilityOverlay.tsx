import Image from 'next/image'

/**
 * Suitability symbol as a layer over a product image — using the icons extracted from the legacy
 * photography (tools/extract-suitability-icons.py): green house = outdoor, blue = walls & floors,
 * red = wall only. Drop inside a `relative` image container.
 *
 * This is the overlay half of the icons-as-layers work. Wiring it onto the live product imagery
 * (and shipping clean, un-marked photos underneath) is the later step; for now it is exercised in
 * the /preview mockups so the treatment can be approved.
 */
const ICONS: Record<string, { file: string; alt: string }> = {
  outdoor: { file: 'outdoor', alt: 'Suitable for outdoor use' },
  wall: { file: 'wall', alt: 'Suitable for walls only' },
  floor: { file: 'wall-floor', alt: 'Suitable for floors' },
  'wall-floor': { file: 'wall-floor', alt: 'Suitable for walls and floors' },
}

export function SuitabilityOverlay({
  application,
  className = '',
  size = 44,
}: {
  application?: string | null
  className?: string
  size?: number
}) {
  if (!application) return null
  const icon = ICONS[application]
  if (!icon) return null
  return (
    <Image
      src={`/suitability/${icon.file}.png`}
      alt={icon.alt}
      width={size}
      height={size}
      className={`pointer-events-none absolute left-2 top-2 h-auto w-[var(--suit-w)] drop-shadow-sm ${className}`}
      style={{ ['--suit-w' as string]: `${size}px` }}
    />
  )
}
