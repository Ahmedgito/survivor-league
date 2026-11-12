import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Heart, Menu, PawPrint, X } from 'lucide-react'
import { useSavedPets } from '@/lib/savedPets'
import { cn } from '@/lib/cn'

const NAV = [
  { to: '/', label: 'Story', end: true },
  { to: '/pets', label: 'Meet the pets' },
  { to: '/match', label: 'Find my match' },
]

function SavedBadge({ className }: { className?: string }) {
  const { count } = useSavedPets()
  return (
    <Link
      to="/saved"
      className={cn(
        'relative inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:border-primary',
        className,
      )}
      aria-label={`Saved pets: ${count}`}
    >
      <Heart aria-hidden className={cn('size-4', count > 0 && 'fill-primary text-primary')} />
      <span aria-hidden>{count}</span>
    </Link>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-line/70 bg-cream/85 px-3 py-2 shadow-card backdrop-blur-md sm:px-4"
      >
        <Link to="/" className="flex h-11 items-center gap-2 rounded-full px-2 font-display text-xl font-extrabold">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-white">
            <PawPrint aria-hidden className="size-4" />
          </span>
          PawPath
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold text-muted transition hover:text-ink',
                    isActive && 'bg-surface text-ink shadow-card',
                  )
                }
              >
                {n.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <SavedBadge />
          <Link
            to="/match"
            className="hidden h-11 items-center rounded-full bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary-hover sm:inline-flex"
          >
            Find my match
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X aria-hidden className="size-5" /> : <Menu aria-hidden className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="mx-auto mt-2 max-w-6xl rounded-3xl border border-line bg-cream p-3 shadow-card md:hidden">
          <ul className="flex flex-col">
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) =>
                    cn('flex h-12 items-center rounded-2xl px-4 font-semibold', isActive ? 'bg-surface text-ink' : 'text-muted')
                  }
                >
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-sand/60">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-muted sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-lg font-extrabold text-ink">PawPath</p>
          <p className="mt-1">Helping first-time adopters find a friend that fits their life.</p>
        </div>
        <div>
          <p className="font-semibold text-ink">Demo notice</p>
          <p className="mt-1">
            All pets, shelters, people and contact details are <strong className="text-ink">fictional sample data</strong>.
            No inquiries are sent and no payments are processed.
          </p>
        </div>
        <div>
          <p className="font-semibold text-ink">Credits</p>
          <p className="mt-1">
            3D animals &amp; props: Quaternius, KayKit and others via Poly Pizza (CC0). UI pieces adapted from React Bits
            &amp; 21st.dev. Built for the ACM MAJU Vibe Coding Competition.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
      <div id="a11y-announcer" role="status" aria-live="polite" className="sr-only" />
    </>
  )
}
