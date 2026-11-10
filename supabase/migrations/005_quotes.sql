create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid references enquiries(id) on delete set null,
  package_id uuid not null references packages(id) on delete restrict,

  -- Store only a hash of the customer-facing share token.
  public_token_hash text unique,

  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'expired', 'archived')),

  traveller_name text not null default '',
  traveller_email text not null default '',
  traveller_phone text not null default '',
  travel_start_date date,
  adults integer not null default 2 check (adults >= 0),
  children integer not null default 0 check (children >= 0),

  -- Snapshot the package and pricing terms so later edits do not change a sent quote.
  package_snapshot jsonb not null default '{}'::jsonb,
  season_name text not null default '',
  currency text not null default 'INR',
  price_basis text not null default 'Per person, twin sharing',
  price_per_person integer,
  subtotal integer,
  gst_rate numeric(5,2),
  gst_amount integer,
  total_amount integer,

  notes text not null default '',
  valid_until timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists quotes_enquiry_idx
  on quotes (enquiry_id);

create index if not exists quotes_package_idx
  on quotes (package_id);

create index if not exists quotes_status_created_idx
  on quotes (status, created_at desc);

create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  description text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_amount integer not null default 0,
  line_total integer not null default 0,
  created_at timestamptz not null default now()
);

alter table quotes enable row level security;
alter table quote_items enable row level security;