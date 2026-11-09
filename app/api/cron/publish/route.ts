import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Publishes scheduled packages that are due. Call on a schedule with: Authorization: Bearer <CRON_SECRET>
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data, error } = await supabaseAdmin().rpc('publish_due_packages')
  if (error) return NextResponse.json({ error: 'failed' }, { status: 500 })
  if (typeof data === 'number' && data > 0) revalidatePath('/', 'layout')
  return NextResponse.json({ published: data })
}
