import { updateBlogPost } from '@/app/admin/blog/actions'
import { requireStaff } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { SaveNotice } from '@/components/admin/save-notice'
import { SubmitButton } from '@/components/admin/submit-button'
import '../blog.css'

export default async function BlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireStaff(['admin', 'editor'])

  const supabase = await createClient()
  const { id } = await params

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !post) {
    return (
      <div className="admin-empty">
        <h3>Blog post not found.</h3>
      </div>
    )
  }

  const { data: packageLinks } = await supabase
    .from('blog_post_packages')
    .select('package_id')
    .eq('blog_post_id', id)

  const selectedPackageIds = (packageLinks ?? []).map(
    (row) => row.package_id
  )

  const { data: packages } = await supabase
    .from('packages')
    .select('id, code, slug, draft')
    .eq('status', 'published')
    .order('code', { ascending: true })

  return (
    <div className="admin-form">
      <div className="admin-title">
        <div>
          <span className="eyebrow">Content</span>
          <h1>Edit blog post</h1>
          <p className="admin-sub">
            Update the content and related packages.
          </p>
        </div>
      </div>

      <SaveNotice slug={post.slug} />

      <form action={updateBlogPost.bind(null, id)} className="stack">
        <label className="fld">
          Title
          <input name="title" defaultValue={post.title} required />
        </label>

        <label className="fld">
          Slug
          <input name="slug" defaultValue={post.slug} required />
        </label>

        <label className="fld">
          Summary
          <textarea
            name="summary"
            rows={3}
            defaultValue={post.summary}
            required
          />
        </label>

        <label className="fld">
          Category
          <input name="category" defaultValue={post.category} />
        </label>

        <label className="fld">
          Cover image URL
          <input
            name="cover_image"
            defaultValue={post.cover_image}
          />
        </label>

        <label className="fld">
          Content
          <textarea
            name="content"
            rows={12}
            defaultValue={post.content}
            required
          />
        </label>

        <label className="fld">
          Status
          <select name="status" defaultValue={post.status}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <fieldset className="fld">
          <legend>Related packages</legend>
          <div className="stack">
            {(packages ?? []).map((pkg) => {
              const title =
                typeof pkg.draft === 'object' &&
                pkg.draft &&
                'title' in pkg.draft
                  ? String((pkg.draft as any).title)
                  : pkg.code

              return (
                <label key={pkg.id} className="check">
                  <input
                    type="checkbox"
                    name="package_ids"
                    value={pkg.id}
                    defaultChecked={selectedPackageIds.includes(pkg.id)}
                  />
                  {pkg.code} — {title}
                </label>
              )
            })}
          </div>
        </fieldset>

        <input
          type="hidden"
          name="package_ids"
          value={selectedPackageIds.join(',')}
        />

        <SubmitButton />
      </form>
    </div>
  )
}