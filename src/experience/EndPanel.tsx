import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Bird, Cat, Dog, Fish, Rabbit, Sparkles } from 'lucide-react'
import { buttonClasses } from '@/components/ui/Button'
import CountUp from '@/components/reactbits/CountUp'
import { PETS } from '@/data/pets'
import type { Species } from '@/data/types'

const SPECIES: { key: Species; label: string; Icon: typeof Dog; tint: string }[] = [
  { key: 'dog', label: 'Dogs', Icon: Dog, tint: 'bg-tint-dog' },
  { key: 'cat', label: 'Cats', Icon: Cat, tint: 'bg-tint-cat' },
  { key: 'rabbit', label: 'Rabbits', Icon: Rabbit, tint: 'bg-tint-rabbit' },
  { key: 'fish', label: 'Fish', Icon: Fish, tint: 'bg-tint-fish' },
  { key: 'bird', label: 'Birds', Icon: Bird, tint: 'bg-tint-bird' },
]

const STEPS = [
  { title: 'Take the match quiz.', text: '4 questions about your home, time and pace.' },
  { title: 'Save the pets you like.', text: 'Your shortlist stays in this browser.' },
  { title: 'Send an inquiry.', text: "It's free and needs no account." },
  { title: 'Meet at the shelter.', text: 'Any adoption fee is paid there, never online.' },
]

const FAQS = [
  {
    q: "Can I adopt if I'm under 18?",
    a: 'Shelters need an adult (18+) to sign the adoption form. Bring a parent or guardian to the visit — you can still send the inquiry yourself.',
  },
  {
    q: 'What does the adoption fee cover?',
    a: "Vaccinations, a health check and, where listed, neutering. It's paid at the shelter, never on this site.",
  },
  {
    q: "What if it doesn't work out?",
    a: 'Every (fictional) shelter on PawPath takes pets back and helps find a better match. Talk to them first — no judgement.',
  },
]

const card = 'rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6'

export const EndPanel = forwardRef<HTMLHeadingElement, { reduced: boolean }>(function EndPanel({ reduced }, headingRef) {
  const count = PETS.length
  const bySpecies = (s: Species) => PETS.filter((p) => p.species === s).length

  return (
    <>
      <section
        aria-labelledby="start"
        className="end-panel relative z-10 bg-cream px-4 pt-16 pb-12 sm:px-6 sm:pt-24"
      >
        <div className="mx-auto max-w-6xl">
          <h2
            id="start"
            ref={headingRef}
            tabIndex={-1}
            className="max-w-3xl scroll-mt-28 text-[clamp(2.25rem,1.76rem+2.17vw,3.5rem)] font-extrabold"
          >
            <span className="sr-only">Your turn. {count} pets are still waiting.</span>
            <span aria-hidden="true">
              Your turn.{' '}
              <span className="text-primary">
                {reduced ? count : <CountUp from={0} to={count} duration={1.2} className="tabular-nums" />} pets
              </span>{' '}
              are still waiting.
            </span>
          </h2>
          <p className="mt-4 max-w-[60ch] text-lg text-muted">
            Answer 4 quick questions and we'll show who fits your life — and why. Every pet here is fictional demo data.
          </p>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {/* 1 · the dominant CTA */}
            <article className={`${card} flex flex-col border-2 border-primary`}>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary-strong">
                <Sparkles aria-hidden className="size-4" /> Lifestyle Match
              </p>
              <h3 className="mt-2 text-xl font-bold">Take the match quiz</h3>
              <p className="mt-2 text-muted">4 questions · about 2 minutes · see why each pet fits, plus one honest heads-up.</p>
              <div className="mt-auto pt-6">
                <Link to="/match" className={buttonClasses({ size: 'lg', className: 'w-full font-display shadow-[0_6px_16px_rgb(194_65_12/0.3)]' })}>
                  Find my match <ArrowRight aria-hidden className="size-5" />
                </Link>
              </div>
            </article>

            {/* 2 · browse by type */}
            <article className={card}>
              <h3 className="text-xl font-bold">Browse by type</h3>
              <ul className="mt-4 grid grid-cols-2 gap-2">
                {SPECIES.map(({ key, label, Icon, tint }) => (
                  <li key={key}>
                    <Link
                      to={`/pets?species=${key}`}
                      className={`flex min-h-12 items-center gap-2 rounded-2xl ${tint} px-3 py-2 font-semibold text-ink hover:ring-2 hover:ring-field-border`}
                    >
                      <Icon aria-hidden className="size-5 shrink-0" />
                      <span>
                        {label} <span className="font-normal text-muted">· {bySpecies(key)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/pets"
                    className="flex min-h-12 items-center gap-1 rounded-2xl border-2 border-field-border px-3 py-2 font-semibold text-ink"
                  >
                    All {count} <ArrowRight aria-hidden className="size-4" />
                  </Link>
                </li>
              </ul>
            </article>

            {/* 3 · how adoption works (short) */}
            <article className={card}>
              <h3 className="text-xl font-bold">How adoption works</h3>
              <ol className="mt-4 space-y-2">
                {STEPS.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="pt-0.5 font-medium">{s.title}</span>
                  </li>
                ))}
              </ol>
              <a href="#how-it-works" className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">
                Read the full steps
              </a>
            </article>
          </div>

          <p className="mt-8 text-lg">
            Or{' '}
            <Link to="/pets/biscuit" className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary underline underline-offset-4">
              meet Biscuit <ArrowRight aria-hidden className="size-4" />
            </Link>{' '}
            <span className="text-muted">— he's real in our demo, and still waiting.</span>
          </p>
        </div>
      </section>

      <section id="how-it-works" aria-labelledby="how-title" className="relative z-10 scroll-mt-24 bg-cream px-4 pb-20 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 border-t border-line pt-12 lg:grid-cols-2">
          <div>
            <h2 id="how-title" className="text-[clamp(1.875rem,1.63rem+1.09vw,2.5rem)] font-extrabold">
              How adoption works
            </h2>
            <p className="mt-3 max-w-[60ch] text-muted">
              New to this? Most people here are adopting their first pet. Here's the whole process — no surprises.
            </p>
            <ol className="mt-6 space-y-5 border-l-2 border-line pl-6">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[2.4rem] grid size-7 place-items-center rounded-full bg-primary text-sm font-bold text-white"
                  >
                    {i + 1}
                  </span>
                  <p className="font-display text-xl font-bold">{s.title}</p>
                  <p className="text-muted">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="text-2xl font-bold">Good questions</h3>
            <div className="mt-4 space-y-3">
              {FAQS.map((f) => (
                <details key={f.q} className="group rounded-2xl border border-field-border bg-surface p-4">
                  <summary className="cursor-pointer list-none font-semibold marker:hidden">
                    <span className="flex min-h-8 items-center justify-between gap-3">
                      {f.q}
                      <span aria-hidden className="text-xl transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-2 text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
})
