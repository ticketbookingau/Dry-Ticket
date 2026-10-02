import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPin } from 'lucide-react'
import { useEvents } from '../lib/events'
import { cx, fmtDateShort } from '../lib/format'
import { plural } from '../lib/copy'
import { Chip, Img, Meta, Reveal, SectionHead } from '../components/Primitives'
import { Arrow } from '../components/Icons'
import { HeroCarousel } from '@/components/ui/hero-carousel'
import { DarkCta } from '../components/DarkCta'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { EventItem } from '../data/events'

// Soft tints for initials avatars, picked by name so each artist keeps the same colour.
const TINTS = [
  'bg-blue-light text-blue',
  'bg-success-light text-success',
  'bg-warning-light text-warning',
  'bg-danger-light text-danger',
  'bg-surface-2 text-ink',
]
const tint = (name: string) => TINTS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % TINTS.length]
const initials = (name: string) =>
  name
    .split(/[\s–-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

// Backdrop grade per category; "All" grades each artist by their own category.
const CATEGORIES = ['All', 'Classical', 'Comedy', 'Concert', 'Festival', 'Sports', 'Sufi & Qawwali'] as const
const ACCENT: Record<string, string> = {
  All: '#2563eb',
  Classical: '#7c3aed',
  Comedy: '#f59e0b',
  Concert: '#2563eb',
  Festival: '#ec4899',
  Sports: '#ef4444',
  'Sufi & Qawwali': '#0d9488',
}

/** "Manmohan Waris" → "Manmohan\nWaris" so the headline reveals line by line. */
const twoLines = (name: string) => {
  const [first, ...rest] = name.split(' ')
  return rest.length ? `${first}\n${rest.join(' ')}` : name
}

type ArtistStat = { name: string; image: string; dates: EventItem[]; category: string; cities: string[] }

export default function Artists() {
  const { artists, live, loading } = useEvents()
  const [cat, setCat] = useState('All')

  // Each artist with their on-sale dates, busiest first.
  const roster = useMemo<ArtistStat[]>(
    () =>
      artists
        .map((a) => {
          const dates = live.filter((e) => e.artists.some((x) => x.name === a.name))
          return {
            name: a.name,
            image: a.image!,
            dates,
            category: dates[0]?.category ?? 'Live',
            cities: [...new Set(dates.map((e) => e.metro))],
          }
        })
        .sort((x, y) => y.dates.length - x.dates.length || x.name.localeCompare(y.name)),
    [artists, live],
  )

  const categories = CATEGORIES.filter((c) => c === 'All' || roster.some((a) => a.category === c))
  const shown = cat === 'All' ? roster : roster.filter((a) => a.category === cat)

  const nextLine = (a: ArtistStat) =>
    a.dates.length ? `${a.dates.length} ${plural(a.dates.length, 'date')} · next ${fmtDateShort(a.dates[0].start)}` : 'Dates to be announced'

  return (
    <>
      <Meta
        title="Artists"
        description={`${artists.length} artists with upcoming shows listed on Mytix.`}
      />

      {/* Filmstrip hero, graded to the selected category */}
      <section className="relative mt-16 h-[calc(100svh-4rem)] min-h-[560px] lg:max-h-[980px]">
        {shown.length > 0 ? (
          <HeroCarousel
            key={cat}
            items={shown.map((a) => ({
              id: a.name,
              title: twoLines(a.name),
              image: a.image,
              credit: `${a.category}.`,
              meta: a.dates.length
                ? [fmtDateShort(a.dates[0].start), a.cities[0] ?? '', `${a.dates.length} ${plural(a.dates.length, 'date')}`]
                : ['Dates to be announced'],
              accent: ACCENT[a.category] ?? ACCENT.All,
            }))}
            autoplay
            autoplayDelay={5000}
            wheelAxis="x"
            blurBackdrop
            renderCta={(item) => (
              <Link
                to={`/events?q=${encodeURIComponent(String(item.id))}`}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink transition-transform hover:scale-[1.03]"
              >
                See dates
                <Arrow className="h-4 w-4" />
              </Link>
            )}
          />
        ) : (
          <div className="h-full w-full bg-ink" />
        )}

        {/* Category tabs, floating over the stage */}
        <div className="no-scrollbar pointer-events-none absolute inset-x-0 top-5 z-10 flex overflow-x-auto px-4 sm:justify-center">
          <div
            role="tablist"
            aria-label="Artist categories"
            className="pointer-events-auto flex shrink-0 gap-1 rounded-full border border-white/15 bg-black/30 p-1 backdrop-blur-md"
          >
            {categories.map((c) => {
              const on = cat === c
              return (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setCat(c)}
                  className={cx(
                    'inline-flex h-9 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-colors duration-200',
                    on ? 'bg-white text-ink' : 'text-white/80 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ACCENT[c] }} />
                  {c === 'All' ? 'All artists' : c}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <div className="wrap">
        {/* On tour now */}
        <section className="section">
          <Reveal>
            <SectionHead
              title={cat === 'All' ? 'On tour now' : `${cat} on tour`}
              blurb="Busiest tours first. Select an artist to see every date."
              action={
                shown.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                      {shown.slice(0, 5).map((a) => (
                        <Avatar key={a.name} className="h-10 w-10 ring-2 ring-white">
                          <AvatarImage src={a.image} alt={a.name} />
                          <AvatarFallback className={tint(a.name)}>{initials(a.name)}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <span className="text-sm text-muted">
                      {shown.length} {plural(shown.length, 'artist')}
                    </span>
                  </div>
                )
              }
            />

            {categories.length > 1 && (
              <div className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
                {categories.map((c) => (
                  <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                    {c === 'All' ? 'All artists' : c}
                  </Chip>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {loading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="card overflow-hidden" aria-hidden>
                    <div className="skeleton aspect-[5/3]" />
                    <div className="space-y-3 p-4">
                      <div className="skeleton h-4 w-2/3 rounded-md" />
                      <div className="skeleton h-3 w-1/2 rounded-md" />
                    </div>
                  </div>
                ))}
              {shown.map((a) => (
                <Link
                  key={a.name}
                  to={`/events?q=${encodeURIComponent(a.name)}`}
                  className="card card-hover group block overflow-hidden"
                >
                  <div className="relative">
                    <Img src={a.image} alt={a.name} loading="lazy" className="aspect-[5/3] bg-surface" />
                    <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink">
                      {a.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="truncate text-base font-semibold text-ink transition-colors group-hover:text-blue">{a.name}</h3>
                      <Arrow className="h-4 w-4 shrink-0 text-faint transition-all group-hover:translate-x-0.5 group-hover:text-blue" />
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                      <CalendarDays className="h-4 w-4 shrink-0 text-blue" />
                      <span className="truncate">{nextLine(a)}</span>
                    </p>
                    {a.cities.length > 0 && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                        <MapPin className="h-4 w-4 shrink-0 text-faint" />
                        <span className="truncate">{a.cities.join(', ')}</span>
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>

        <section className="section">
          <Reveal>
            <DarkCta
              label="For promoters"
              title="Bringing an artist to Australia?"
              body="Tell us about the tour and we’ll talk about listing the dates here."
              action="Get in touch"
            />
          </Reveal>
        </section>
      </div>
    </>
  )
}
