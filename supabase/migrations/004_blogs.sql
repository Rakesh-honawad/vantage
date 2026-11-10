
create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  category text not null default '',
  cover_image text not null default '',
  content text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  author_id uuid references profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_idx
  on blog_posts (status, published_at desc);

create table if not exists blog_post_packages (
  blog_post_id uuid not null references blog_posts(id) on delete cascade,
  package_id uuid not null references packages(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (blog_post_id, package_id)
);

create index if not exists blog_post_packages_package_idx
  on blog_post_packages (package_id);

alter table blog_posts enable row level security;
alter table blog_post_packages enable row level security;
