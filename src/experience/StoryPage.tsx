/**
 * StoryPage (route "/") — Biscuit's scroll story + the landing end panel.
 *
 * Immersive mode: one fixed, aria-hidden R3F canvas (lazy chunk) behind real HTML <section>s.
 * GSAP ScrollTrigger (driven by Lenis) writes ONE global timeline into `storyState.chapter`;
 * the scene reads it in useFrame, and the same timeline gates every HTML card via `data-beat`,
 * so a card appears because something happened in the scene (door open, pet landed, signpost).
 * Reduced motion or no WebGL → no canvas, no scrubbing: a static illustrated sequence of
 * chapter cards followed by the same end panel.
 */
import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, ChevronDown, PawPrint, Play } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLenis } from '@/app/SmoothScroll'
import { buttonClasses } from '@/components/ui/Button'
import { announce, hasWebGL, isLowPower, setMotionPreference, useMotionPreference, useReducedMotion } from '@/lib/a11y'
import { cn } from '@/lib/cn'
import { PETS } from '@/data/pets'
import { BEAT_CLASSES, CHAPTERS, HomeTitle, NIGHTS, Words, beat, type Chapter } from './chapters'
import { EndPanel } from './EndPanel'
import { BEATS, CHAPTER_VH, storyState } from './storyState'
import type { Tier } from './StoryScene'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const StoryScene = lazy(() => import('./StoryScene'))

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

const NIGHT_CARD = 'bg-night text-on-night ring-1 ring-white/10 [--color-focus:var(--color-sun)]'
const LIGHT_CARD = 'bg-surface text-ink'
const CARD_SHADOW = 'shadow-[0_4px_12px_rgb(34_27_46/0.08),0_12px_32px_rgb(34_27_46/0.10)]'

/** Fixed card slot: bottom sheet on phones, left column on wider screens (§6.3). */
const FIXED_SLOT =
  'fixed inset-x-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-20 md:inset-x-auto md:bottom-auto md:top-28 md:left-[max(2rem,calc((100vw-72rem)/2+1rem))] md:w-[min(28rem,40vw)]'

const HERO_ART = { emoji: '🌙🐶', label: 'Illustration: Biscuit, a tan dog, waiting alone in a kennel at night.', bg: 'bg-night' }

function detectTier(): Tier {
  if (isLowPower()) return 'low'
  if (window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024) return 'mid'
  return 'high'
}

