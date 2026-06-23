/** Renders a JSON-LD structured-data script. Data is serialised server-side. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  )
}

export const ORGANISATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'McCartney Tiles',
  url: 'https://www.mccartneytiles.com',
  description: 'Tile supplier serving all of Ireland from Randalstown, Co. Antrim.',
  foundingDate: '1981',
  areaServed: ['IE', 'GB-NIR'],
}

export const LOCAL_BUSINESS_LD = {
  '@context': 'https://schema.org',
  '@type': 'HomeGoodsStore',
  name: 'McCartney Tiles',
  url: 'https://www.mccartneytiles.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Randalstown',
    addressRegion: 'Co. Antrim',
    addressCountry: 'GB',
  },
  areaServed: ['IE', 'GB-NIR'],
}
