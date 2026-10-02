import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AUSTRALIAN_CITIES, seedEvents } from '../data/events'
import { deriveLive, useEvents } from '../lib/events'
import { ALL_CITIES, useCity } from '../lib/city'
import DiagonalMarqueeCarousel, { type CardItem } from '@/components/ui/great-ui-diagonal-marquee-carousel'
import { Button, Input, inputCls } from './Primitives'
import { ChevronDown, Pin, Search } from './Icons'

/** Latest shows first, one poster per event, capped so the marquee stays light. */
const toCards = (list: { slug: string; title: string; image: string }[]): CardItem[] =>
  list.filter((e) => e.image).slice(0, 12).map((e) => ({ id: e.slug, url: e.image, title: e.title }))

export function Hero() {
  const { live, categories, loading } = useEvents()
  const { city: savedCity } = useCity()
  const [q, setQ] = useState('')
  const [picked, setPicked] = useState<string>()
  const navigate = useNavigate()
  const city = picked ?? savedCity

  const popular = categories.filter((c) => live.filter((e) => e.category === c).length >= 2)

  // Built-in shows fill the marquee while the live list loads; if neither has posters,
  // the carousel falls back to its own stock photography.
  const cards = toCards(live.length || !loading ? live : deriveLive(seedEvents))

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (city !== ALL_CITIES) params.set('city', city)
    navigate(`/events${params.size ? `?${params}` : ''}`)
  }

  return (
    <section className="relative flex min-h-[640px] items-center overflow-hidden border-b border-line bg-white h-[100svh] max-h-[960px]">
      <DiagonalMarqueeCarousel
        cards={cards.length ? cards : undefined}
        angle={-14}
        baseSpeed={90}
        className="absolute inset-0 h-full"
        cardClassName="h-[280px] w-[198px] sm:h-[340px] sm:w-[240px]"
        onCardClick={(c) => navigate(`/event/${c.id}`)}
      />

      {/* Soft white wash behind the copy so it reads over any poster. */}
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.55)_45%,transparent_75%)]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="wrap pointer-events-none relative z-20 w-full pt-16"
      >
        <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-white/60 bg-white/85 p-6 text-center shadow-xl backdrop-blur-xl sm:p-10">
          <span className="t-label text-blue">Upcoming shows</span>
          <h1 className="t-display mt-3 text-ink">Your next night out starts here.</h1>
          <p className="t-lede mx-auto mt-4 max-w-xl">
            Search concerts, comedy and cultural nights by city, choose your tickets and send a booking request. A
            real person from our Sydney team gets back to you.
          </p>

          <form onSubmit={search} className="card mt-8 flex flex-col gap-2 p-2 text-left sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events, artists or venues"
                aria-label="Search events"
                className="h-12 border-0 pl-11 hover:border-0 focus:ring-0"
              />
            </div>
            <span className="hidden h-8 w-px bg-line sm:block" />
            <div className="relative sm:w-48">
              <Pin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-blue" />
              <select
                value={city}
                onChange={(e) => setPicked(e.target.value)}
                aria-label="City"
                className={`${inputCls} h-12 appearance-none border-0 pl-11 pr-10 font-medium hover:border-0 focus:ring-0 cursor-pointer`}
              >
                <option value={ALL_CITIES}>{ALL_CITIES}</option>
                {AUSTRALIAN_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            </div>
            <Button type="submit" size="lg" className="shrink-0">
              Search
            </Button>
          </form>

          {popular.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-faint">Browse:</span>
              {popular.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => navigate(`/events?category=${encodeURIComponent(c)}`)}
                  className="rounded-lg border border-line bg-white px-3 py-1 font-medium text-muted transition-colors duration-150 hover:border-line-strong hover:text-ink cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
