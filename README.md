# Mytix

Event listings and booking requests for Virsa Films Production (Sydney NSW), built with
React + Vite. Business details (company, owner, phone, location) live in `src/lib/site.ts`.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build
npm run check    # validator self-check (Node 24+)
```

## Stack

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** (via `@tailwindcss/vite`) — design tokens live in `src/index.css` under `@theme`
- **React Router** for routing
- **Framer Motion** for section reveals, dropdowns and modals

## Design system

Everything is defined once in `src/index.css` (`@theme` tokens + `@utility` classes) and
`src/components/Primitives.tsx`. New UI should compose these rather than add values.

- **Spacing** — Tailwind's 4pt scale, whole steps only (no `.5`). Layout utilities:
  `wrap` (1400px container), `page-top`, `section`.
- **Type** — Plus Jakarta Sans, weights 400/500/600/700. Ramp: `t-display`, `t-h1`,
  `t-h2`, `t-h3`, `t-lede`, `t-label`; body 15px, `text-sm`, `text-xs`.
- **Colour** — `ink` / `muted` / `faint` text, `surface` / `line` neutrals, one `blue`
  accent, `success` / `warning` / `danger` for status. No other hues.
- **Radius** — `rounded-md` tags · `rounded-lg` buttons, inputs, chips · `rounded-xl`
  cards, dropdowns, modals.
- **Shadow** — `shadow-xs` resting · `shadow-md` hover and dropdown · `shadow-xl` modal.
- **Cards** — `card` + `card-hover` (2px lift, stronger border). No other hover recipes.
- **Motion** — one `Reveal` fade-up per section; no per-item stagger or decorative movement.
- **Loading** — `Button loading`, `Img` (skeleton until loaded). Every async action shows one.
- **Meta** — every page renders `<Meta title description />`, which updates the
  title, description and Open Graph tags from `index.html` in place.

## Structure

```
src/
  data/events.ts      35 seed events derived from the live site's schema.org feed
  lib/supabase.ts     Supabase client + row mapping (null when not configured)
  lib/events.tsx      EventsProvider / useEvents(): data + derived lists for every page
  lib/format.ts       date/money formatting (Australia/Sydney timezone)
  lib/copy.ts         rewrites the boilerplate source descriptions into real sentences
  components/         Nav, Footer, Hero, PosterCard, CheckoutModal, Primitives, Icons
  pages/              Home, Events, EventDetail, Artists, Venues, Sell, About, NotFound
  pages/admin/        AdminLayout, AdminEvents, AdminEventForm
```

## Data

`src/data/events.ts` is sample data copied from a third-party ticketing site's public event
feed. These are other promoters' shows, and the poster and artist images are hotlinked from
that site. Replace them with Virsa Films Production's own events before launch.

Two things are derived rather than copied:

- **Descriptions.** The source text is templated (`"<Presenter> Presents <title>
  <artist> Performing Live On Stage."`) and just echoes the title. `lib/copy.ts`
  extracts the presenter and rebuilds a proper sentence from the event's own data.
- **Metro grouping.** Venue suburbs (Moore Park, Granville, Greensborough…) are
  mapped to their metro area so city filtering is useful.

## Booking requests (email)

"Get Tickets" collects the buyer's details and submits a booking request. No payment is
taken and nothing is stored. The site posts to the Vercel function
[`api/booking.ts`](api/booking.ts), which:

- checks the details and looks up the event, ticket type and price itself (Supabase when
  configured, otherwise the built-in list), so the total can't be changed from the browser;
- emails the full request to `ticketbookingau@gmail.com` (Reply-To is the buyer), then a
  confirmation to the buyer (Reply-To is the inbox), both sent from the Gmail account;
