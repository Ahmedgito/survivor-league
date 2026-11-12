import { Link } from 'react-router-dom'
import { PETS } from '@/data/pets'

// Temporary landing used for the first deploy while the 3D scroll story is finalised.
export default function StoryPage() {
  return (
    <section className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-center gap-10 px-4 pt-28 pb-16 sm:px-6">
      <div className="max-w-2xl">
        <p className="font-semibold text-primary-strong">Pet adoption for first-time adopters</p>
        <h1 className="mt-3 text-5xl font-extrabold sm:text-6xl">Find a pet that fits your life.</h1>
        <p className="mt-4 text-lg text-muted">
          {PETS.length} fictional pets are waiting. Take a 1-minute quiz and we’ll show you who fits your home, your time and your pace.
        </p>
        <Link
          to="/match"
          className="mt-8 inline-flex h-14 items-center rounded-full bg-primary px-8 text-lg font-bold text-white shadow-[var(--shadow-pop)] transition hover:bg-primary-strong"
        >
          Find my match
        </Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {[
          { to: '/match', title: 'Take the match quiz', body: '4 questions about your life → pets ranked with reasons why they fit.' },
          { to: '/pets', title: 'Browse by type', body: 'Dogs, cats, rabbits, birds and fish — filter by age, size and energy.' },
          { to: '/pets/biscuit', title: 'Meet Biscuit', body: '214 nights at the shelter. See how adoption works, step by step.' },
        ].map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="block h-full rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-[var(--shadow-card)] transition hover:border-primary">
              <h2 className="text-xl font-extrabold">{item.title}</h2>
              <p className="mt-2 text-muted">{item.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
