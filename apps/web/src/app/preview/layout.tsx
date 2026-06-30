import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

// Mockups must never be indexed or linked from primary nav — approval surface only.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="bg-ink px-4 py-2 text-center text-xs font-medium tracking-wide text-white">
        v2.0.0 mockup for approval — sample data, not indexed, not in the live nav.{' '}
        <Link href="/preview" className="underline underline-offset-2">
          All mockups
        </Link>
      </div>
      {children}
    </div>
  )
}
