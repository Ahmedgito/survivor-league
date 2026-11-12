/**
 * /match — the Lifestyle Match quiz (signature feature).
 * 4 questions, one per step (Stepper). Each step is a real <fieldset>/<legend>.
 * Answers live in component state and are written to the URL on finish.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, AlertCircle, Sparkles } from 'lucide-react'
import Stepper, { Step } from '@/components/reactbits/Stepper'
import { Button } from '@/components/ui/Button'
import type { Energy, HomeType, TimeAtHome } from '@/data/types'
import { ChoiceCards } from './ChoiceCards'
import {
  ENERGY_OPTIONS,
  HOME_OPTIONS,
  HOUSEHOLD_OPTIONS,
  TIME_OPTIONS,
  answersToSearch,
  saveLastAnswers,
  type Household,
} from './matching'

const TOTAL = 4
const NONE = 'none'

interface Draft {
  home?: HomeType
  time?: TimeAtHome
  energy?: Energy
  /** undefined = not answered yet; [] = "None of these". */
  household?: Household[]
}

function draftFromSearch(s: URLSearchParams): Draft {
  const d: Draft = {}
  const home = s.get('home')
  const time = s.get('time')
  const energy = s.get('energy')
  const kids = s.get('kids')
  if (HOME_OPTIONS.some((o) => o.value === home)) d.home = home as HomeType
  if (TIME_OPTIONS.some((o) => o.value === time)) d.time = time as TimeAtHome
  if (ENERGY_OPTIONS.some((o) => o.value === energy)) d.energy = energy as Energy
  if (kids === NONE) d.household = []
  else if (kids) {
    const list = kids.split(',').filter((k): k is Household => HOUSEHOLD_OPTIONS.some((o) => o.value === k))
    if (list.length) d.household = list
  }
  return d
}

const QUESTIONS = [
  { title: 'Home', legend: 'Where do you live?', help: 'Some pets need room to run. Others are happy in a flat.' },
  {
    title: 'Time',
    legend: 'On a normal day, how long is no one home?',
    help: 'Be honest — this is the #1 reason first pets get returned.',
  },
  { title: 'Pace', legend: 'What’s your pace?', help: 'Pick the energy you actually want to live with.' },
  { title: 'Household', legend: 'Who else lives with you?', help: 'Choose all that apply.' },
] as const

