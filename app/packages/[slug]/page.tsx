import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { PackageView } from '@/components/site/package-view'
import { getPackageBySlug, getPublishedPackages } from '@/lib/data/packages'
import { getLocale } from '@/lib/i18n'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> }

export async function generateStaticParams() {
  return (await getPublishedPackages()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPackageBySlug((await params).slug)
  if (!p) return {}
  return { title: p.title, description: p.summary, openGraph: { title: p.title, description: p.summary, images: p.coverImage ? [p.coverImage] : [] } }
}

export default async function PackagePage({ params, searchParams }: Props) {
  const locale = getLocale(searchParams ? await searchParams : undefined)
  const p = await getPackageBySlug((await params).slug)
  if (!p) notFound()
  return (
    <>
      <Header locale={locale} />
      <PackageView p={p} locale={locale} />
      <Footer locale={locale} />
    </>
  )
}
