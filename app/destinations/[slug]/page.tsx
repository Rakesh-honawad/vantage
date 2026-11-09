import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { PackageCard } from '@/components/site/package-card'
import { getPublishedPackages } from '@/lib/data/packages'
import { slugify } from '@/lib/package-rules'

export const revalidate = 60

// One-line intros are PLACEHOLDER copy (an assumption). A destination CMS would replace this.
const INTRO: Record<string, string> = {
  munnar: 'Tea estates, cool mist and winding hill roads in the Western Ghats.',
  thekkady: 'Cardamom hills, spice gardens and a quiet lake at the edge of the Periyar forest.',
  alleppey: 'Slow canals, coconut groves and nights on a houseboat.',
  kochi: 'A harbour town of old streets, fishing nets and easy food.',
  kumarakom: 'Birds at dawn and still water on Vembanad lake.',
  marari: 'A fishing-village beach with very little between you and the sea.',
  wayanad: 'Caves, waterfalls and green hills on the Kerala-Karnataka border.',
  coorg: 'Coffee country, misty mornings and homestays above the clouds.',
}

type Props = { params: Promise<{ slug: string }> }

async function load(slug: string) {
  const all = await getPublishedPackages()
  const name = [...new Set(all.flatMap((p) => p.destinations))].find((d) => slugify(d) === slug)
  return name ? { name, packages: all.filter((p) => p.destinations.includes(name)) } : null
}

export async function generateStaticParams() {
  const all = await getPublishedPackages()
  return [...new Set(all.flatMap((p) => p.destinations))].map((d) => ({ slug: slugify(d) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await load((await params).slug)
  if (!d) return {}
  const description = INTRO[slugify(d.name)] ?? `Holiday packages that include ${d.name}.`
  return { title: `${d.name} holiday packages`, description }
}

export default async function DestinationPage({ params }: Props) {
  const slug = (await params).slug
  const d = await load(slug)
  if (!d) notFound()
  return (
    <>
      <Header />
      <main className="listing">
        <div className="list-intro">
          <span className="eyebrow">Destination</span>
          <h1>{d.name}</h1>
          <p>{INTRO[slug] ?? `Journeys that include ${d.name}.`}</p>
        </div>
        <div className="filters"><span className="mono">{d.packages.length} {d.packages.length === 1 ? 'journey' : 'journeys'} visit {d.name}</span></div>
        <div className="pkg-grid list-grid">{d.packages.map((p) => <PackageCard key={p.code} p={p} />)}</div>
      </main>
      <Footer />
    </>
  )
}
