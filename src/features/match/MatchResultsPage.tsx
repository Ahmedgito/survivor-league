/**
 * /match/results?home=…&time=…&energy=…&kids=… — ranked Lifestyle Match results.
 * Answers come from the URL (shareable, back-button safe). FICTIONAL pets only.
 */
import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Pencil, Sparkles, TriangleAlert, Trophy } from 'lucide-react'
import { buttonClasses } from '@/components/ui/Button'
import CountUp from '@/components/reactbits/CountUp'
import { PetCard } from '@/features/pets/PetCard'
import { announce, useReducedMotion } from '@/lib/a11y'
import { cn } from '@/lib/cn'
import { answersToSearch, fitBand, saveLastAnswers, scorePets, searchToAnswers, summarizeAnswers } from './matching'

const TOP = 3

export default function MatchResultsPage() {
  const [params] = useSearchParams()
  const answers = useMemo(() => searchToAnswers(params), [params])
  const results = useMemo(() => (answers ? scorePets(answers) : []), [answers])
  const reduced = useReducedMotion()

  useEffect(() => {
    document.title = answers ? 'Your top matches · PawPath' : 'Take the quiz · PawPath'
    if (!answers) return
    saveLastAnswers(answers)
    const best = results[0]
    announce(
      `Showing your top ${Math.min(TOP, results.length)} matches out of ${results.length} pets. Best match: ${best.pet.name}, ${best.score}% match.`,
    )
  }, [answers, results])

  if (!answers) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 pt-28 pb-24 text-center" aria-labelledby="results-title">
        <p aria-hidden="true" className="text-6xl">
          🐾
        </p>
        <h1 id="results-title" tabIndex={-1} className="mt-4 font-display text-4xl font-extrabold text-ink">
          Let’s find your match first
        </h1>
        <p className="mt-3 text-lg text-muted">
          We need your answers to rank the pets. It’s 4 quick questions — about 30 seconds.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/match" className={buttonClasses({ size: 'lg' })}>
            Take the quiz <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
          <Link to="/pets" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
            Browse all pets
          </Link>
        </div>
      </section>
    )
  }

  const top = results.slice(0, TOP)
  const rest = results.slice(TOP)
  const editHref = `/match?${answersToSearch(answers)}`

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pt-28 pb-24" aria-labelledby="results-title">
      <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-accent-strong">
        <Sparkles className="size-4" aria-hidden="true" /> Lifestyle Match
      </p>
      <h1 id="results-title" tabIndex={-1} className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
        Your top matches
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-lg text-muted">
          <span className="sr-only">Your answers: </span>
          {summarizeAnswers(answers)}
        </p>
        <Link
          to={editHref}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full font-semibold text-primary underline underline-offset-4 outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          <Pencil className="size-4" aria-hidden="true" /> Edit answers
        </Link>
      </div>
      <p className="mt-2 text-base text-muted">
        We ranked all {results.length} pets on home, time alone, energy and who you live with. Each card says why it
        fits — and any honest heads-up.
      </p>

      <ol className="mt-10 grid gap-8 md:grid-cols-3" aria-label="Top 3 matches">
        {top.map((r, i) => {
          const best = i === 0
          return (
            <li
              key={r.pet.id}
              className={cn(
                'flex flex-col gap-4 rounded-[1.75rem] p-2',
                best && 'bg-primary-soft ring-2 ring-primary-strong md:-mt-4',
              )}
            >
              {best && (
                <p className="flex items-center gap-2 px-3 pt-2 font-display text-lg font-extrabold text-primary-strong">
                  <Trophy className="size-5" aria-hidden="true" /> Best match
                </p>
              )}
              <div className="relative">
                <PetCard pet={r.pet} matchScore={r.score} reasons={r.reasons} headingLevel="h2" />
              </div>
              <div className="flex flex-1 flex-col gap-3 px-3 pb-3">
                <p className="text-lg font-bold text-ink">
                  {best && !reduced ? (
                    <>
                      <span aria-hidden="true">
                        <CountUp to={r.score} duration={1.2} trigger="load" suffix="%" />
                      </span>
                      <span className="sr-only">{r.score}%</span>
                    </>
                  ) : (
                    `${r.score}%`
                  )}{' '}
                  · {fitBand(r.score)}
                </p>
                {r.headsUp ? (
                  <p className="flex items-start gap-2 text-base text-ink">
                    <TriangleAlert className="mt-0.5 size-5 shrink-0 text-primary-strong" aria-hidden="true" />
                    <span>
                      <strong className="font-semibold">Heads-up:</strong> {r.headsUp}
                    </span>
                  </p>
                ) : (
                  <p className="text-base text-muted">No heads-ups — a fit on every question.</p>
                )}
                <div className="mt-auto flex flex-col gap-2 pt-1">
                  {best ? (
                    <>
                      <Link to={`/adopt/${r.pet.id}`} className={buttonClasses({ size: 'lg', className: 'w-full' })}>
                        Ask to adopt {r.pet.name} <ArrowRight className="size-5" aria-hidden="true" />
                      </Link>
                      <Link
                        to={`/pets/${r.pet.id}`}
                        className={buttonClasses({ variant: 'ghost', className: 'w-full' })}
                      >
                        Meet {r.pet.name} first
                      </Link>
                    </>
                  ) : (
                    <Link to={`/pets/${r.pet.id}`} className={buttonClasses({ variant: 'secondary', className: 'w-full' })}>
                      Meet {r.pet.name}
                    </Link>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>

      {rest.length > 0 && (
        <section className="mt-16" aria-labelledby="rest-title">
          <h2 id="rest-title" className="font-display text-2xl font-extrabold text-ink sm:text-3xl">
            Everyone else, ranked for you
          </h2>
          <p className="mt-1 text-base text-muted">A lower score isn’t a no — it means a chat with the shelter first.</p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" start={TOP + 1}>
            {rest.map((r) => (
              <li key={r.pet.id}>
                <Link
                  to={`/pets/${r.pet.id}`}
                  className="flex min-h-16 items-center gap-3 rounded-2xl border-2 border-field-border bg-surface p-3 text-ink no-underline outline-none hover:bg-sand focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-12 shrink-0 place-items-center rounded-xl text-2xl"
                    style={{ backgroundColor: r.pet.cardColor }}
                  >
                    {r.pet.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">
                      {r.pet.name} <span className="font-normal text-muted">· {r.pet.breed}</span>
                    </span>
                    <span className="block text-sm text-muted">
                      {r.headsUp ? `Heads-up: ${r.headsUp}` : (r.reasons[0] ?? fitBand(r.score))}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-1 text-sm font-bold text-accent-strong">
                    {r.score}%<span className="sr-only"> match</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-12 flex flex-wrap gap-3">
        <Link to="/pets" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
          Browse all {results.length} pets
        </Link>
        <Link to={editHref} className={buttonClasses({ variant: 'ghost', size: 'lg' })}>
          Retake the quiz
        </Link>
      </div>
      <p className="mt-8 text-sm text-muted">
        How we score: home 30 · time alone 25 · energy 30 · who you live with 15. All pets and shelters are fictional
        demo data.
      </p>
    </section>
  )
}
