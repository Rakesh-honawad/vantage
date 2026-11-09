-- Phase D: enquiry inbox, AI assist and traveller tracking links.
-- Safe to run more than once. Run it in the Supabase SQL editor before using the inbox.

-- Unguessable link so a traveller can see replies without an account.
alter table enquiries add column if not exists public_token text;
update enquiries set public_token = replace(gen_random_uuid()::text, '-', '') where public_token is null;
alter table enquiries alter column public_token set default replace(gen_random_uuid()::text, '-', '');
create unique index if not exists enquiries_public_token_key on enquiries (public_token);

-- AI assist results. The consultant can correct them; nothing here is sent anywhere.
alter table enquiries add column if not exists extracted jsonb;
alter table enquiries add column if not exists ai_suggestions jsonb;
alter table enquiries add column if not exists ai_draft text;
alter table enquiries add column if not exists ai_source text;
alter table enquiries add column if not exists ai_at timestamptz;

-- For the one-hour reply target.
alter table enquiries add column if not exists first_response_at timestamptz;

-- Replies sent by staff. Read and written only by server code with the service key.
create table if not exists enquiry_replies (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references enquiries(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,
  direction text not null default 'outbound' check (direction in ('outbound', 'inbound')),
  body text not null,
  channel text not null default 'link',
  delivery text not null default 'link',
  created_at timestamptz not null default now()
);
create index if not exists enquiry_replies_enquiry_idx on enquiry_replies (enquiry_id, created_at);
alter table enquiry_replies enable row level security; -- no policies: anon and signed-in users cannot read it directly
