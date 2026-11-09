# Phase D: enquiry inbox, AI assist, traveller replies

Adds files and replaces only these placeholders/files: app/admin/enquiries (page + [id]), app/admin/activity/page.tsx,
components/site/enquiry-form.tsx, app/api/enquiries/route.ts. Nothing else is touched.

## Apply
1. Supabase > SQL editor > paste and run `supabase/migrations/003_inbox.sql` (safe to run twice).
2. Copy this folder over your project, then `npm run build` and `npm run dev`.
3. Optional AI (free): get a Gemini key at https://aistudio.google.com (Get API key, no card) and add
   `GEMINI_API_KEY=...` to .env.local and to your host's environment settings. Grok also works:
   set `XAI_API_KEY=...` instead (xAI may charge; check their console). Without any key the inbox uses
   built-in rules, so everything still works. If a call fails, check the model name for your key and set
   `AI_MODEL=` (defaults: gemini-flash-latest, grok-4.3).

## Who can do what
| | Admin | Consultant |
|---|---|---|
| See enquiries | all | own + unassigned pool |
| Assign / reassign | yes | take an unassigned one for self |
| Status, notes, correct AI fields | yes | on own enquiries |
| Send a reply | only if assigned to themselves | only on own enquiries |
New web enquiries are auto-assigned to the consultant with the fewest open ones.

## How a reply reaches the traveller
The traveller gets a private link (/enquiry/<token>) in the popup after submitting. Replies appear there.
WhatsApp is a MOCK (lib/messaging.ts): it records a queued message only when consent was given. Add your
WhatsApp Business provider at the TODO to make it real. Email is not wired (the form does not collect one).

## AI: what it does and does not do
- Reads the message, fills in adults, children, month, nights, budget, places and interests.
- Ranks the three best published packages with plain scoring, in code.
- Drafts a reply. Every price is written by code from the package season table. The AI only writes a
  one-line opening, and it is rejected if it contains anything that looks like a price or promise.
- Nothing is sent until the assigned person presses Send reply.
- Only the enquiry text is sent to the AI service, never name or phone. Mention this in your privacy notice.
  On Google's free tier, Google may use submitted content to improve its products. If that is not acceptable for
  traveller messages, use a paid key or leave the key empty (rules only).

## Test
1. Submit the sample enquiry on /enquire. A popup appears with a link; open it.
2. Sign in as arun.consultant (or the admin) > Enquiries. Open it, press Analyse this enquiry.
   Expect 2 adults, 1 child, December, 5 to 6 nights, 120000, houseboat, and PKG-KL-07 on top at the Peak price.
3. Use the AI draft, send, then reload the traveller link: the reply is there.
4. As Devika (editor) /admin/enquiries should bounce. As Arun, enquiries assigned to someone else return not found.

---
# Update: inbox visibility fix + SEO and privacy step

## If an enquiry is not showing in the inbox
Run this in the project folder and read the output:
    npx tsx --env-file=.env.local scripts/check-inbox.ts
It prints how many enquiries are saved, whether migration 003 is applied, the newest enquiries, who they belong to,
and what each result means. This fixed version also: counts any non-closed status as "Open", tells you when
another tab holds enquiries, and no longer rate-limits local testing.

## SEO and data-protection step (new files)
- app/sitemap.ts -> /sitemap.xml (published packages only). app/robots.ts -> /robots.txt (blocks admin, preview, api, traveller links).
- data/redirects.csv + redirects.mjs + next.config.mjs -> the 140 old URLs as 301 redirects. Paste them into the CSV, one `old,new` per line.
  next.config.mjs is replaced; it keeps your allowedDevOrigins and images settings exactly as they were.
- components/site/package-jsonld.tsx -> search-engine markup (TouristTrip with from-price in INR).
  ONE manual edit so I do not overwrite your package page. In app/packages/[slug]/page.tsx add:
      import { PackageJsonLd } from '@/components/site/package-jsonld'
  and inside the returned fragment, above <Header />:
      <PackageJsonLd p={p} />
- app/privacy/page.tsx -> a real privacy notice for the DPDP Act. Lines marked CONFIRM (retention, response time,
  grievance officer) are assumptions for the client and their lawyer to confirm.
- Set NEXT_PUBLIC_SITE_URL in .env.local (and on your host) to the real domain before launch.