export default function StoryPage() {
  const reduced = useReducedMotion()
  const [webgl] = useState(() => hasWebGL())
  const [failed, setFailed] = useState(false)
  const immersive = !reduced && webgl && !failed
  const tier = useMemo(detectTier, [])
  const lenis = useLenis()

  const [ready, setReady] = useState(false)
  const [slow, setSlow] = useState(false)
  const [active, setActive] = useState(true)
  const activeRef = useRef(true)
  const onReady = useCallback(() => setReady(true), [])

  const rootRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const id = window.setTimeout(() => setSlow(true), 10000)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    document.title = 'PawPath — Find a pet that fits your life'
  }, [])

  // Reset the shared timeline when leaving the page.
  useEffect(
    () => () => {
      storyState.chapter = 0
    },
    [],
  )

  const skipStory = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = startRef.current
    if (!el) return
    e.preventDefault()
    if (lenis) lenis.scrollTo(el, { immediate: true, force: true, offset: -110 })
    else el.scrollIntoView({ block: 'start' })
    el.focus({ preventScroll: true })
  }

  useGSAP(
    () => {
      if (!immersive) return
      ScrollTrigger.config({ ignoreMobileResize: true })
      const root = rootRef.current
      if (!root) return
      const sections = gsap.utils.toArray<HTMLElement>('.story-chapter')
      const end = root.querySelector<HTMLElement>('.end-panel')
      const beats = Array.from(root.querySelectorAll<HTMLElement>('[data-beat]')).map((el) => {
        const [s, e] = (el.dataset.beat ?? '0:').split(':')
        return { el, start: Number(s), end: e === '' ? Infinity : Number(e) }
      })
      const walkLine = root.querySelector<HTMLElement>('.walk-line')

      // 1 · One global timeline: each chapter section adds 0..1, the end panel adds the last 0..1.
      const triggers: ScrollTrigger[] = []
      const recompute = () => {
        let sum = 0
        for (const t of triggers) sum += t.progress
        storyState.chapter = sum
        // Scene-triggered HTML: show each card / item when its beat happens on the timeline.
        for (const b of beats) {
          const on = sum >= b.start && sum < b.end
          const v = on ? 'true' : 'false'
          if (b.el.dataset.shown !== v) b.el.dataset.shown = v
        }
        if (walkLine) walkLine.style.transform = `scaleX(${Math.min(1, Math.max(0, sum - 3))})`
      }
      sections.forEach((s, i) => {
        // The last chapter ends where the end panel starts to enter, so the timelines never overlap.
        const last = i === sections.length - 1
        triggers.push(
          ScrollTrigger.create({ trigger: s, start: 'top top', end: last ? 'bottom bottom' : 'bottom top', onUpdate: recompute, onRefresh: recompute }),
        )
      })
      if (end) {
        // "Your turn": everyone lines up while the end panel scrolls in.
        triggers.push(ScrollTrigger.create({ trigger: end, start: 'top bottom', end: 'top 35%', onUpdate: recompute, onRefresh: recompute }))
        // The solid panel covers the canvas → fade it and stop rendering entirely.
        ScrollTrigger.create({
          trigger: end,
          start: 'top 35%',
          end: 'top top',
          onUpdate: (self) => {
            if (layerRef.current) layerRef.current.style.opacity = String(1 - self.progress)
            const on = self.progress < 0.999
            if (on !== activeRef.current) {
              activeRef.current = on
              setActive(on)
            }
          },
        })
      }
      recompute()

      // 2 · Headline reveals (once; text stays visible when scrolling back).
      gsap.from('.hero-title .reveal-word', { yPercent: 40, opacity: 0, duration: 0.28, stagger: 0.03, ease: 'power3.out' })
      ScrollTrigger.refresh()
    },
    { scope: rootRef, dependencies: [immersive] },
  )

  const hero = <HeroCard nights={NIGHTS} count={PETS.length} onSkip={skipStory} immersive={immersive} />

  return (
    <div ref={rootRef} className="relative">
      <a
        href="#start"
        onClick={skipStory}
        className="sr-only-focusable fixed left-4 top-24 z-[60] rounded-xl bg-ink px-4 py-3 font-semibold text-white"
      >
        Skip the story
      </a>

      {immersive && (
        <div ref={layerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 bg-night">
          <div className={cn('absolute inset-0 transition-opacity duration-300', ready ? 'opacity-100' : 'opacity-0')}>
            <SceneBoundary onError={() => setFailed(true)}>
              <Suspense fallback={null}>
                <StoryScene tier={tier} active={active} onReady={onReady} />
              </Suspense>
            </SceneBoundary>
          </div>
        </div>
      )}
      {immersive && !ready && !slow && (
        <p
          aria-hidden="true"
          className="pointer-events-none fixed right-4 top-24 z-30 inline-flex items-center gap-2 rounded-full bg-night-2 px-4 py-2 text-sm font-semibold text-on-night md:top-auto md:bottom-6"
        >
          <PawPrint className="size-4 animate-pulse motion-reduce:animate-none" /> Waking Biscuit up…
        </p>
      )}

      {immersive ? (
        <div id="story" className="relative z-10">
          <section
            id="ch-waiting"
            aria-labelledby="ch-waiting-title"
            className="story-chapter relative"
            style={{ height: `${CHAPTER_VH[0]}svh` }}
          >
            <div className={cn(FIXED_SLOT, BEAT_CLASSES)} {...beat(true, 0, 0.93, true)}>
              <Card dark>{hero}</Card>
            </div>
            {/* Beat: the dog sniffs the empty bowl */}
            <p
              {...beat(true, BEATS.sniff[0], 0.93)}
              className={cn(
                'fixed right-4 top-24 z-20 max-w-[16rem] rounded-2xl bg-night-2 px-4 py-3 text-on-night shadow-lg md:right-8 md:top-auto md:bottom-10',
                BEAT_CLASSES,
              )}
            >
              <strong className="text-sun">{NIGHTS} nights.</strong> Same kennel, same empty bowl.
            </p>
          </section>
          {CHAPTERS.map((ch, i) => (
            <section
              key={ch.id}
              id={`ch-${ch.id}`}
              aria-labelledby={`ch-${ch.id}-title`}
              className="story-chapter relative"
              style={{ height: `${CHAPTER_VH[i + 1]}svh` }}
            >
              <div className={cn(FIXED_SLOT, BEAT_CLASSES)} {...beat(true, ch.show[0], ch.show[1])}>
                <ChapterCard ch={ch} immersive />
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div id="story" className="relative z-10">
          <StaticSection art={HERO_ART} first>
            <Card dark>
              {hero}
              {reduced && webgl && !failed && <MotionOptIn />}
            </Card>
          </StaticSection>
          {CHAPTERS.map((ch) => (
            <StaticSection key={ch.id} art={ch.art}>
              <ChapterCard ch={ch} immersive={false} />
            </StaticSection>
          ))}
        </div>
      )}

      <EndPanel ref={startRef} reduced={!immersive} />
    </div>
  )
}

/* ------------------------------------------------------------------ pieces */

/**
 * Shown on the still-pictures version when the device (or the visitor) asked for reduced motion.
 * Respects that choice by default, but lets people opt in to the animated story.
 */
function MotionOptIn() {
  const pref = useMotionPreference()
  const enable = () => {
    setMotionPreference('on')
    announce("Animations on. Scroll to play Biscuit's story.")
  }
  return (
    <div className="mt-5 rounded-2xl bg-night-2 p-4 ring-1 ring-white/10">
      <p className="text-sm text-on-night-muted">
        {pref === 'off'
          ? 'Animations are turned off, so Biscuit’s story is shown as still pictures.'
          : 'Your device asks for reduced motion, so Biscuit’s story is shown as still pictures.'}
      </p>
      <button
        type="button"
        onClick={enable}
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-sun px-5 font-bold text-ink transition hover:brightness-95"
      >
        <Play aria-hidden className="size-4" /> Play the animated story
      </button>
    </div>
  )
}

function StaticSection({ art, first, children }: { art: Chapter['art']; first?: boolean; children: ReactNode }) {
  return (
    <section className={cn('px-4 sm:px-6', first ? 'bg-night pt-28 pb-12' : 'py-12')}>
      <div className="mx-auto grid max-w-5xl items-center gap-6 md:grid-cols-[1fr_1.2fr]">
        <div
          role="img"
          aria-label={art.label}
          className={cn('grid aspect-[4/3] place-items-center rounded-3xl text-6xl shadow-card sm:text-7xl', art.bg)}
        >
          <span aria-hidden="true">{art.emoji}</span>
        </div>
        <div>{children}</div>
      </div>
    </section>
  )
}

function Card({ dark, className, children }: { dark?: boolean; className?: string; children: ReactNode }) {
  return <div className={cn('rounded-3xl p-5 sm:p-7', CARD_SHADOW, dark ? NIGHT_CARD : LIGHT_CARD, className)}>{children}</div>
}

function HeroCard({
  nights,
  count,
  onSkip,
  immersive,
}: {
  nights: number
  count: number
  onSkip: (e: MouseEvent<HTMLAnchorElement>) => void
  immersive: boolean
}) {
  return (
    <>
      <p className="text-sm font-semibold tracking-wide text-sun uppercase">Pet adoption for first-time adopters</p>
      <h1
        id="ch-waiting-title"
        className="hero-title mt-2 text-[clamp(2.1rem,1.6rem+2.6vw,4rem)] leading-[1.02] font-extrabold text-on-night"
      >
        <Words text="Find a pet that fits your life." />
      </h1>
      <p className="mt-3 text-lg text-on-night-muted">
        Meet Biscuit. He's waited <strong className="text-sun">{nights} nights</strong> for someone who's a good fit.
        <span className="hidden sm:inline"> Scroll to see the day he's hoping for, or jump straight to your match.</span>
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/match" className={buttonClasses({ size: 'lg', className: 'font-display shadow-[0_6px_16px_rgb(194_65_12/0.35)]' })}>
          Find my match
        </Link>
        <Link to="/pets" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
          Browse all {count} pets
        </Link>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <a
          href="#start"
          onClick={onSkip}
          className="inline-flex min-h-11 items-center gap-1 font-semibold text-on-night underline underline-offset-4"
        >
          Skip the story <ArrowDown aria-hidden className="size-4" />
        </a>
        {immersive && (
          <span aria-hidden="true" className="hidden items-center gap-1 text-sm text-on-night-muted sm:inline-flex">
            Scroll for Biscuit's story <ChevronDown className="size-4 animate-bounce motion-reduce:animate-none" />
          </span>
        )}
      </div>
    </>
  )
}

function ChapterCard({ ch, immersive }: { ch: Chapter; immersive: boolean }) {
  return (
    <Card dark={ch.dark}>
      <h2
        id={`ch-${ch.id}-title`}
        className={cn('text-[clamp(1.6rem,1.4rem+1.09vw,2.5rem)] leading-[1.1] font-extrabold', ch.dark ? 'text-on-night' : 'text-ink')}
      >
        {ch.id === 'home' ? <HomeTitle animate={immersive} /> : <Words text={ch.title} />}
      </h2>
      {ch.body({ immersive })}
    </Card>
  )
}
