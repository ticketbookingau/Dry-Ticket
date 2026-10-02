import { useEffect, useRef, useState } from 'react'
import type { ImgHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { cx } from '../lib/format'
import { SITE_NAME as SITE } from '../lib/site'

/* ------------------------------------------------------------------ Meta */

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

/** Per-page title, description and Open Graph tags; updates the defaults in index.html in place. */
export function Meta({ title, description, image }: { title: string; description: string; image?: string }) {
  useEffect(() => {
    const full = title === SITE ? title : `${title} — ${SITE}`
    document.title = full
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', full)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:image', image ?? new URL('/hero-concert.jpg', location.origin).href)
    setMeta('property', 'og:url', location.href)
  }, [title, description, image])
  return null
}

/* ---------------------------------------------------------------- Reveal */

/** One fade-up per section on first scroll into view. No stagger, no delay. */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------- Img */

/** Image with a skeleton until loaded, then a short fade. */
export function Img({ className, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <span className={cx('block overflow-hidden', !loaded && 'skeleton', className)}>
      <img
        {...rest}
        onLoad={() => setLoaded(true)}
        className={cx('h-full w-full object-cover transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
      />
    </span>
  )
}

/* ---------------------------------------------------------------- Button */

type ButtonProps = {
  children: ReactNode
  to?: string
  href?: string
  onClick?: () => void
  variant?: keyof typeof variants
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  loading?: boolean
}

const sizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

const variants = {
  primary: 'bg-blue text-white hover:bg-blue-dark',
  outline: 'bg-white border border-line text-ink hover:border-line-strong hover:bg-surface',
  ghost: 'text-muted hover:text-ink hover:bg-surface',
  // For dark panels
  light: 'bg-white text-ink hover:bg-white/90',
  'outline-light': 'border border-white/40 text-white hover:border-white/70 hover:bg-white/10',
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cx('inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent', className)}
    />
  )
}

export function Button({
  children,
  to,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  disabled,
  loading,
}: ButtonProps) {
  const cls = cx(
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap cursor-pointer select-none',
    'transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none',
    sizes[size],
    variants[variant],
    className,
  )
  const external = href?.startsWith('http')

  if (to) return <Link to={to} className={cls}>{children}</Link>
  if (href)
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined} className={cls}>
        {children}
      </a>
    )
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} aria-busy={loading} className={cls}>
      {loading ? <Spinner /> : children}
    </button>
  )
}

/* ---------------------------------------------------------- Input / Field */

export const inputCls =
  'h-11 w-full rounded-lg border border-line bg-white px-4 text-sm text-ink placeholder:text-faint ' +
  'transition-colors duration-150 hover:border-line-strong focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue-light'

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={cx(inputCls, className)} />
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select {...rest} className={cx(inputCls, 'appearance-none pr-10 cursor-pointer', className)}>
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

/** Poster-card placeholder shown while events load. Same footprint as PosterCard. */
export function SkeletonCard() {
  return (
    <div className="card overflow-hidden" aria-hidden>
      <div className="skeleton aspect-[16/11]" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-3 w-1/3 rounded-md" />
        <div className="skeleton h-4 w-5/6 rounded-md" />
        <div className="skeleton h-3 w-1/2 rounded-md" />
      </div>
    </div>
  )
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...rest} className={cx(inputCls, 'h-auto resize-none py-3', className)} />
}

export function Field({
  label,
  hint,
  children,
  id,
}: {
  label: string
  hint?: string
  id: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && <p className="mt-2 text-xs text-faint">{hint}</p>}
    </div>
  )
}

/* --------------------------------------------------------------- Eyebrow */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx('t-label block text-blue', className)}>{children}</span>
}

/* -------------------------------------------------------- Section header */

export function SectionHead({
  eyebrow,
  title,
  blurb,
  action,
}: {
  eyebrow?: string
  title: string
  blurb?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
        <h2 className="t-h2 text-ink">{title}</h2>
        {blurb && <p className="mt-2 max-w-xl text-muted">{blurb}</p>}
      </div>
      {action}
    </div>
  )
}

/** Divider row used above every date-grouped list: "SEPTEMBER 2026 ——— 4 shows". */
export function GroupHead({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="mb-4 flex items-baseline gap-4">
      <h3 className="t-label text-blue">{title}</h3>
      <span className="h-px flex-1 bg-line" />
      <span className="text-xs font-medium text-faint">{meta}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ Chip */

export function Chip({ children, active, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'h-9 shrink-0 rounded-lg border px-4 text-sm font-medium transition-colors duration-150 cursor-pointer',
        active
          ? 'border-blue bg-blue-light text-blue'
          : 'border-line bg-white text-muted hover:border-line-strong hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

/* ----------------------------------------------------------------- Badge */

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'blue' | 'success' | 'danger' | 'warning'
}) {
  const tones = {
    neutral: 'bg-surface text-muted border-line',
    blue: 'bg-blue-light text-blue border-blue/20',
    success: 'bg-success-light text-success border-success/20',
    danger: 'bg-danger-light text-danger border-danger/20',
    warning: 'bg-warning-light text-warning border-warning/20',
  }
  return (
    <span className={cx('t-label inline-flex h-6 items-center rounded-md border px-2', tones[tone])}>{children}</span>
  )
}

/* ---------------------------------------------------------------- Dialog */

/** While `open`: Escape closes and body scroll is locked. */
export function useDialog(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', h)
    }
  }, [open, onClose])
}
