import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AUSTRALIAN_CITIES } from '../data/events'
import { useEvents } from '../lib/events'
import { cx, monthKey } from '../lib/format'
import { plural } from '../lib/copy'
import { EventRow, PosterCard } from '../components/PosterCard'
import { Button, GroupHead, Input, Meta, SkeletonCard } from '../components/Primitives'
import { Close, Grid, Menu, Search } from '../components/Icons'
import { CITY_INFO } from '../components/cityIcons'
import { CategoryDropdown } from '../components/CategoryDropdown'
import { Sidebar, SidebarBody, SidebarItem, SidebarSection } from '@/components/ui/sidebar'
import {
  Archive,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  Clock,
  Globe,
  Hourglass,
  RotateCcw,
  SlidersHorizontal,
  Ticket,
} from 'lucide-react'

type Sort = 'date' | 'price-low' | 'price-high'
type DateFilter = 'all' | 'weekend' | 'month'
type ViewMode = 'grid' | 'list'
type Show = 'live' | 'presale' | 'past'

const DATES: { id: DateFilter; label: string; icon: ReactNode }[] = [
  { id: 'all', label: 'Any date', icon: <CalendarDays /> },
  { id: 'weekend', label: 'Fri – Sun only', icon: <CalendarRange /> },
  { id: 'month', label: 'Next 30 days', icon: <CalendarClock /> },
]

const SORTS: { id: Sort; label: string; icon: ReactNode }[] = [
  { id: 'date', label: 'Soonest first', icon: <Clock /> },
  { id: 'price-low', label: 'Price: low to high', icon: <ArrowUpNarrowWide /> },
  { id: 'price-high', label: 'Price: high to low', icon: <ArrowDownWideNarrow /> },
]

const SHOWS: { id: Show; label: string; icon: ReactNode }[] = [
  { id: 'live', label: 'On sale now', icon: <Ticket /> },
  { id: 'presale', label: 'Presale', icon: <Hourglass /> },
  { id: 'past', label: 'All incl. past', icon: <Archive /> },
]

const asShow = (v: string | null): Show => (v === 'presale' || v === 'past' ? v : 'live')

