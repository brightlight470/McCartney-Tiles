import type { Metadata } from 'next'
import { Container } from '@mccartney/ui'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getProjects } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Commercial developments and customer projects supplied by McCartney Tiles across Northern Ireland and the Republic.',
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <>
      <SiteHeader />
      <main className="py-12">
        <Container>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Projects</h1>
          <p className="mt-3 max-w-2xl text-slate">
            Developments and customer projects we have supplied.
          </p>

          {projects.length === 0 ? (
            <p className="mt-10 rounded border border-border bg-white p-6 text-slate">
              Project case studies are being added.
            </p>
          ) : (
            <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <li key={p.id} className="overflow-hidden rounded border border-border bg-white">
                  <div className="aspect-[4/3] bg-mist" />
                  <div className="p-4">
                    <h2 className="font-display font-semibold text-ink">{p.title}</h2>
                    {p.location ? <p className="mt-1 text-sm text-slate">{p.location}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </main>
      <SiteFooter />
    </>
  )
}
