import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { SuitabilityOverlay } from '@/components/SuitabilityOverlay'
import { SizeStack } from '../_components/SizeStack'
import { PRODUCTS, RANGE_BLOKA } from '../_data'

const product = PRODUCTS[0]! // Bloka — Grey
const gallery = RANGE_BLOKA.feature

const SPEC: { label: string; value: string }[] = [
  { label: 'Range', value: product.range },
  { label: 'Colour', value: product.colour },
  { label: 'Effect', value: product.effect },
  { label: 'Finish', value: product.finish },
  { label: 'Material', value: 'Porcelain' },
  { label: 'Edge', value: 'Rectified' },
  { label: 'Slip rating', value: 'R10' },
  { label: 'Thickness', value: '9 mm' },
]

export default function PreviewProduct() {
  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container>
          <nav aria-label="Breadcrumb" className="text-sm text-slate">
            <Link href="/preview/products" className="hover:text-brand-blue">
              Products
            </Link>
            <span aria-hidden="true"> / </span>
            <Link href="/preview/range" className="hover:text-brand-blue">
              {product.range}
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-ink">{product.colour}</span>
          </nav>

          <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
            {/* Feature images */}
            <div>
              <div className="relative aspect-square overflow-hidden rounded border border-border bg-mist">
                <Image src={product.image} alt={`${product.range} ${product.colour}`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority />
                <SuitabilityOverlay application={product.application} size={48} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                {gallery.map((src, i) => (
                  <div key={src} className="relative aspect-square overflow-hidden rounded border border-border bg-mist">
                    <Image src={src} alt={`${product.range} feature ${i + 1}`} fill sizes="20vw" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-ink">
                {product.range} — {product.colour}
              </h1>
              <p className="mt-2 text-slate">
                {product.effect}-effect porcelain · {product.finish.toLowerCase()} finish.
              </p>

              {/* Sizes — black-outline tiles */}
              <div className="mt-8">
                <h2 className="font-display text-sm font-semibold tracking-wide text-ink uppercase">
                  Available sizes
                </h2>
                <div className="mt-4">
                  <SizeStack sizes={product.sizes} variant="detail" />
                </div>
              </div>

              {/* Spec */}
              <table className="mt-8 w-full text-sm">
                <tbody>
                  {SPEC.map((row) => (
                    <tr key={row.label} className="border-b border-border">
                      <th scope="row" className="py-2 pr-4 text-left font-medium text-slate">
                        {row.label}
                      </th>
                      <td className="tabular py-2 text-right text-ink">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-8 flex flex-wrap gap-4">
                <span className="inline-flex h-12 items-center justify-center rounded bg-brand-blue px-6 font-display font-semibold text-white">
                  Request a sample
                </span>
                <span className="inline-flex h-12 items-center justify-center rounded border border-brand-blue px-6 font-display font-semibold text-brand-blue">
                  Make an enquiry
                </span>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