export default function Events() {
  const { events, live, presale, categories, loading } = useEvents()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [city, setCity] = useState(params.get('city') ?? 'All')
  const [cat, setCat] = useState(params.get('category') ?? 'All')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [sort, setSort] = useState<Sort>('date')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [show, setShow] = useState<Show>(() => asShow(params.get('filter')))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [now] = useState(() => Date.now())

  const pool = show === 'presale' ? presale : show === 'past' ? events : live

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()

    const out = pool.filter((e) => {
      if (city !== 'All' && e.metro !== city) return false
      if (cat !== 'All' && e.category.toLowerCase() !== cat.toLowerCase()) return false

      if (dateFilter === 'weekend' && e.start) {
        const day = new Date(e.start).getDay()
        if (day !== 5 && day !== 6 && day !== 0) return false
      } else if (dateFilter === 'month' && e.start) {
        const diffDays = (new Date(e.start).getTime() - now) / 86_400_000
        if (diffDays < 0 || diffDays > 31) return false
      }

      if (!term) return true
      return [e.title, e.venue, e.metro, e.city, e.category, ...e.artists.map((a) => a.name)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    })

    if (sort === 'price-low') return [...out].sort((a, b) => (a.low ?? 1e9) - (b.low ?? 1e9))
    if (sort === 'price-high') return [...out].sort((a, b) => (b.high ?? 0) - (a.high ?? 0))
    return out
  }, [pool, q, city, cat, dateFilter, sort, now])

  const grouped = useMemo(
    () =>
      results.reduce<Record<string, typeof results>>((acc, e) => {
        ;(acc[monthKey(e.start)] ??= []).push(e)
        return acc
      }, {}),
    [results],
  )

  const active = city !== 'All' || cat !== 'All' || q.trim() !== '' || dateFilter !== 'all' || show !== 'live'
  const groupByMonth = sort === 'date' && !q.trim() && dateFilter === 'all'

  const reset = () => {
    setQ('')
    setCity('All')
    setCat('All')
    setDateFilter('all')
    setSort('date')
    setShow('live')
    setParams({})
  }

  const title =
    show === 'presale'
      ? 'Presale events'
      : show === 'past'
        ? 'Past events'
        : city !== 'All'
          ? `Events in ${city}`
          : 'Events across Australia'

  const grid = 'grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

  const cityCount = (name: string) => pool.filter((e) => e.metro === name).length
  const catCount = (name: string) => pool.filter((e) => e.category === name).length
  const summary = [
    city !== 'All' ? city : null,
    cat !== 'All' ? cat : null,
    dateFilter !== 'all' ? DATES.find((d) => d.id === dateFilter)?.label : null,
    SORTS.find((o) => o.id === sort)?.label,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex flex-col pt-16 md:flex-row">
      <Meta
        title={title}
        description={`Browse ${results.length} ${plural(results.length, 'event')} — filter by city, category and date.`}
      />

      {/* Filters: an icon rail on desktop that expands on hover, a full-screen drawer on mobile */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody
          className="gap-2"
          mobileTrigger={
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-light text-blue">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">Filters</span>
                <span className="block truncate text-xs text-muted">{summary}</span>
              </span>
            </span>
          }
          mobileFooter={
            <Button size="lg" className="w-full" onClick={() => setSidebarOpen(false)}>
              Show {results.length} {plural(results.length, 'event')}
            </Button>
          }
        >
          <div className="no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden">
            <SidebarSection title="Date">
              {DATES.map((d) => (
                <SidebarItem key={d.id} icon={d.icon} label={d.label} active={dateFilter === d.id} onClick={() => setDateFilter(d.id)} />
              ))}
            </SidebarSection>

            <SidebarSection title="Sort by">
              {SORTS.map((o) => (
                <SidebarItem key={o.id} icon={o.icon} label={o.label} active={sort === o.id} onClick={() => setSort(o.id)} />
              ))}
            </SidebarSection>

            <SidebarSection title="Filters">
              {SHOWS.map((o) => (
                <SidebarItem key={o.id} icon={o.icon} label={o.label} active={show === o.id} onClick={() => setShow(o.id)} />
              ))}
            </SidebarSection>

            <SidebarSection title="Cities">
              <SidebarItem icon={<Globe />} label="All cities" count={pool.length} active={city === 'All'} onClick={() => setCity('All')} />
              {AUSTRALIAN_CITIES.map((c) => {
                const Icon = CITY_INFO[c.name].Icon
                return (
                  <SidebarItem
                    key={c.name}
                    icon={<Icon />}
                    label={c.name}
                    count={cityCount(c.name)}
                    active={city === c.name}
                    onClick={() => setCity(c.name)}
                  />
                )
              })}
            </SidebarSection>

          </div>

          {active && (
            <div className="shrink-0 border-t border-line pt-2">
              <SidebarItem icon={<RotateCcw />} label="Reset all filters" onClick={reset} />
            </div>
          )}
        </SidebarBody>
      </Sidebar>

      <div className="min-w-0 flex-1 px-4 pb-4 pt-10 sm:px-8 lg:pt-14">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-3xl">
              <span className="t-label text-blue">
                {results.length} {plural(results.length, 'event')}
              </span>
              <h1 className="t-h1 mt-3 text-ink">{title}</h1>
            </div>

            <div className="flex items-center gap-2">
              {active && (
                <Button variant="ghost" size="sm" onClick={reset} className="h-10">
                  <Close className="h-4 w-4" />
                  Reset
                </Button>
              )}
              <div className="hidden h-10 items-center gap-1 rounded-lg border border-line bg-white p-1 sm:flex" role="group" aria-label="View">
                {(
                  [
                    { id: 'grid', Icon: Grid, label: 'Grid view' },
                    { id: 'list', Icon: Menu, label: 'List view' },
                  ] as const
                ).map(({ id, Icon, label }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setViewMode(id)}
                    aria-label={label}
                    aria-pressed={viewMode === id}
                    className={cx(
                      'grid h-8 w-8 place-items-center rounded-md transition-colors duration-150 cursor-pointer',
                      viewMode === id ? 'bg-blue-light text-blue' : 'text-faint hover:text-ink',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search (half width on desktop) with the category rail beside it */}
          <div className="mb-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="relative w-full shrink-0 lg:w-1/2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by artist, venue, title or city"
                aria-label="Search events"
                className="h-11 pl-9 pr-9"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-faint hover:text-ink cursor-pointer"
                >
                  <Close className="h-4 w-4" />
                </button>
              )}
            </div>

            <CategoryDropdown
              items={categories
                .map((c) => ({ name: c, count: catCount(c) }))
                .filter((c) => c.count > 0 || c.name === cat)}
              total={pool.length}
              active={cat}
              onChange={setCat}
            />
          </div>

          {loading ? (
            <div className={grid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="card flex flex-col items-center px-4 py-24 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-surface text-faint">
                <Search className="h-6 w-6" />
              </span>
              <h2 className="t-h3 mt-4 text-ink">No events match these filters</h2>
              <p className="mt-2 max-w-sm text-sm text-muted">Try another city or category, or clear the search term.</p>
              <Button onClick={reset} className="mt-6">
                Clear all filters
              </Button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-10">
              {Object.entries(grouped).map(([month, items]) => (
                <div key={month}>
                  <GroupHead title={month} meta={`${items.length} ${plural(items.length, 'event')}`} />
                  <div className="card divide-y divide-line p-2">
                    {items.map((e) => (
                      <EventRow key={e.slug} event={e} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : groupByMonth ? (
            <div className="space-y-12">
              {Object.entries(grouped).map(([month, items]) => (
                <div key={month}>
                  <GroupHead title={month} meta={`${items.length} ${plural(items.length, 'event')}`} />
                  <div className={grid}>
                    {items.map((e, i) => (
                      <PosterCard key={e.slug} event={e} index={i} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={grid}>
              {results.map((e, i) => (
                <PosterCard key={e.slug} event={e} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
