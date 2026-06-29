'use client'

import { useEffect } from 'react'

/**
 * Roomvo B2B assistant widget — loaded on mobile devices only. The script is injected client-side
 * behind a mobile media query so desktop never fetches it. Distinct from the per-product
 * RoomvoVisualiser integration point (which stays feature-flagged until keyed).
 */
const MOBILE_QUERY = '(max-width: 767px)'
const SCRIPT_ID = 'roomvo-assistant'
const SRC = 'https://www.roomvo.com/static/scripts/b2b/common/assistant.js'

export function RoomvoAssistant() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia(MOBILE_QUERY).matches) return
    if (document.getElementById(SCRIPT_ID)) return

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.type = 'text/javascript'
    script.dataset.locale = 'en-gb'
    script.dataset.position = 'bottom-right'
    script.src = SRC
    document.body.appendChild(script)
  }, [])

  return null
}
