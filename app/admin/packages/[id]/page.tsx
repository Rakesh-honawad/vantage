import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PackageEditor, type EditorVersion } from '@/components/admin/package-editor'
import { requireStaff } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { PackageContent } from '@/lib/types'
import './editor.css'

export const metadata: Metadata = { title: 'Edit package' }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff(['admin', 'editor'])
  const { id } = await params
  if (!UUID.test(id)) notFound()
  const supabase = await createClient()
  const [{ data: pkg }, { data: versions }] = await Promise.all([
    supabase.from('packages').select('id, code, status, publish_at, published_version_id, draft, updated_at').eq('id', id).maybeSingle(),
    supabase.from('package_versions').select('id, version_no, content, note, created_at, author:profiles(full_name)').eq('package_id', id).order('version_no', { ascending: false }),
  ])
  if (!pkg) notFound()
  const history: EditorVersion[] = (versions ?? []).map((v) => ({
    id: v.id as string,
    versionNo: v.version_no as number,
    content: v.content as PackageContent,
    note: (v.note as string | null) ?? null,
    createdAt: v.created_at as string,
    author: ((v.author as unknown as { full_name: string } | null)?.full_name) ?? null,
  }))
  return (
    <PackageEditor
      key={pkg.updated_at as string}
      pkg={{
        id: pkg.id as string,
        code: pkg.code as string,
        status: pkg.status as 'draft' | 'scheduled' | 'published',
        publishAt: (pkg.publish_at as string | null) ?? null,
        publishedVersionId: (pkg.published_version_id as string | null) ?? null,
        draft: pkg.draft as PackageContent,
      }}
      versions={history}
    />
  )
}