- allows 5 requests per hour per IP (per warm instance; Gmail's ~500 emails/day is the backstop).

Setup (once):

1. Sign in to `ticketbookingau@gmail.com`, turn on
   [2-Step Verification](https://myaccount.google.com/signinoptions/twosv), then create an
   app password at <https://myaccount.google.com/apppasswords> (that page returns 404 until
   2-Step Verification is on).
2. Vercel → project → **Settings → Environment Variables**, add for Production:
   `GMAIL_USER` = `ticketbookingau@gmail.com`, `GMAIL_APP_PASSWORD` = the app password.
   Optional `BOOKINGS_INBOX` sends the details email somewhere else.
3. **Deployments → ⋯ → Redeploy**, then place a test booking. Errors show under the
   deployment's **Logs** (filter `/api/booking`).

Local testing needs `vercel dev` (plain `npm run dev` doesn't serve `/api`).
The booking fee and ticket limit live in `src/lib/pricing.ts`, shared by the page and the function.

## Admin panel (Supabase)

`/admin` lets a signed-in admin add, edit and delete shows. Data lives in a Supabase
Postgres table; the public site reads it on load. **Without Supabase configured the site
runs on the built-in seed list in `src/data/events.ts` and `/admin` shows a setup
checklist**, so the current Vercel deploy keeps working unchanged.

Setup (once):

1. Create a project at [supabase.com](https://supabase.com). Under **Authentication →
   Providers → Email** turn off *Allow new users to sign up*. Under **Authentication →
   Users** add the admin user (email + password).
2. Open the **SQL editor**, paste [`supabase/schema.sql`](supabase/schema.sql), run it.
   It creates the `events` table and row-level security: anyone can read, only a
   signed-in user can write.
3. Set two variables in `.env.local` (see `.env.example`) and in the Vercel project's
   environment variables:
   - `VITE_SUPABASE_URL` — `https://<project-id>.supabase.co` (the id is in the
     dashboard address bar, or Project Settings → Data API).
   - `VITE_SUPABASE_PUBLISHABLE` — the **publishable** key (`sb_publishable_…`). It is
     public by design; row-level security protects writes. Never use the secret key.
     (Named without "KEY" because Vercel blocks saving `VITE_*KEY*` variables;
     `VITE_SUPABASE_ANON_KEY` is still read as a fallback.)
4. Redeploy. Open `/admin`, sign in, and choose **Import built-in events** to seed the
   table with the 35 shows that ship with the site.

How it fits together:

- `src/lib/supabase.ts` — client (null when env vars are missing), row ↔ `EventItem`
  mapping, `fetchEvents` / `upsertEvents` / `deleteEvent`.
- `src/lib/events.tsx` — `EventsProvider` loads once and exposes `useEvents()` with the
  derived lists every page uses (`live`, `presale`, `featured`, `artists`, `categories`,
  `get(slug)`), plus `loading` for skeletons and `refresh()` after admin saves.
- `src/pages/admin/` — `AdminLayout` (setup / login / signed-in shell), `AdminEvents`
  (list, search, filters, import), `AdminEventForm` (create / edit / delete).
- Times in the admin form are entered in the admin's browser timezone; the public site
  displays them in Australia/Sydney.

## Security

The site is a static SPA; the only backend is Supabase (Postgres + Auth). Security is
enforced in the database and by response headers, not by the browser code.

| Area | How it's handled |
|---|---|
| Keys | Only the **publishable** key (`sb_publishable_…`) ships to browsers. It is public by design. **Never** put the secret key (`sb_secret_…`) in a `VITE_` variable, Vercel, or git. Git history was scanned: no secrets have ever been committed. |
| Authorisation | Row-level security on `events`: anyone reads; insert/update/delete require `is_admin()`, which checks `app_metadata.role = 'admin'` in the login token. `app_metadata` can only be set server-side. Anonymous write grants and `TRUNCATE` are revoked. |
| Field tampering | CHECK constraints on every column (https-only URLs, lengths, price 0–100,000, valid ticket availability, end ≥ start). A trigger recomputes `low`/`high` and `updated_at` server-side. |
| Input validation | `src/lib/validate.ts` mirrors the constraints in the admin form; every input has `maxLength`. Self-check: `npm run check`. |
| Output | React escapes all rendered text; there are no raw-HTML sinks. The public fetch selects explicit columns only. |
| Sessions | No server, so no HttpOnly cookie: the admin token lives in `sessionStorage` (cleared when the tab closes). The CSP blocks the injected scripts that could read it. |
| Passwords | Stored as bcrypt hashes by Supabase Auth; the app never stores passwords. Sign-ups are disabled. |
| Login abuse | Supabase Auth rate-limits sign-in per IP; the form shows a clear message on 429 and never reveals whether an email exists. |
| Headers | `vercel.json`: CSP, HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy, COOP. HTTP is redirected to HTTPS by Vercel. |
| Dependencies | `npm audit` clean; Dependabot (`.github/dependabot.yml`) opens weekly update PRs. |
| Bookings | `api/booking.ts` validates input, prices the order server-side, escapes everything placed in the emails, and rate-limits by IP. The Gmail app password exists only as a Vercel environment variable. |
| Payments | No payment is taken: "Get Tickets" sends a booking request by email. A real integration must use a hosted payment form (e.g. Stripe Elements) — never collect or store card numbers. |

One-time setup, in order:

1. **Supabase → SQL editor:** run `supabase/schema.sql`, then edit the email in step 3 of
   `supabase/security.sql` and run it. Sign out of `/admin` and back in.
2. **Supabase → Authentication → Rate Limits:** lower sign-in attempts (≈10 per 5 minutes per IP).
3. **GitHub → Settings → Code security** (repo admin): enable Dependabot alerts, secret
   scanning and push protection.

If the Supabase project URL changes, update `connect-src` in the CSP in `vercel.json`.

## What is mocked

This is a front-end redesign. No payment is taken: checkout sends a booking request by
email (see above). Presale signup and the organiser enquiry form open the visitor's email
app with a pre-filled message to the bookings inbox.

## ⚠️ Placeholder copy — check with the owner

| Placeholder | Location |
| --- | --- |
| 4.5% booking fee (drives the checkout total) | `src/lib/pricing.ts` |
| FAQ answers (reply times, refunds) | `src/pages/About.tsx` |
| "Costs agreed with you upfront" and the four listing steps | `src/pages/Sell.tsx` |

## Note on images

Some posters on the image host are 500KB PNGs served without a CDN. The hero
preloads and fades its images to cover that, but a production build should proxy
them through an image CDN and serve WebP/AVIF at the sizes actually used.