export default function MatchPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<Draft>(() => draftFromSearch(params))
  const [step, setStep] = useState(1)
  const [showError, setShowError] = useState(false)
  const legendRefs = useRef<(HTMLLegendElement | null)[]>([])
  // Last step we moved focus for. (A "firstRender" boolean broke under React StrictMode: the
  // effect runs twice on mount, so the 2nd run stole focus to Q1 on page load.)
  const focusedStep = useRef(step)

  useEffect(() => {
    document.title = 'Find your match · PawPath'
  }, [])

  // Move focus to the new question's legend whenever the step changes (not on first load).
  useEffect(() => {
    if (focusedStep.current === step) return
    focusedStep.current = step
    const id = window.setTimeout(() => { const el = legendRefs.current[step - 1]; el?.focus({ preventScroll: true }); document.getElementById('quiz-progress')?.scrollIntoView({ block: 'start' }) }, 30)
    return () => window.clearTimeout(id)
  }, [step])

  const answered = (n: number) =>
    n === 1 ? !!draft.home : n === 2 ? !!draft.time : n === 3 ? !!draft.energy : draft.household !== undefined
  const current = Math.min(step, TOTAL)
  const isAnswered = answered(current)
  const isLast = current === TOTAL

  const goTo = (n: number) => {
    setShowError(false)
    setStep(n)
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!isAnswered) {
      setShowError(true)
      document.getElementById(`q${current}-first`)?.focus()
      return
    }
    if (!isLast) {
      goTo(current + 1)
      return
    }
    const answers = {
      home: draft.home!,
      time: draft.time!,
      energy: draft.energy!,
      household: draft.household ?? [],
    }
    saveLastAnswers(answers)
    navigate(`/match/results?${answersToSearch(answers)}`)
  }

  const toggleHousehold = (value: string) => {
    setShowError(false)
    setDraft((d) => {
      if (value === NONE) return { ...d, household: [] }
      const list = d.household ?? []
      const v = value as Household
      const next = list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
      // Un-ticking the last member leaves the question unanswered again.
      return { ...d, household: next.length ? next : undefined }
    })
  }

  const errorId = `q${current}-error`
  const hintId = `q${current}-hint`
  const describedBy = [`q${current}-help`, !isAnswered && (showError ? errorId : hintId)].filter(Boolean).join(' ')

  const legend = (n: number) => (
    <legend
      ref={(el) => {
        legendRefs.current[n - 1] = el
      }}
      tabIndex={-1}
      className="mb-1 scroll-mt-28 font-display text-2xl font-extrabold leading-tight text-ink outline-none focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus sm:text-3xl"
    >
      <span className="sr-only">
        Question {n} of {TOTAL}:{' '}
      </span>
      {QUESTIONS[n - 1].legend}
    </legend>
  )
  const help = (n: number) => (
    <p id={`q${n}-help`} className="mb-4 text-base text-muted">
      {QUESTIONS[n - 1].help}
    </p>
  )

  const householdSelected = draft.household === undefined ? [] : draft.household.length ? draft.household : [NONE]

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pt-28 pb-24" aria-labelledby="match-title">
      <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-accent-strong">
        <Sparkles className="size-4" aria-hidden="true" /> Lifestyle Match
      </p>
      <h1 id="match-title" tabIndex={-1} className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
        Find your match
      </h1>
      <p className="mt-3 text-lg text-muted">
        Four quick questions about your real life. We’ll rank every pet by how well they’d fit — and tell you honestly
        if there’s a catch. Takes about 30 seconds.
      </p>

      {/* Progress: the text is the accessible version, the bar is decorative. */}
      <div id="quiz-progress" className="mt-8 scroll-mt-28">
        <p className="text-base font-semibold text-ink" aria-hidden="true">
          Question {current} of {TOTAL}
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-sand" aria-hidden="true">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${(current / TOTAL) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6">
        <Stepper
          step={current}
          onStepChange={goTo}
          linear
          showFooter={false}
          width="100%"
          frame
          className="w-full"
          aria-label="Lifestyle Match questions"
        >
          <Step title="Home">
            <fieldset aria-describedby={current === 1 ? describedBy : undefined}>
              {legend(1)}
              {help(1)}
              <ChoiceCards
                type="radio"
                name="home"
                firstInputId="q1-first"
                options={HOME_OPTIONS}
                selected={draft.home ? [draft.home] : []}
                invalid={showError && current === 1 && !isAnswered}
                onToggle={(v) => {
                  setShowError(false)
                  setDraft((d) => ({ ...d, home: v as HomeType }))
                }}
              />
            </fieldset>
          </Step>
          <Step title="Time">
            <fieldset aria-describedby={current === 2 ? describedBy : undefined}>
              {legend(2)}
              {help(2)}
              <ChoiceCards
                type="radio"
                name="time"
                firstInputId="q2-first"
                options={TIME_OPTIONS}
                selected={draft.time ? [draft.time] : []}
                invalid={showError && current === 2 && !isAnswered}
                onToggle={(v) => {
                  setShowError(false)
                  setDraft((d) => ({ ...d, time: v as TimeAtHome }))
                }}
              />
            </fieldset>
          </Step>
          <Step title="Pace">
            <fieldset aria-describedby={current === 3 ? describedBy : undefined}>
              {legend(3)}
              {help(3)}
              <ChoiceCards
                type="radio"
                name="energy"
                firstInputId="q3-first"
                options={ENERGY_OPTIONS}
                selected={draft.energy ? [draft.energy] : []}
                invalid={showError && current === 3 && !isAnswered}
                onToggle={(v) => {
                  setShowError(false)
                  setDraft((d) => ({ ...d, energy: v as Energy }))
                }}
              />
            </fieldset>
          </Step>
          <Step title="Household">
            <fieldset aria-describedby={current === 4 ? describedBy : undefined}>
              {legend(4)}
              {help(4)}
              <ChoiceCards
                type="checkbox"
                name="household"
                firstInputId="q4-first"
                options={[...HOUSEHOLD_OPTIONS, { value: NONE, label: 'None of these', icon: '🙋' }]}
                selected={householdSelected}
                invalid={showError && current === 4 && !isAnswered}
                onToggle={toggleHousehold}
              />
            </fieldset>
          </Step>
        </Stepper>

        <div className="mt-4 min-h-6" aria-live="polite">
          {showError && !isAnswered ? (
            <p id={errorId} role="alert" className="flex items-center gap-2 font-semibold text-error">
              <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
              Pick one option to continue.
            </p>
          ) : !isAnswered ? (
            <p id={hintId} className="text-sm text-muted">
              Choose an answer above to unlock {isLast ? 'your matches' : 'the next question'}.
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {current > 1 ? (
            <Button type="button" variant="secondary" onClick={() => goTo(current - 1)} leadingIcon={<ArrowLeft className="size-5" aria-hidden="true" />}>
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button
            type="submit"
            size="lg"
            aria-disabled={!isAnswered || undefined}
            aria-describedby={!isAnswered ? (showError ? errorId : hintId) : undefined}
            trailingIcon={<ArrowRight className="size-5" aria-hidden="true" />}
          >
            {isLast ? 'See my matches' : 'Next'}
          </Button>
        </div>
      </form>

      <p className="mt-8 text-sm text-muted">
        All pets and shelters on PawPath are fictional demo data. Your answers stay in this browser.
      </p>
    </section>
  )
}
