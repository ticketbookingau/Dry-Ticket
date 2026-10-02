import { Button } from './Primitives'
import { Arrow } from './Icons'
import { PHONE, PHONE_HREF } from '../lib/site'

/** Closing call-to-action in the espresso panel used across the site. */
export function DarkCta({ label, title, body, action }: { label: string; title: string; body: string; action: string }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[rgba(238,228,218,0.16)] bg-[linear-gradient(135deg,#16110e,#2b211b)] px-8 py-12 text-center shadow-[0_32px_90px_-56px_rgba(20,16,12,0.72)] sm:px-12 sm:py-16">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(520px circle at 50% 0%, rgba(255,255,255,0.12), transparent 60%)' }}
      />
      <div className="relative mx-auto max-w-2xl">
        <span className="t-label text-white/60">{label}</span>
        <h2 className="t-h2 mt-3 text-white">{title}</h2>
        <p className="mt-4 text-white/70">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/sell" variant="light">
            {action}
            <Arrow className="h-4 w-4" />
          </Button>
          <Button href={PHONE_HREF} variant="outline-light">
            Call {PHONE}
          </Button>
        </div>
      </div>
    </div>
  )
}
