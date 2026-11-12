import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import CountUp from '@/components/reactbits/CountUp'
import { PETS } from '@/data/pets'
import { cn } from '@/lib/cn'
import { BEATS } from './storyState'

const biscuit = PETS.find((p) => p.id === 'biscuit')
/** Nights Biscuit has waited (read from his fictional story text so the copy never disagrees). */
export const NIGHTS = Number(biscuit?.story.match(/(\d+) nights/)?.[1] ?? 214)

/** Classes for an element that appears when its scene beat happens (immersive mode only). */
export const BEAT_CLASSES =
  'transition-[opacity,transform] duration-300 ease-out data-[shown=false]:pointer-events-none data-[shown=false]:translate-y-3 data-[shown=false]:opacity-0 focus-within:translate-y-0! focus-within:opacity-100!'

/** data-beat="start:end" on the global story timeline. Empty in the static story. */
export function beat(on: boolean, start: number, end?: number, initiallyShown = false) {
  if (!on) return {}
  return { 'data-beat': `${start}:${end ?? ''}`, 'data-shown': String(initiallyShown) }
}

/** Splits a heading into word spans for the reveal, keeping the full text for screen readers. */
export function Words({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i}>
            <span className="reveal-word inline-block">{w}</span>
            {i < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </>
  )
}

export interface Chapter {
  id: string
  dark: boolean
  title: string
  /** When the card appears / leaves on the global timeline (the scene beat that causes it). */
  show: [number, number]
  /** Illustration for the static (reduced motion / no WebGL) version. */
  art: { emoji: string; label: string; bg: string }
  body: (opts: { immersive: boolean }) => ReactNode
}

const PARADE_TAGS = [
  { name: 'Pumpkin', kind: 'cat', tag: 'Chill' },
  { name: 'Oreo', kind: 'rabbit', tag: 'Apartment-friendly' },
  { name: 'Mochi', kind: 'shiba', tag: 'Zoomies' },
  { name: 'Storm', kind: 'husky', tag: 'Loves kids' },
]

const STEPS = ['Send an inquiry', 'Meet at the shelter', 'Bring them home']

export const CHAPTERS: Chapter[] = [
  {
    id: 'noticed',
    dark: true,
    title: 'Then, one afternoon, someone noticed.',
    show: [BEATS.doorOpen, 1.98],
    art: { emoji: '🚪🐶', label: 'Illustration: a warm light spills through an open door as Biscuit jumps up.', bg: 'bg-night-2' },
    body: () => (
      <p className="mt-3 text-lg text-on-night-muted">
        The door swings open. Someone walks past every kennel slowly, like they're actually reading the cards. Biscuit is
        up before they reach him.
      </p>
    ),
  },
  {
    id: 'fit',
    dark: false,
    title: 'Not the cutest. The right fit.',
    show: [BEATS.fitCard, 2.97],
    art: { emoji: '🐱🐰🐕🐺', label: 'Illustration: a cat, a rabbit, a shiba and a husky line up next to Biscuit.', bg: 'bg-primary-soft' },
    body: ({ immersive }) => (
      <>
        <p className="mt-3 text-lg text-muted">Every pet here wants a different life:</p>
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Pets in the parade and what they need">
          {PARADE_TAGS.map((p, i) => (
            <li
              key={p.name}
              {...beat(immersive, BEATS.parade[i] + BEATS.paradeLen)}
              className={cn(
                'inline-flex min-h-9 items-center gap-1.5 rounded-full bg-accent-soft px-3 text-sm font-semibold text-accent-strong',
                BEAT_CLASSES,
              )}
            >
              <Check aria-hidden className="size-4" /> {p.name} the {p.kind} · {p.tag}
            </li>
          ))}
        </ul>
        <p {...beat(immersive, BEATS.fitPunch)} className={cn('mt-4 text-lg font-semibold text-ink', BEAT_CLASSES)}>
          The right pet depends on <em>your</em> life. That's exactly what our{' '}
          <Link to="/match" className="text-primary underline underline-offset-4">
            match quiz
          </Link>{' '}
          checks.
        </p>
      </>
    ),
  },
  {
    id: 'walk',
    dark: false,
    title: 'One inquiry. One visit. One very long walk home.',
    show: [BEATS.walkCard, 3.97],
    art: { emoji: '🌳🐕🌳', label: 'Illustration: Biscuit walks home along a tree-lined path past three signposts.', bg: 'bg-tint-bird' },
    body: ({ immersive }) => (
      <div className="mt-4">
        <ol className="grid gap-2">
          {STEPS.map((s, i) => (
            <li
              key={s}
              {...beat(immersive, BEATS.signs[i])}
              className={cn('flex items-center gap-2 rounded-2xl bg-tint-dog px-3 py-2 font-semibold text-ink', BEAT_CLASSES)}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-sm text-white">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        {immersive && (
          <>
            <div aria-hidden="true" className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="walk-line h-full origin-left rounded-full bg-primary" style={{ transform: 'scaleX(0)' }} />
            </div>
            <p className="mt-2 text-sm text-muted">Scroll to walk. Scroll back and he turns around.</p>
          </>
        )}
      </div>
    ),
  },
  {
    id: 'home',
    dark: false,
    title: 'home.',
    show: [BEATS.homeCard, 5],
    art: { emoji: '🏡🦴🐶', label: 'Illustration: Biscuit eats from a full bowl on a rug at home, next to a bone.', bg: 'bg-tint-dog' },
    body: () => (
      <p className="mt-3 text-lg text-muted">A bowl with his name on it. A rug that's his. Someone who chose him on purpose.</p>
    ),
  },
]

/** "Night 215: home." with a count-up from the nights waited (static under reduced motion). */
export function HomeTitle({ animate }: { animate: boolean }) {
  const label = `Night ${NIGHTS + 1}: home.`
  return (
    <>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">
        Night{' '}
        {animate ? <CountUp from={NIGHTS} to={NIGHTS + 1} duration={1} className="tabular-nums" /> : NIGHTS + 1}: home.
      </span>
    </>
  )
}
