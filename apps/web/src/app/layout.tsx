import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { ConsentBanner } from '@/components/ConsentBanner'
import { RoomvoAssistant } from '@/components/RoomvoAssistant'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.mccartneytiles.com'),
  title: {
    default: 'McCartney Tiles — tile supply across Ireland',
    template: '%s · McCartney Tiles',
  },
  description:
    'Porcelain and ceramic tiles supplied across Ireland from our Randalstown showroom. Search every range by size, finish, effect and stock. 45 years in tile.',
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    siteName: 'McCartney Tiles',
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IE">
      <body>
        {children}
        <ConsentBanner />
        <RoomvoAssistant />
      </body>
    </html>
  )
}
