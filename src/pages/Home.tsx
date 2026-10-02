import { Link } from 'react-router-dom'
import { useEvents } from '../lib/events'
import { monthKey } from '../lib/format'
import { plural } from '../lib/copy'
import { Hero } from '../components/Hero'
import { CategoryBrowse, CityBrowse } from '../components/BrowseSections'
import { EventRow, PosterCard } from '../components/PosterCard'
import { Button, GroupHead, Meta, Reveal, SectionHead, SkeletonCard } from '../components/Primitives'
import { Arrow, Bolt, Check, Shield, Ticket } from '../components/Icons'
import { COMPANY, PHONE, PHONE_HREF } from '../lib/site'

const guarantees = [
  {
    Icon: Ticket,
    title: 'Book without paying upfront',
    body: 'Choose your tickets and send a request. Nothing is charged on the website.',
  },
  {
    Icon: Bolt,
    title: 'Clear pricing',
    body: 'The ticket price and booking fee are shown together before you send your request.',
  },
  {
    Icon: Shield,
    title: 'Confirmed by a person',
    body: 'Our team checks every request and contacts you to finalise your tickets.',
  },
  {
    Icon: Check,
    title: 'Based in Sydney',
    body: `Questions about a show? Call us on ${PHONE}.`,
  },
]

const viewAll = (
  <Link to="/events" className="inline-flex items-center gap-2 text-sm font-medium text-blue hover:text-blue-dark">
    View all events
    <Arrow className="h-4 w-4" />
  </Link>
)

export default function Home() {
  const { live, featured, categories, loading } = useEvents()
  const upcoming = live.slice(0, 8).reduce<Record<string, typeof live>>((acc, e) => {
    ;(acc[monthKey(e.start)] ??= []).push(e)
    return acc
  }, {})

  const categoryCounts = categories
    .map((c) => ({ name: c, count: live.filter((e) => e.category === c).length }))
    .filter((c) => c.count > 0)

  const featuredSlugs = new Set(featured.slice(0, 4).map((e) => e.slug))
  const onSale = live.filter((e) => !featuredSlugs.has(e.slug)).slice(0, 4)

  const cards = (list: typeof live) =>
    loading
      ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
      : list.map((e, i) => <PosterCard key={e.slug} event={e} index={i} />)

  return (
    <>
      <Meta
        title="Mytix"
        description="Find concerts, comedy and cultural events across Australia and send a booking request online. Run by Virsa Films Production, Sydney."
      />
      <Hero />

      <section className="wrap section">
        <Reveal>
          <SectionHead title="Featured events" blurb="Headline shows with tickets on sale now." action={viewAll} />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards(featured.slice(0, 4))}
          </div>
        </Reveal>
      </section>

      <CategoryBrowse items={categoryCounts} />

      <section className="wrap section">
        <Reveal>
          <SectionHead title="On sale now" blurb="More shows with tickets available, soonest first." action={viewAll} />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {cards(onSale)}
          </div>
        </Reveal>
      </section>

      <CityBrowse counts={(city) => live.filter((e) => e.metro === city).length} />

      <section className="wrap section">
        <Reveal>
          <SectionHead
            title="Coming up"
            blurb="The next eight shows, by date."
            action={
              <Link to="/events" className="inline-flex items-center gap-2 text-sm font-medium text-blue hover:text-blue-dark">
                Full calendar
                <Arrow className="h-4 w-4" />
              </Link>
            }
          />
          <div className="space-y-8">
            {Object.entries(upcoming).map(([month, items]) => (
              <div key={month}>
                <GroupHead title={month} meta={`${items.length} ${plural(items.length, 'show')}`} />
                <div className="card divide-y divide-line p-2">
                  {items.map((e) => (
                    <EventRow key={e.slug} event={e} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="wrap section">
        <Reveal>
          <SectionHead eyebrow="How booking works" title="Simple, and handled by real people" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {guarantees.map((g) => (
              <div key={g.title} className="card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-light text-blue">
                  <g.Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">{g.title}</h3>
                <p className="mt-2 text-sm text-muted">{g.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="wrap section">
        <Reveal>
          {/* Dark espresso panel with a cursor-following spotlight */}
          <div
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              e.currentTarget.style.setProperty('--spot-x', `${e.clientX - r.left}px`)
              e.currentTarget.style.setProperty('--spot-y', `${e.clientY - r.top}px`)
            }}
            className="group relative grid grid-cols-1 gap-10 overflow-hidden rounded-[28px] border border-[rgba(238,228,218,0.16)] bg-[linear-gradient(135deg,#16110e,#2b211b)] p-8 shadow-[0_32px_90px_-56px_rgba(20,16,12,0.72)] sm:p-12"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-50 transition-opacity duration-300 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(440px circle at var(--spot-x, 25%) var(--spot-y, 35%), rgba(255,255,255,0.14), transparent 55%)',
              }}
            />
            <div className="relative">
              <span className="t-label text-white/60">For organisers</span>
              <h2 className="t-h2 mt-3 text-white">Putting on a show? Let’s talk.</h2>
              <p className="mt-4 max-w-lg text-white/70">
                {COMPANY} can list your event here and take booking requests for you. Tell us about the show and
                we’ll work out together what suits it.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button to="/sell" variant="light">
                  List your event
                  <Arrow className="h-4 w-4" />
                </Button>
                <Button href={PHONE_HREF} variant="outline-light">
                  Call {PHONE}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
