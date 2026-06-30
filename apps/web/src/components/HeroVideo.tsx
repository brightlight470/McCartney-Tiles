'use client'

import { useEffect, useState } from 'react'

/**
 * Full-bleed hero video. Serves a portrait, per-clip-reframed cut on mobile (hero-mobile.mp4)
 * and the 16:9 master on desktop (hero.mp4). The source is chosen after mount from the viewport,
 * so only the matching file downloads. Before mount (and with JS disabled) the poster shows;
 * prefers-reduced-motion hides the video via the utility class.
 */
export function HeroVideo() {
  const [mobile, setMobile] = useState<boolean | null>(null)

  useEffect(() => {
    setMobile(window.matchMedia('(max-width: 767px)').matches)
  }, [])

  const base = mobile ? '/hero/hero-mobile' : '/hero/hero'
  const poster = mobile ? '/hero/hero-poster-mobile.jpg' : '/hero/hero-poster.jpg'

  return (
    <video
      key={base}
      className="absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
      autoPlay
      muted
      loop
      playsInline
      poster={poster}
      aria-hidden="true"
    >
      {mobile !== null ? <source src={`${base}.mp4`} type="video/mp4" /> : null}
    </video>
  )
}
