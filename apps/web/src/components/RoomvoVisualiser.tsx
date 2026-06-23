/**
 * Roomvo visualiser integration point (Handover §2.7). Feature-flagged off until keyed
 * at the Phase-3 spend gate. When NEXT_PUBLIC_ROOMVO_ENABLED !== 'true' this renders
 * nothing, so the seam exists without shipping an unkeyed embed.
 */
export function RoomvoVisualiser({ productSlug }: { productSlug: string }) {
  const enabled = process.env.NEXT_PUBLIC_ROOMVO_ENABLED === 'true'
  if (!enabled) return null
  return (
    <div
      data-roomvo-product={productSlug}
      className="rounded border border-border bg-white p-6 text-sm text-slate"
    >
      {/* TODO(roomvo): mount the Roomvo widget with ROOMVO_KEY once supplied. */}
      Visualiser
    </div>
  )
}
