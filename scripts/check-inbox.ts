/**
 * Shows what is really in your database, so we can see where an enquiry went.
 * Run:  npx tsx --env-file=.env.local scripts/check-inbox.ts
 * Read-only. Prints no secrets.
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
const sb = createClient(url, key, { auth: { persistSession: false } })

async function main() {
  console.log('Project:', new URL(url!).host)
  const total = await sb.from('enquiries').select('id', { count: 'exact', head: true })
  console.log('\n1. Enquiries saved in the database:', total.error ? `ERROR: ${total.error.message}` : total.count)

  const cols = await sb.from('enquiries').select('id, public_token, first_response_at, ai_draft').limit(1)
  console.log('2. Migration 003 applied (enquiries columns):', cols.error ? `NO. ${cols.error.message}` : 'yes')
  const rep = await sb.from('enquiry_replies').select('id', { count: 'exact', head: true })
  console.log('   enquiry_replies table:', rep.error ? `NO. ${rep.error.message}` : 'yes')

  const latest = await sb.from('enquiries').select('id, name, status, channel, assignee_id, created_at').order('created_at', { ascending: false }).limit(6)
  console.log('\n3. Newest enquiries:')
  if (latest.error) console.log('   ERROR:', latest.error.message)
  else console.table((latest.data ?? []).map((r) => ({ name: r.name, status: r.status, channel: r.channel, assigned: r.assignee_id ? 'yes' : 'no (unassigned)', created: r.created_at })))

  const staff = await sb.from('profiles').select('id, full_name, role')
  console.log('4. Staff and roles:')
  if (staff.error) console.log('   ERROR:', staff.error.message)
  else console.table((staff.data ?? []).map((p) => ({ name: p.full_name, role: p.role })))

  const names = new Map((staff.data ?? []).map((p) => [p.id, p.full_name]))
  const rows = await sb.from('enquiries').select('name, assignee_id').order('created_at', { ascending: false }).limit(3)
  for (const r of rows.data ?? []) console.log(`   "${r.name}" belongs to:`, r.assignee_id ? names.get(r.assignee_id) ?? 'unknown person' : 'nobody (unassigned pool)')

  console.log('\nHow to read this:')
  console.log(' - Count is 0 after you submitted: the form is failing. Look at the terminal running "npm run dev" for "enquiry insert failed".')
  console.log(' - Count above 0 but the inbox is empty: you are still on the old placeholder page (copy the zip over the project), or signed in as a role that cannot see them.')
  console.log(' - "Migration 003 applied: NO": run supabase/migrations/003_inbox.sql in the Supabase SQL editor.')
}
main()
