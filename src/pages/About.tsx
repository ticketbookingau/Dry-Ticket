import { useEvents } from '../lib/events'
import { Button, Meta, Reveal, SectionHead } from '../components/Primitives'
import { Arrow, Phone } from '../components/Icons'
import { BOOKINGS_INBOX } from '../lib/booking'
import { COMPANY, LOCATION, OWNER, PHONE, PHONE_HREF, SITE_NAME } from '../lib/site'

const faqs = [
  {
    q: 'How do I book tickets?',
    a: 'Open an event, choose your ticket type and quantity, and send a booking request with your name, email and phone. No payment is taken on the website — our team contacts you to confirm the booking and arrange payment.',
  },
  {
    q: 'When will I hear back?',
    a: `We aim to reply as soon as we can, usually within a business day. If your show is very soon, call us on ${PHONE}.`,
  },
  {
    q: 'Can I get a refund or exchange?',
    a: 'It depends on the event and its organiser. Ask us when we confirm your booking and we will tell you what applies to your show.',
  },
  {
    q: 'What is the booking fee?',
    a: 'A small fee per order that covers handling your booking. It is shown next to the ticket price before you send your request.',
  },
  {
    q: 'I am organising an event. Can you list it?',
    a: `Possibly — send an enquiry from the Sell tickets page or call ${PHONE} and tell us about the show.`,
  },
]

const details = [
  { label: 'Company', value: COMPANY },
  { label: 'Owner', value: OWNER },
  { label: 'Location', value: LOCATION },
  { label: 'Phone', value: PHONE },
]

export default function About() {
  const { events } = useEvents()
  return (
    <div className="wrap page-top">
      <Meta
        title="About"
        description={`${SITE_NAME} is run by ${COMPANY} in ${LOCATION}. How booking works, FAQs and contact details.`}
      />

      <div className="max-w-3xl">
        <span className="t-label text-blue">About</span>
        <h1 className="t-h1 mt-3 text-ink">Live shows, booked the personal way</h1>
        <p className="t-lede mt-4">
          {SITE_NAME} is run by {COMPANY}, based in {LOCATION} and owned by {OWNER}. We list
          concerts, comedy and cultural nights in one place, take your booking request online, and follow up with
          you personally to sort out your tickets.
        </p>
      </div>

      <div className="no-scrollbar edge-fade mt-12 flex gap-4 overflow-hidden" aria-hidden>
        {events.slice(0, 12).map((e) => (
          <img
            key={e.slug}
            src={e.image}
            alt=""
            loading="lazy"
            className="aspect-[460/651] w-32 shrink-0 rounded-lg border border-line object-cover sm:w-40"
          />
        ))}
      </div>

      <section className="section">
        <Reveal>
          <SectionHead eyebrow="FAQ" title="Common questions" />
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
            {faqs.map((f) => (
              <details key={f.q} className="card group p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span
                    aria-hidden
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-blue transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="contact" className="section scroll-mt-16">
        <Reveal>
          <div className="card grid grid-cols-1 gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="t-label text-blue">Contact</span>
              <h2 className="t-h2 mt-3 text-ink">Get in touch</h2>
              <p className="mt-4 max-w-md text-muted">
                Call us or send an email about a booking, an event, or anything else. We’ll get back to you as soon
                as we can.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href={PHONE_HREF} size="lg">
                  <Phone className="h-4 w-4" />
                  {PHONE}
                </Button>
                <Button href={`mailto:${BOOKINGS_INBOX}`} variant="outline" size="lg">
                  {BOOKINGS_INBOX}
                </Button>
              </div>
            </div>

            <div>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {details.map((c) => (
                  <div key={c.label} className="rounded-lg border border-line bg-surface p-4">
                    <dt className="t-label text-faint">{c.label}</dt>
                    <dd className="mt-2 text-sm font-semibold text-ink">{c.value}</dd>
                  </div>
                ))}
              </dl>
              <Button to="/sell" variant="ghost" className="mt-4">
                Organiser enquiries
                <Arrow className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
