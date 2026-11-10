
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { PackageCard } from '@/components/site/package-card'
import { getBlogBySlug } from '@/lib/blog'
import { getPublishedPackages } from '@/lib/data/packages'
import { createClient } from '@/lib/supabase/server'
import { BlogBody } from '@/components/site/blog-body'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogBySlug(slug)

  if (!post) return {}

  return {
    title: 	post.seo_title || `${post.title} | Rocky Travel`,
    description: post.seo_description || post.summary,
  }
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params
  const post = await getBlogBySlug(slug)

  if (!post) notFound()

  const supabase = await createClient()

  // Find package IDs linked to this blog post.
  // Find package IDs linked to this blog post.
const { data: links, error: linksError } = await supabase
  .from('blog_post_packages')
  .select('package_id')
  .eq('blog_post_id', post.id)

if (linksError) {
  console.error('Failed to fetch related package links:', linksError.message)
}

const packageIds = links?.map((item) => item.package_id) ?? []

// Load only published packages linked to this article.
const allPackages = await getPublishedPackages()

const { data: packageRows, error: packageError } = packageIds.length
  ? await supabase
      .from('packages')
      .select('id, code')
      .in('id', packageIds)
      .eq('status', 'published')
  : { data: [], error: null }

if (packageError) {
  console.error('Failed to fetch related packages:', packageError.message)
}

const relatedPackageCodes = new Set(
  (packageRows ?? []).map((row) => row.code)
)

const related = allPackages.filter((pkg) =>
  relatedPackageCodes.has(pkg.code)
)
  return (
    <>
      <Header />
      <main className="blog-detail-shell">
        <article className="blog-detail">
          <header className="blog-detail-hero">
            {post.cover_image && (
              <img src={post.cover_image} alt={post.title} />
            )}

            <div className="blog-detail-copy">
              <span className="eyebrow">{post.category}</span>
              <h1>{post.title}</h1>
              <p>{post.summary}</p>

              <div className="blog-detail-meta">
                <span>
                  {	post.published_at
                    ? new Date(	post.published_at).toLocaleDateString()
                    : 'Recently published'}
                </span>
              </div>
            </div>
          </header>

        <BlogBody content={post.content} />

          <section className="related-package-block">
            <div className="section-head">
              <div>
                <span className="eyebrow">Related packages</span>
                <h2>Trips that match this story</h2>
              </div>
            </div>

            {related.length > 0 ? (
              <div className="pkg-grid">
                {related.map((pkg) => (
                  <PackageCard key={pkg.code} p={pkg} />
                ))}
              </div>
            ) : (
              <p className="note">No related packages yet.</p>
            )}
          </section>
        </article>
      </main>
      <Footer />
    </>
  )
}
