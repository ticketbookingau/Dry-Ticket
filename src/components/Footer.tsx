import { Link } from 'react-router-dom'
import { Logo } from './Nav'
import { Phone } from './Icons'
import { COMPANY, LOCATION, PHONE, PHONE_HREF } from '../lib/site'

const links = [
  { to: '/events', label: 'Events' },
  { to: '/artists', label: 'Artists' },
  { to: '/venues', label: 'Venues' },
  { to: '/sell', label: 'Sell tickets' },
  { to: '/about', label: 'About' },
  { to: '/about#contact', label: 'Contact' },
  { to: '/admin', label: 'Admin' },
]

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="wrap py-12">
        <div className="flex flex-col gap-8 border-b border-line pb-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm text-muted">
              Live shows in Australia, brought to you by {COMPANY}. Send a booking request online and our team
              will contact you to finalise it.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="font-medium text-muted transition-colors hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY} · {LOCATION} · Prices in AUD
          </p>
          <a href={PHONE_HREF} className="inline-flex items-center gap-2 font-medium transition-colors hover:text-ink">
            <Phone className="h-4 w-4" />
            {PHONE}
          </a>
        </div>
      </div>
    </footer>
  )
}
