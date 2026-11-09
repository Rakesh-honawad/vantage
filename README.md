# Rocky Travel

Rocky Travel is a Kerala and South India travel website with a staff workspace for managing holiday packages and traveller enquiries. Travellers can explore published journeys, view itineraries and seasonal prices, and send an enquiry; staff can manage package content and respond through an enquiry inbox.

## Features

### Public website
- Homepage with destination and season discovery, featured journeys, and enquiry prompts.
- Package catalogue with filters for destination, length, hotel rating, season, and month.
- Package detail pages with day-by-day itineraries, seasonal prices, hotels, inclusions, and route maps.
- English, Hindi, and German locale support through `lib/i18n.ts`.
- Enquiry form with input validation, consent capture, and a private link for viewing replies.
- Privacy page, sitemap, robots rules, and redirects from legacy website URLs.

### Staff workspace
- Authentication and role checks for admin, editor, and consultant users.
- Package editor for drafts, previews, publishing, scheduled publishing, duplication, and version history.
- Enquiry inbox with assignment, status management, notes, response-time indicators, and traveller replies.
- Activity log for administrative actions.
- Blog authoring pages for administrators, with draft and published posts stored in Supabase.

## Technology

- **Language:** TypeScript
- **Framework / runtime:** Next.js App Router, React
- **Database and authentication:** Supabase (Postgres, Auth, and Row Level Security)
- **Validation:** Zod
- **Testing:** Vitest
- **Deployment integrations:** Vercel Analytics and Vercel Cron

## High-level architecture

```text
Traveller browser
  │
  ├── Public Next.js pages
  │     ├── Homepage and package catalogue
  │     ├── Package detail pages
  │     ├── Enquiry form
  │     └── Blog pages
  │
  ├── Next.js route handlers
  │     ├── POST /api/enquiries
  │     └── Scheduled package publishing endpoint
  │
  └── Supabase
        ├── Published package view
        ├── Package drafts and versions
        ├── Enquiries, replies, profiles, and activity log
        └── Blog posts

Staff browser
  │
  ├── /login
  └── /admin/*
        ├── Server-rendered pages and server actions
        ├── Role checks in lib/auth.ts
        └── Supabase access through server-side clients
```

### Request and data flow

1. **Public package browsing:** `lib/data/packages.ts` reads the `public_packages` view, which exposes published package content. The public pages filter that catalogue and render it through shared site components.
2. **Package authoring:** Staff edit package drafts in the admin workspace. Package actions validate input with `lib/package-schema.ts`; publishing creates a version and updates the package that visitors see.
3. **Enquiry submission:** `components/site/enquiry-form.tsx` sends form data to `app/api/enquiries/route.ts`. The route validates the input, saves the enquiry, and attempts to assign it to the consultant with the fewest open enquiries.
4. **Enquiry handling:** Staff use the admin inbox and server-side actions to review, assign, and respond to enquiries. Traveller replies are displayed on a private `/enquiry/[token]` page.
5. **Blog publishing:** Administrators create and manage posts through the admin blog routes. Public blog routes display posts intended for publication. Blog functionality depends on the blog migration and routes being present in the branch being run.
6. **Scheduled publishing:** Vercel Cron calls the protected package publishing endpoint. The endpoint checks `CRON_SECRET` before invoking the Supabase publishing function.

### Authentication and data access

- `lib/supabase/server.ts` creates a cookie-based Supabase client for server components and actions.
- `lib/supabase/admin.ts` creates a server-only service-role client that bypasses Row Level Security. Use it only in trusted server code after checking the staff member and validating the request.
- `lib/auth.ts` loads the signed-in user’s profile and provides `requireStaff()` for role checks.
- `proxy.ts` refreshes authentication sessions for staff routes and sends signed-out visitors to `/login`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code or commit real environment secrets.

## Project structure

