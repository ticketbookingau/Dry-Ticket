import { useState } from 'react'
import { Button, Field, Input, Meta, Reveal, SectionHead, Textarea } from '../components/Primitives'
import { Arrow, Bolt, Check, Phone, Pin, Shield, Ticket } from '../components/Icons'
import { BOOKINGS_INBOX } from '../lib/booking'
import { COMPANY, LOCATION, OWNER, PHONE, PHONE_HREF } from '../lib/site'

const services = [
  {
    Icon: Ticket,
    title: 'An event page',
    body: 'Your poster, date, venue and ticket types, listed alongside the other shows on the site.',
  },
  {
    Icon: Bolt,
    title: 'Booking requests',
    body: 'Buyers choose their tickets and send a request online, so you can see interest as it comes in.',
  },
  {
    Icon: Pin,
    title: 'Searchable by city',
    body: 'Your show appears when people browse events in its city, category or venue.',
  },
  {
    Icon: Shield,
    title: 'A direct contact',
    body: `You deal with ${OWNER} and the ${COMPANY} team in ${LOCATION}, not a call centre.`,
  },
]

const steps = [
  { n: '1', title: 'Tell us about the show', body: 'Artist, venue, date and ticket types. A short call is usually enough.' },
  { n: '2', title: 'We agree the details', body: 'How the listing works and what it costs, before anything goes live.' },
  { n: '3', title: 'Your page goes live', body: 'We set up the event page and publish it once you have signed it off.' },
  { n: '4', title: 'Requests come in', body: 'We follow up booking requests and keep you updated.' },
]

/** Opens the visitor's email app with the enquiry filled in. */
function emailEnquiry(form: HTMLFormElement) {
  const data = new FormData(form)
  const field = (k: string) => String(data.get(k) ?? '').trim()
  const subject = `Event enquiry: ${field('event')}`
  const body = [
    `Name: ${field('name')}`,
    `Email: ${field('email')}`,
    `Phone: ${field('phone')}`,
    `Event or artist: ${field('event')}`,
    `City: ${field('city')}`,
    `Expected capacity: ${field('capacity')}`,
    '',
    field('message'),
  ].join('\n')
  window.location.href = `mailto:${BOOKINGS_INBOX}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export default function Sell() {
  const [status, setStatus] = useState<'idle' | 'sent'>('idle')

  return (
    <div className="wrap page-top">
      <Meta
        title="Sell tickets"
        description={`List your event with ${COMPANY} in ${LOCATION}. Send an enquiry or call ${PHONE}.`}
      />

      <div className="max-w-3xl">
        <span className="t-label text-blue">For organisers</span>
        <h1 className="t-h1 mt-3 text-ink">Got a show coming up? Put it in front of people.</h1>
        <p className="t-lede mt-4 max-w-xl">
          List your event here and let people book with a simple online request. {COMPANY} is based in{' '}
          {LOCATION} — talk to us about your show and we’ll see how we can help.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="#enquire" size="lg">
            Send an enquiry
            <Arrow className="h-4 w-4" />
          </Button>
          <Button href={PHONE_HREF} variant="outline" size="lg">
            <Phone className="h-4 w-4" />
            {PHONE}
          </Button>
        </div>
      </div>

      <section className="section">
        <Reveal>
          <SectionHead eyebrow="What you get" title="What a listing includes" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {services.map((s) => (
              <div key={s.title} className="card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-light text-blue">
                  <s.Icon className="h-5 w-5" />
                </span>
                <h3 className="t-h3 mt-4 text-ink">{s.title}</h3>
                <p className="mt-2 text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section">
        <Reveal>
          <SectionHead eyebrow="How it works" title="From first chat to going live" />
          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n} className="card p-6">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue text-sm font-semibold text-white">{s.n}</span>
                <h3 className="mt-4 text-base font-semibold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      <section id="enquire" className="section scroll-mt-16">
        <div className="card grid grid-cols-1 overflow-hidden lg:grid-cols-2">
          <div className="border-b border-line p-8 sm:p-12 lg:border-b-0 lg:border-r">
            <span className="t-label text-blue">Enquire</span>
            <h2 className="t-h2 mt-3 text-ink">Tell us about your event</h2>
            <p className="mt-4 text-muted">
              Share a few details and we’ll get back to you to talk it through.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'Talk directly with the owner',
                'Costs agreed with you upfront',
                'Based locally in Sydney',
              ].map((p) => (
                <li key={p} className="flex items-start gap-3 text-ink">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-light text-success">
                    <Check className="h-3 w-3" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-10 border-t border-line pt-6">
              <p className="t-label text-faint">Or call us</p>
              <a href={PHONE_HREF} className="mt-3 inline-flex items-center gap-2 text-lg font-semibold text-ink hover:text-blue">
                <Phone className="h-5 w-5 text-blue" />
                {PHONE}
              </a>
              <p className="mt-1 text-sm text-muted">
                {OWNER} · {COMPANY}, {LOCATION}
              </p>
            </div>
          </div>

          <div className="p-8 sm:p-12">
            {status === 'sent' ? (
              <div className="flex h-full min-h-96 flex-col items-center justify-center text-center">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-success-light text-success">
                  <Check className="h-6 w-6" />
                </span>
                <h3 className="t-h3 mt-4 text-ink">Almost done — check your email app</h3>
                <p className="mt-2 max-w-sm text-muted">
                  Your enquiry should be open in a new email, ready to send. If nothing opened, email{' '}
                  <a href={`mailto:${BOOKINGS_INBOX}`} className="font-medium text-blue">
                    {BOOKINGS_INBOX}
                  </a>{' '}
                  or call {PHONE}.
                </p>
                <Button variant="outline" onClick={() => setStatus('idle')} className="mt-8">
                  Send another enquiry
                </Button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  emailEnquiry(e.currentTarget)
                  setStatus('sent')
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Your name" id="name">
                    <Input id="name" name="name" required maxLength={120} autoComplete="name" />
                  </Field>
                  <Field label="Email" id="email">
                    <Input id="email" name="email" type="email" required maxLength={254} autoComplete="email" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Phone" id="phone">
                    <Input id="phone" name="phone" type="tel" maxLength={20} autoComplete="tel" />
                  </Field>
                  <Field label="Event or artist" id="event">
                    <Input id="event" name="event" required maxLength={200} />
                  </Field>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="City" id="city">
                    <Input id="city" name="city" maxLength={80} />
                  </Field>
                  <Field label="Expected capacity" id="capacity">
                    <Input id="capacity" name="capacity" inputMode="numeric" maxLength={7} />
                  </Field>
                </div>
                <Field label="Anything else" id="message" hint="Venue, proposed dates, ticket tiers.">
                  <Textarea id="message" name="message" rows={4} maxLength={2000} />
                </Field>
                <Button type="submit" size="lg" className="w-full">
                  Write enquiry email
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
