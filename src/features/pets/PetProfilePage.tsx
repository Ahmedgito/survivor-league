import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  Cat,
  Check,
  Dog,
  Home,
  Mail,
  MapPin,
  Pause,
  Phone,
  Play,
  RotateCcw,
  RotateCw,
  Sparkles,
  X,
} from 'lucide-react'
import { buttonClasses } from '@/components/ui/Button'
import { PETS, getPet, getShelter } from '@/data/pets'
import type { Pet } from '@/data/types'
import { hasWebGL, useReducedMotion } from '@/lib/a11y'
import { cn } from '@/lib/cn'
import { PetCard } from './PetCard'
import { PetVisual } from './PetVisual'
import { SaveHeart } from './SaveHeart'
import {
  COMPANY_LABEL,
  ENERGY_HINT,
  ENERGY_LABEL,
  HOME_LABEL,
  SEX_LABEL,
  SIZE_LABEL,
  formatFee,
  pronoun,
  visualDescription,
} from './petLabels'

const PetTurntable = lazy(() => import('./PetTurntable'))

/** Pets most like this one: same species first, then same energy, then size. */
function similarPets(pet: Pet, n = 3): Pet[] {
  return PETS.filter((p) => p.id !== pet.id)
    .map((p) => ({
      p,
      score: (p.species === pet.species ? 4 : 0) + (p.energy === pet.energy ? 2 : 0) + (p.size === pet.size ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.p)
}

export default function PetProfilePage() {
  const { id } = useParams()
  const pet = getPet(id)

  useEffect(() => {
    document.title = pet ? `${pet.name} · PawPath` : 'Pet not found · PawPath'
  }, [pet])

  if (!pet) return <PetNotFound />
  return <Profile key={pet.id} pet={pet} />
}

function Profile({ pet }: { pet: Pet }) {
  const location = useLocation()
  const shelter = getShelter(pet.shelterId)
  const backSearch = (location.state as { from?: string } | null)?.from ?? ''

  const similar = similarPets(pet)

  return (
    <article className="mx-auto max-w-6xl px-4 pb-24 pt-28">
      <Link
        to={`/pets${backSearch}`}
        className="inline-flex min-h-11 items-center gap-2 rounded-full font-semibold text-ink underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden="true" className="size-5" />
        All pets
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        {/* ---- Visual ---- */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Turntable pet={pet} />
        </div>

        {/* ---- Details ---- */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--color-primary-strong)]">
            Waiting for a home
          </p>
          <h1 className="mt-1 text-5xl font-extrabold sm:text-6xl">{pet.name}</h1>
          <p className="mt-3 text-lg text-muted">
            {pet.breed} · {pet.ageLabel} · {SEX_LABEL[pet.sex]} · {SIZE_LABEL[pet.size]}
          </p>

          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Personality">
            {pet.traits.map((t) => (
              <li key={t} className="rounded-full bg-[var(--color-sand)] px-4 py-1.5 font-semibold text-ink">
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to={`/adopt/${pet.id}`} className={buttonClasses({ size: 'lg' })}>
              Ask to adopt {pet.name}
              <ArrowRight aria-hidden="true" className="size-5" />
            </Link>
            <SaveHeart pet={pet} variant="labelled" />
          </div>

          <section className="mt-10" aria-labelledby="story-h">
            <h2 id="story-h" className="text-2xl font-extrabold">
              {pet.name}'s story
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-ink">{pet.story}</p>
          </section>

          <section className="mt-8" aria-labelledby="goodwith-h">
            <h2 id="goodwith-h" className="text-2xl font-extrabold">
              Good with
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {(
                [
                  ['kids', 'Kids', Baby],
                  ['dogs', 'Dogs', Dog],
                  ['cats', 'Cats', Cat],
                ] as const
              ).map(([key, label, Icon]) => {
                const ok = pet.goodWith[key]
                return (
                  <li
                    key={key}
                    className={cn(
                      'flex items-center gap-2 rounded-2xl px-4 py-3 font-semibold',
                      ok ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]' : 'bg-[var(--color-sand)] text-muted',
                    )}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    {ok ? (
                      <Check aria-hidden="true" className="size-4" strokeWidth={3} />
                    ) : (
                      <X aria-hidden="true" className="size-4" strokeWidth={3} />
                    )}
                    <span>{ok ? label : `${label} — not yet`}</span>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="mt-8" aria-labelledby="daily-h">
            <h2 id="daily-h" className="text-2xl font-extrabold">
              Daily life
            </h2>
            <dl className="mt-3 grid gap-3 text-ink">
              <div>
                <dt className="font-bold">Energy: {ENERGY_LABEL[pet.energy]}</dt>
                <dd className="text-muted">
                  {pet.species === 'fish' && pet.energy === 'chill' ? 'Happy gliding around a calm, planted tank' : ENERGY_HINT[pet.energy]}
                </dd>
              </div>
              <div>
                <dt className="font-bold">Company</dt>
                <dd className="text-muted">{COMPANY_LABEL[pet.needsCompany]}</dd>
              </div>
              <div>
                <dt className="font-bold">Best home</dt>
                <dd>
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {pet.bestHome.map((h) => (
                      <li
                        key={h}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-line)] bg-white px-3 py-1 text-sm font-semibold"
                      >
                        <Home aria-hidden="true" className="size-4" />
                        {HOME_LABEL[h]}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </section>

          <section
            className="mt-8 rounded-3xl bg-white p-6 shadow-[var(--shadow-card)]"
            aria-labelledby="adoption-h"
          >
            <h2 id="adoption-h" className="text-2xl font-extrabold">
              Adoption details
            </h2>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
              <dt className="font-semibold text-muted">Adoption fee</dt>
              <dd className="font-bold text-ink">
                {formatFee(pet.fee)} <span className="font-normal text-muted">(fictional)</span>
              </dd>
              {/* Vet checks only make sense for mammals (no "neutered: not yet" for a goldfish). */}
              {pet.species !== 'fish' && pet.species !== 'bird' && (
                <>
                  <dt className="font-semibold text-muted">Vaccinated</dt>
                  <dd className="text-ink">{pet.vaccinated ? 'Yes' : 'Not yet'}</dd>
                  <dt className="font-semibold text-muted">Neutered / spayed</dt>
                  <dd className="text-ink">{pet.neutered ? 'Yes' : 'Not yet'}</dd>
                </>
              )}
            </dl>
            <p className="mt-3 text-sm text-muted">
              The fee is paid at the shelter during your visit. PawPath never takes payments.
            </p>

            <h3 className="mt-6 text-lg font-extrabold">{shelter.name}</h3>
            <p className="text-sm text-muted">Sample shelter for this demo (fictional)</p>
            <ul className="mt-3 space-y-2 text-ink">
              <li className="flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted" />
                <span>
                  <span className="sr-only">Area: </span>
                  {shelter.area} (fictional)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted" />
                <span>
                  <span className="sr-only">Phone: </span>
                  {shelter.phone} (fictional)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted" />
                <span className="break-all">
                  <span className="sr-only">Email: </span>
                  {shelter.email} (fictional)
                </span>
              </li>
            </ul>

            <Link to={`/adopt/${pet.id}`} className={cn(buttonClasses(), 'mt-6 w-full sm:w-auto')}>
              Ask to adopt {pet.name}
              <ArrowRight aria-hidden="true" className="size-5" />
            </Link>
          </section>

          <p className="mt-6 flex items-start gap-2 text-muted">
            <Sparkles aria-hidden="true" className="mt-1 size-5 shrink-0 text-[var(--color-primary)]" />
            <span>
              Wondering if {pet.name} fits your life?{' '}
              <Link to="/match" className="font-semibold text-[var(--color-primary-strong)] underline underline-offset-4">
                Take the 1-minute match quiz
              </Link>
              {' '}to see which pets fit your home and schedule best.
            </span>
          </p>
        </div>
      </div>

      <section className="mt-16" aria-labelledby="similar-h">
        <h2 id="similar-h" className="text-3xl font-extrabold">
          You might also like
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {similar.map((p) => (
            <li key={p.id}>
              <PetCard pet={p} headingLevel="h3" />
            </li>
          ))}
        </ul>
      </section>

    </article>
  )
}

/* ---------- 3D turntable with accessible controls + static fallback ---------- */

function Turntable({ pet }: { pet: Pet }) {
  const reduced = useReducedMotion()
  const [webgl] = useState(() => hasWebGL())
  const [spinning, setSpinning] = useState(true)
  const [turn, setTurn] = useState({ id: 0, delta: 0 })
  const live = webgl && !reduced
  const description = `3D model of ${visualDescription(pet)}.`
  const fallback = <PetVisual pet={pet} size="lg" className="absolute inset-0" />

  return (
    <figure className="m-0">
      <div
        className="relative aspect-square w-full overflow-hidden rounded-[2rem] shadow-[var(--shadow-card)]"
        style={{ backgroundColor: pet.cardColor }}
      >
        {live ? (
          <>
            <div aria-hidden="true" className="absolute inset-0">
              <svg viewBox="0 0 200 200" className="absolute inset-x-[12%] bottom-[8%] w-[76%] opacity-60">
                <ellipse cx="100" cy="150" rx="90" ry="26" fill={pet.tint} fillOpacity={0.25} />
              </svg>
            </div>
            <ThreeErrorBoundary fallback={fallback}>
              <Suspense fallback={fallback}>
                <div className="absolute inset-0">
                  <PetTurntable pet={pet} spinning={spinning} turnRequest={turn} />
                </div>
              </Suspense>
            </ThreeErrorBoundary>
          </>
        ) : (
          fallback
        )}
      </div>
      <figcaption className="mt-3 text-sm text-muted">
        {live
          ? `${description} Use the buttons to turn ${pronoun(pet)}. Low-poly model: CC0, Quaternius.`
          : `Illustration of ${visualDescription(pet)}.`}
      </figcaption>
      {live && (
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="3D model controls">
          <button
            type="button"
            onClick={() => setTurn((t) => ({ id: t.id + 1, delta: -Math.PI / 4 }))}
            className={buttonClasses({ variant: 'secondary' })}
          >
            <RotateCcw aria-hidden="true" className="size-5" />
            Rotate left
          </button>
          <button
            type="button"
            onClick={() => setTurn((t) => ({ id: t.id + 1, delta: Math.PI / 4 }))}
            className={buttonClasses({ variant: 'secondary' })}
          >
            <RotateCw aria-hidden="true" className="size-5" />
            Rotate right
          </button>
          <button
            type="button"
            onClick={() => setSpinning((s) => !s)}
            className={buttonClasses({ variant: 'secondary' })}
          >
            {spinning ? <Pause aria-hidden="true" className="size-5" /> : <Play aria-hidden="true" className="size-5" />}
            {spinning ? 'Pause turning' : 'Resume turning'}
          </button>
        </div>
      )}
    </figure>
  )
}

class ThreeErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/* ---------- not found ---------- */

function PetNotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 pb-24 pt-28 text-center">
      <p aria-hidden="true" className="text-7xl">
        🐾
      </p>
      <h1 className="mt-4 text-4xl font-extrabold">We couldn't find that pet</h1>
      <p className="mt-3 text-lg text-muted">
        Maybe they've already found a home, or the link has a typo. There are plenty of friends still waiting.
      </p>
      <Link to="/pets" className={cn(buttonClasses({ size: 'lg' }), 'mt-8')}>
        Browse pets
      </Link>
    </section>
  )
}