```text
app/
  admin/                 Staff workspace: packages, enquiries, activity, and blog
  api/
    cron/publish/         Protected scheduled package publishing endpoint
    enquiries/            Public enquiry submission endpoint
  destinations/           Destination landing pages
  enquire/                Public enquiry page
  enquiry/[token]/        Private traveller enquiry and reply page
  login/                  Staff sign-in
  packages/               Public package catalogue and detail routes
  preview/                Staff preview routes
  privacy/                Privacy notice
  page.tsx                Public homepage
  sitemap.ts              Dynamic sitemap
  robots.ts               Search crawler rules

components/
  admin/                  Staff navigation, enquiry detail, and package editor
  site/                   Shared public header, footer, package, and enquiry UI

data/
  redirects.csv           Legacy URL redirect mappings

lib/
  ai/                     Optional enquiry extraction and reply drafting
  data/packages.ts        Published package queries and filters
  supabase/               Public, server, admin, and session clients
  auth.ts                 Staff identity and role checks
  pricing.ts              Seasonal pricing and date utilities
  package-schema.ts       Package input validation
  package-rules.ts        Package normalization and publishing rules
  inbox.ts                Enquiry statuses, labels, and token helpers
  i18n.ts                 Locale definitions and translations

scripts/
  seed.ts                 Demo staff, packages, and enquiry data

supabase/migrations/
  002_scheduling.sql      Scheduled package publishing function
  003_inbox.sql           Enquiry tracking, AI fields, and staff replies

tests/
  extract.test.ts         Enquiry extraction and AI fallback tests
  pricing.test.ts         Seasonal pricing tests
```

## Getting started

### Requirements

- Node.js compatible with the versions used by the project dependencies.
- pnpm (the package manifest specifies pnpm).
- A Supabase project with the application’s base schema configured.
- Environment variables for Supabase. Optional AI and cron features need their respective secrets.

### Install and configure

```bash
pnpm install
cp .env.example .env.local
```

Fill in `.env.local` with the values for your Supabase project. Do not commit `.env.local` or real keys.

At minimum, configure:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
```

Run the SQL migrations in the Supabase SQL Editor, in order, after the base application schema is available:

```text
supabase/migrations/002_scheduling.sql
supabase/migrations/003_inbox.sql
```

The blog routes also require the blog schema migration included in the branch where those routes were added. The migrations directory does not replace the project’s base schema setup.

### Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test and build

```bash
pnpm test
pnpm build
pnpm start
```

`pnpm start` runs the production build, so run `pnpm build` first.

### Optional: seed demo data

Set `DEMO_PASSWORD` in `.env.local`, then run:

```bash
pnpm seed
```

**Warning:** `scripts/seed.ts` resets the sample enquiries and sets demo staff credentials. Use it only with a demo Supabase project, never with production data.

## Environment variables

| Variable | Required | Purpose |
|---|---:|---|
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL used by SEO metadata and sitemap generation. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase publishable/anon key used by the cookie-based client. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes for server operations | Secret key for trusted server-side operations that bypass RLS. |
| `DEMO_PASSWORD` | Seed only | Password assigned to seeded demo staff accounts. |
| `CRON_SECRET` | Scheduled publishing | Bearer token required by the scheduled publishing endpoint. |
| `GEMINI_API_KEY` | Optional | Enables Gemini-powered enquiry assistance. |
| `XAI_API_KEY` | Optional | Alternative AI provider key. |
| `AI_PROVIDER` | Optional | Selects the AI provider when configured. |
| `AI_MODEL` | Optional | Overrides the configured/default AI model. |
| `AI_BASE_URL` | Optional | Base URL for an OpenAI-compatible AI provider. |

Without an AI key, enquiry extraction falls back to deterministic rules in `lib/ai/extract.ts`.

## Database notes

The application expects core tables and database objects for profiles, packages, package versions, enquiries, and activity logging. The committed migrations `002_scheduling.sql` and `003_inbox.sql` add scheduling and enquiry-inbox functionality; they are not a complete initial database schema.

The blog feature additionally expects blog-post tables from the blog migration. Apply the migration that exists in your working branch before using the blog admin pages. Confirm Row Level Security policies and permissions match the server-side access patterns before deploying.

## Operational notes and limitations

- WhatsApp delivery is currently a mock/queued integration in `lib/messaging.ts`; connect a WhatsApp Business provider before treating it as live delivery.
- Email delivery is not wired into the enquiry flow.
- AI assistance is optional. Review extracted fields and drafted replies before sending them to travellers.
- The enquiry API’s in-memory rate limit is best-effort and resets when a server instance restarts.
- Review the privacy notice and confirm its retention, contact, and legal details before production use.
- Seasonal prices are sourced from package data. Confirm all commercial pricing and tax rules before making customer commitments.

## Deployment

The app can be deployed as a Next.js application. Configure the environment variables in the hosting provider, apply the required Supabase schema and migrations, and set `NEXT_PUBLIC_SITE_URL` to the production domain.

`vercel.json` configures a daily cron job for scheduled package publishing. Configure the matching `CRON_SECRET` in the deployment environment.

## Tests

Vitest runs the test files under `tests/`:

```bash
pnpm test
```

The current tests cover seasonal pricing behavior and enquiry extraction, including fallback behavior when AI is unavailable or returns invalid data.
