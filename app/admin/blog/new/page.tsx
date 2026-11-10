import { SubmitButton } from '@/components/admin/submit-button'
import { requireStaff } from '@/lib/auth'
import { saveBlogPost } from '../actions'
import '../blog.css'

export default async function NewBlogPage() {
  await requireStaff(['admin', 'editor'])

  return (
    <>
      <div className="admin-title">
        <div>
          <span className="eyebrow">Content</span>
          <h1>New blog post</h1>
          <p className="admin-sub">Write a post and save it as a draft or publish it.</p>
        </div>
      </div>

      <form action={saveBlogPost} className="blog-form">
        <label className="fld">Title<input name="title" required /></label>
        <label className="fld">Slug<input name="slug" required placeholder="kerala-travel-guide" /></label>
        <label className="fld">Summary<textarea name="summary" rows={3} required /></label>
        <label className="fld">Category<input name="category" /></label>
        <label className="fld">Cover image URL<input name="cover_image" type="url" placeholder="https://images.unsplash.com/..." /></label>
        <label className="fld">
          Article content
          <textarea name="content" rows={14} required placeholder={'Use ## for headings, - for lists, and ![description](https://...) for photos.'} />
        </label>
        <label className="fld">
          Status
          <select name="status" defaultValue="draft">
            <option value="draft">Save as draft</option>
            <option value="published">Publish</option>
          </select>
        </label>
        <SubmitButton label="Save post" />
      </form>
    </>
  )
}