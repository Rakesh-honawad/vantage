import type { Metadata } from 'next'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { BlogCard } from '@/components/site/blog-card'
import { getPublishedBlogs, getCategoryList } from '@/lib/blog'
import { getPublishedPackages } from '@/lib/data/packages'


export const metadata: Metadata = {
  title: 'Travel stories | Rocky Travel',
  description: 'Stories, tips and inspiration for Kerala and South India journeys.',
}

export default async function BlogPage() {
    const [posts, categories, packages] = await Promise.all([
        getPublishedBlogs(),
        getCategoryList(),
        getPublishedPackages(),
    ])

  return (
    <>
      <Header />
      <main className="blog-shell">
        <section className="section blog-hero">
          <div className="section-head">
            <div>
              <span className="eyebrow">Stories from the road</span>
              <h1>Travel notes for<br /><em>slower journeys.</em></h1>
            </div>
            <p>Ideas, seasonal guidance and stories that help travellers choose the right Kerala escape.</p>
          </div>
        </section>

        <section className="blog-filters">
          {categories.map((category) => (
            <span key={category} className="blog-chip">{category}</span>
          ))}
        </section>

        <section className="blog-grid">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <span className="eyebrow">Suggested journeys</span>
              <h2>Packages tied to this editorial content</h2>
            </div>
          </div>
          <div className="pkg-grid">
            {packages.slice(0, 3).map((p) => (
              <div key={p.code} className="pkg-card">
                <a href={`/packages/${p.slug}`} className="pkg-image" style={{ backgroundImage: `url(${p.coverImage})` }}>
                  <span className="tag">{p.tag}</span>
                  <span className="card-arrow" aria-hidden="true">&#8599;</span>
                </a>
                <div className="pkg-info">
                  <span className="mono">{p.days} days &middot; {p.hotelStars} star</span>
                  <h3>{p.title}</h3>
                  <p>{p.destinations.join(' · ')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}