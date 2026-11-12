/**
 * /adopt/:petId — adoption inquiry form (demo). NOTHING is sent anywhere: the inquiry is saved
 * to this browser's localStorage only. All pets and shelters are FICTIONAL.
 *
 * Validation: on blur (per field) and on submit. Errors are inline, linked with aria-describedby
 * + aria-invalid; an error summary with links appears at the top; focus moves to the first invalid field.
 */
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowRight, Info, PartyPopper, ShieldCheck } from 'lucide-react'
import { Button, buttonClasses } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import ClickSpark, { type ClickSparkHandle } from '@/components/reactbits/ClickSpark'
import { getPet, getShelter } from '@/data/pets'
import type { HomeType, Pet } from '@/data/types'
import { PetVisual } from '@/features/pets/PetVisual'
import { announce, useReducedMotion } from '@/lib/a11y'
import { cn } from '@/lib/cn'
import { ChoiceCards } from '@/features/match/ChoiceCards'
import { HOME_OPTIONS, loadLastAnswers } from '@/features/match/matching'
import { saveInquiry, type Inquiry } from './inquiries'

type Field = 'fullName' | 'email' | 'phone' | 'ageGroup' | 'home' | 'hadPets' | 'message' | 'demoAck'

interface Values {
  fullName: string
  email: string
  phone: string
  ageGroup: '' | Inquiry['ageGroup']
  home: '' | HomeType
  hadPets: '' | 'yes' | 'no'
  message: string
  demoAck: boolean
}

const MAX_MESSAGE = 500
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const PHONE_RE = /^\+?[\d\s-]{7,20}$/

/** id of the element that receives focus for each field (first radio for radio groups). */
const FIELD_ID: Record<Field, string> = {
  fullName: 'adopt-name',
  email: 'adopt-email',
  phone: 'adopt-phone',
  ageGroup: 'adopt-age',
  home: 'adopt-home-first',
  hadPets: 'adopt-hadpets-first',
  message: 'adopt-message',
  demoAck: 'adopt-ack',
}
const FIELD_LABEL: Record<Field, string> = {
  fullName: 'Full name',
  email: 'Email',
  phone: 'Phone',
  ageGroup: 'Age group',
  home: 'Where you live',
  hadPets: 'Pets before',
  message: 'Message',
  demoAck: 'Demo confirmation',
}
const ORDER: Field[] = ['fullName', 'email', 'phone', 'ageGroup', 'home', 'hadPets', 'message', 'demoAck']

function validate(field: Field, v: Values): string | undefined {
  switch (field) {
    case 'fullName': {
      const n = v.fullName.trim()
      if (!n) return 'Enter your full name.'
      if (n.length < 2 || n.length > 60) return 'Use 2 to 60 characters.'
      return
    }
    case 'email': {
      const e = v.email.trim()
      if (!e) return 'Enter your email address.'
      if (!EMAIL_RE.test(e)) return 'Enter an email like name@example.com.'
      return
    }
    case 'phone': {
      const p = v.phone.trim()
      if (p && !PHONE_RE.test(p)) return 'Use digits, spaces or dashes only (like 0300 0000000) — or leave it blank.'
      return
    }
    case 'ageGroup':
      return v.ageGroup ? undefined : 'Choose your age group.'
    case 'home':
      return v.home ? undefined : 'Choose where you live.'
    case 'hadPets':
      return v.hadPets ? undefined : 'Tell us if you’ve had a pet before.'
    case 'message':
      return v.message.length > MAX_MESSAGE ? `Keep it under ${MAX_MESSAGE} characters.` : undefined
    case 'demoAck':
      return v.demoAck ? undefined : 'Tick this box to confirm you understand this is a demo.'
  }
}

const inputClass = (invalid: boolean) =>
  cn(
    'mt-2 block w-full rounded-xl border-2 bg-surface px-4 py-3 text-base text-ink',
    'outline-none focus:outline-3 focus:outline-offset-2 focus:outline-focus',
    invalid ? 'border-error' : 'border-field-border',
  )

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-base font-semibold text-error">
      <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  )
}

function Required() {
  return <span className="font-normal text-muted"> (required)</span>
}

export default function AdoptPage() {
  const { petId } = useParams()
  const pet = getPet(petId)

  useEffect(() => {
    document.title = pet ? `Ask to adopt ${pet.name} · PawPath` : 'Pet not found · PawPath'
  }, [pet])

  if (!pet) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 pt-28 pb-24 text-center" aria-labelledby="adopt-title">
        <p aria-hidden="true" className="text-6xl">
          🐾
        </p>
        <h1 id="adopt-title" tabIndex={-1} className="mt-4 font-display text-4xl font-extrabold text-ink">
          We couldn’t find that pet
        </h1>
        <p className="mt-3 text-lg text-muted">
          They may have found a home already — or the link has a typo. Plenty of others are still waiting.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/pets" className={buttonClasses({ size: 'lg' })}>
            Meet the pets <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
          <Link to="/match" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
            Find my match
          </Link>
        </div>
      </section>
    )
  }

  return <AdoptForm key={pet.id} pet={pet} />
}

function AdoptForm({ pet }: { pet: Pet }) {
  const shelter = getShelter(pet.shelterId)
  const { toast } = useToast()
  const reduced = useReducedMotion()
  const [values, setValues] = useState<Values>(() => ({
    fullName: '',
    email: '',
    phone: '',
    ageGroup: '',
    home: loadLastAnswers()?.home ?? '',
    hadPets: '',
    message: '',
    demoAck: false,
  }))
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [summary, setSummary] = useState<Field[]>([])
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [sent, setSent] = useState<Inquiry | null>(null)
  const successRef = useRef<HTMLHeadingElement>(null)
  const sparkRef = useRef<ClickSparkHandle>(null)
  const timer = useRef<number | undefined>(undefined)
  const sendingRef = useRef(false)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // Success: focus the heading, celebrate (unless reduced motion), toast.
  useEffect(() => {
    if (status !== 'sent' || !sent) return
    successRef.current?.focus()
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    toast({
      title: `Inquiry for ${pet.name} saved (demo)`,
      description: `Reference ${sent.reference}. Nothing was sent — it stays in this browser.`,
      tone: 'success',
    })
    if (reduced) return
    const ids = [0, 180, 360].map((ms, i) =>
      window.setTimeout(() => sparkRef.current?.spark(undefined, i === 1 ? 20 : 60), ms + 250),
    )
    return () => ids.forEach((id) => window.clearTimeout(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sent])

  // Latest values, so blur handlers never validate a stale render.
  const valuesRef = useRef(values)
  valuesRef.current = values

  const set = <K extends keyof Values>(field: K, value: Values[K]) => {
    const next = { ...valuesRef.current, [field]: value }
    valuesRef.current = next
    setValues(next)
    // Once an error is showing, clear it the moment the field becomes valid (or refresh its text).
    const msg = validate(field as Field, next)
    setErrors((e) => (e[field as Field] ? { ...e, [field]: msg } : e))
    if (!msg) setSummary((s) => s.filter((f) => f !== field))
  }

  const blur = (field: Field) => {
    const msg = validate(field, valuesRef.current)
    setErrors((e) => ({ ...e, [field]: msg }))
    if (!msg) setSummary((s) => s.filter((f) => f !== field))
  }

  const focusField = (field: Field) => {
    const el = document.getElementById(FIELD_ID[field])
    el?.focus()
    el?.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    // A ref (not state) guards against a fast double click before React re-renders.
    if (sendingRef.current) return
    const all: Partial<Record<Field, string>> = {}
    ORDER.forEach((f) => {
      const msg = validate(f, valuesRef.current)
      if (msg) all[f] = msg
    })
    const invalid = ORDER.filter((f) => all[f])
    setErrors(all)
    setSummary(invalid)
    if (invalid.length) {
      announce(`There ${invalid.length === 1 ? 'is 1 thing' : `are ${invalid.length} things`} to fix.`)
      window.setTimeout(() => focusField(invalid[0]), 0)
      return
    }
    sendingRef.current = true
    setStatus('sending')
    timer.current = window.setTimeout(() => {
      const inquiry = saveInquiry({
        petId: pet.id,
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || undefined,
        ageGroup: values.ageGroup as Inquiry['ageGroup'],
        home: values.home as HomeType,
        hadPets: values.hadPets as 'yes' | 'no',
        message: values.message.trim() || undefined,
      })
      setSent(inquiry)
      setStatus('sent')
    }, 800)
  }

  const describedBy = (field: Field, ...extra: (string | false | undefined)[]) =>
    [...extra, errors[field] && `${FIELD_ID[field]}-error`].filter(Boolean).join(' ') || undefined

  const header: ReactNode = (
    <div className="flex items-center gap-4 rounded-2xl border-2 border-field-border bg-surface p-3">
      <PetVisual pet={pet} className="size-16 shrink-0 rounded-xl [&_span]:!text-4xl [&_svg.lucide]:hidden" />
      <div className="min-w-0">
        <p className="font-display text-xl font-extrabold text-ink">{pet.name}</p>
        <p className="text-base text-muted">
          {pet.breed} · {pet.ageLabel}
        </p>
        <p className="text-sm text-muted">{shelter.name}</p>
      </div>
    </div>
  )

  /* ---------------- success state ---------------- */
  if (status === 'sent' && sent) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 pt-28 pb-24" aria-labelledby="sent-title">
        <ClickSpark
          ref={sparkRef}
          disabled={reduced}
          sparkColor={['#C2410C', '#0F766E', '#FFD27A']}
          sparkCount={14}
          sparkRadius={60}
          shape="star"
          className="!h-auto"
        >
          <div className="rounded-[1.75rem] border-2 border-success bg-surface p-6 sm:p-8">
            <p className="inline-flex items-center gap-2 font-semibold text-success">
              <PartyPopper className="size-5" aria-hidden="true" /> Demo inquiry saved
            </p>
            <h1
              id="sent-title"
              ref={successRef}
              tabIndex={-1}
              className="mt-2 font-display text-4xl font-extrabold leading-tight text-ink outline-none focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus"
            >
              Inquiry sent! <span aria-hidden="true">🎉</span>
            </h1>
            <p className="mt-3 text-lg text-ink">
              {shelter.name} usually replies within 2 days. Your reference is{' '}
              <strong className="whitespace-nowrap font-bold">{sent.reference}</strong>.
            </p>
          </div>
        </ClickSpark>

        <h2 className="mt-10 font-display text-2xl font-extrabold text-ink">What happens next</h2>
        <ol className="mt-4 space-y-4">
          {[
            `The shelter reviews your inquiry (1–2 days).`,
            `You visit for a meet-and-greet with ${pet.name}${sent.ageGroup === '16-17' ? ' — bring your parent or guardian' : ''}.`,
            `If it’s a match, you sign the adoption form, pay the fee at the shelter and take ${pet.name} home.`,
          ].map((text, i) => (
            <li key={i} className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-accent font-display font-extrabold text-white"
              >
                {i + 1}
              </span>
              <span className="pt-1.5 text-lg text-ink">{text}</span>
            </li>
          ))}
        </ol>

        <p className="mt-8 rounded-2xl bg-sand p-4 text-base text-ink">
          <strong>Demo:</strong> nothing actually left your browser. PawPath is a prototype with fictional pets and
          shelters, and {sent.reference} is a made-up reference.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/pets" className={buttonClasses({ size: 'lg' })}>
            Meet more pets <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
          <Link to={`/pets/${pet.id}`} className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
            Back to {pet.name}
          </Link>
        </div>
      </section>
    )
  }

  /* ---------------- form ---------------- */
  const sending = status === 'sending'
  const remaining = MAX_MESSAGE - values.message.length

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pt-28 pb-24" aria-labelledby="adopt-title">
      <h1 id="adopt-title" tabIndex={-1} className="font-display text-4xl font-extrabold leading-tight text-ink sm:text-5xl">
        Ask to adopt {pet.name}
      </h1>
      <div className="mt-5">{header}</div>
      <p className="mt-5 text-lg text-muted">
        Tell the shelter a little about you. Be real — they’re matching for life, not for likes.
      </p>
      <p className="mt-4 flex items-start gap-2 rounded-2xl border-2 border-accent bg-accent-soft p-4 text-base text-accent-strong">
        <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <span>
          <strong>Demo:</strong> nothing you type is sent anywhere. Use made-up details like you@example.com.
        </span>
      </p>

      {summary.length > 0 && (
        <div role="alert" className="mt-6 rounded-2xl border-2 border-error bg-surface p-4" aria-labelledby="summary-title">
          <h2 id="summary-title" className="flex items-center gap-2 text-lg font-bold text-error">
            <AlertCircle className="size-5" aria-hidden="true" />
            {summary.length === 1 ? 'There’s 1 thing to fix' : `There are ${summary.length} things to fix`}
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            {summary.map((f) => (
              <li key={f}>
                <a
                  href={`#${FIELD_ID[f]}`}
                  onClick={(e) => {
                    e.preventDefault()
                    focusField(f)
                  }}
                  className="font-semibold text-error underline underline-offset-4 outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  {FIELD_LABEL[f]}: {errors[f]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-7" aria-describedby="form-note">
        <p id="form-note" className="text-sm text-muted">
          Fields marked “(required)” must be filled in.
        </p>

        {/* Full name */}
        <div>
          <label htmlFor={FIELD_ID.fullName} className="block text-lg font-semibold text-ink">
            Full name
            <Required />
          </label>
          <input
            id={FIELD_ID.fullName}
            type="text"
            autoComplete="name"
            value={values.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            onBlur={() => blur('fullName')}
            aria-invalid={!!errors.fullName || undefined}
            aria-describedby={describedBy('fullName')}
            aria-required="true"
            className={inputClass(!!errors.fullName)}
          />
          <FieldError id={`${FIELD_ID.fullName}-error`} message={errors.fullName} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor={FIELD_ID.email} className="block text-lg font-semibold text-ink">
            Email
            <Required />
          </label>
          <p id="adopt-email-hint" className="mt-1 text-sm text-muted">
            The shelter replies here. For this demo, use a made-up one like you@example.com.
          </p>
          <input
            id={FIELD_ID.email}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            onBlur={() => blur('email')}
            aria-invalid={!!errors.email || undefined}
            aria-describedby={describedBy('email', 'adopt-email-hint')}
            aria-required="true"
            className={inputClass(!!errors.email)}
          />
          <FieldError id={`${FIELD_ID.email}-error`} message={errors.email} />
        </div>

        {/* Phone (optional) */}
        <div>
          <label htmlFor={FIELD_ID.phone} className="block text-lg font-semibold text-ink">
            Phone <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id={FIELD_ID.phone}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
            onBlur={() => blur('phone')}
            aria-invalid={!!errors.phone || undefined}
            aria-describedby={describedBy('phone')}
            className={inputClass(!!errors.phone)}
          />
          <FieldError id={`${FIELD_ID.phone}-error`} message={errors.phone} />
        </div>

        {/* Age group */}
        <div>
          <label htmlFor={FIELD_ID.ageGroup} className="block text-lg font-semibold text-ink">
            Age group
            <Required />
          </label>
          <select
            id={FIELD_ID.ageGroup}
            value={values.ageGroup}
            onChange={(e) => set('ageGroup', e.target.value as Values['ageGroup'])}
            onBlur={() => blur('ageGroup')}
            aria-invalid={!!errors.ageGroup || undefined}
            aria-describedby={describedBy('ageGroup', values.ageGroup === '16-17' && 'adopt-age-note')}
            aria-required="true"
            className={cn(inputClass(!!errors.ageGroup), 'min-h-12 appearance-auto')}
          >
            <option value="">Choose…</option>
            <option value="16-17">16–17 (a parent/guardian must co-sign)</option>
            <option value="18-24">18–24</option>
            <option value="25+">25+</option>
          </select>
          <FieldError id={`${FIELD_ID.ageGroup}-error`} message={errors.ageGroup} />
          {values.ageGroup === '16-17' && (
            <p id="adopt-age-note" className="mt-2 flex items-start gap-2 rounded-xl bg-primary-soft p-3 text-base text-ink">
              <Info className="mt-0.5 size-5 shrink-0 text-primary-strong" aria-hidden="true" />
              <span>
                You can still ask! A parent or guardian must co-sign the adoption form and come to the
                meet-and-greet.
              </span>
            </p>
          )}
        </div>

        {/* Home type */}
        <fieldset aria-describedby={describedBy('home')}>
          <legend className="text-lg font-semibold text-ink">
            Where do you live?
            <Required />
          </legend>
          <div className="mt-2">
            <ChoiceCards
              type="radio"
              name="adopt-home"
              firstInputId={FIELD_ID.home}
              size="md"
              options={HOME_OPTIONS.map(({ value, label, icon }) => ({ value, label, icon }))}
              selected={values.home ? [values.home] : []}
              invalid={!!errors.home}
              describedBy={errors.home ? `${FIELD_ID.home}-error` : undefined}
              onToggle={(v) => set('home', v as HomeType)}
              onBlur={() => blur('home')}
            />
          </div>
          <FieldError id={`${FIELD_ID.home}-error`} message={errors.home} />
        </fieldset>

        {/* Had pets before */}
        <fieldset aria-describedby={describedBy('hadPets')}>
          <legend className="text-lg font-semibold text-ink">
            Have you had pets before?
            <Required />
          </legend>
          <div className="mt-2">
            <ChoiceCards
              type="radio"
              name="adopt-hadpets"
              firstInputId={FIELD_ID.hadPets}
              size="md"
              columns={2}
              options={[
                { value: 'yes', label: 'Yes, I have' },
                { value: 'no', label: 'No, this would be my first' },
              ]}
              selected={values.hadPets ? [values.hadPets] : []}
              invalid={!!errors.hadPets}
              describedBy={errors.hadPets ? `${FIELD_ID.hadPets}-error` : undefined}
              onToggle={(v) => set('hadPets', v as 'yes' | 'no')}
              onBlur={() => blur('hadPets')}
            />
          </div>
          <FieldError id={`${FIELD_ID.hadPets}-error`} message={errors.hadPets} />
        </fieldset>

        {/* Message */}
        <div>
          <label htmlFor={FIELD_ID.message} className="block text-lg font-semibold text-ink">
            Why do you think {pet.name} fits your life? <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id={FIELD_ID.message}
            rows={4}
            value={values.message}
            onChange={(e) => set('message', e.target.value)}
            onBlur={() => blur('message')}
            aria-invalid={!!errors.message || undefined}
            aria-describedby={describedBy('message', 'adopt-message-count')}
            className={inputClass(!!errors.message)}
          />
          <p
            id="adopt-message-count"
            className={cn('mt-1 text-sm', remaining < 0 ? 'font-semibold text-error' : 'text-muted')}
          >
            {values.message.length} / {MAX_MESSAGE} characters
          </p>
          <FieldError id={`${FIELD_ID.message}-error`} message={errors.message} />
        </div>

        {/* Demo acknowledgement */}
        <div>
          <label
            htmlFor={FIELD_ID.demoAck}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-2xl border-2 bg-surface p-4',
              errors.demoAck ? 'border-error' : 'border-field-border',
              'has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus',
            )}
          >
            <input
              id={FIELD_ID.demoAck}
              type="checkbox"
              checked={values.demoAck}
              onChange={(e) => set('demoAck', e.target.checked)}
              onBlur={() => blur('demoAck')}
              aria-invalid={!!errors.demoAck || undefined}
              aria-describedby={describedBy('demoAck')}
              aria-required="true"
              className="mt-0.5 size-6 shrink-0 accent-[var(--color-primary)] outline-none"
            />
            <span className="text-base text-ink">
              I understand this is a demo and no real inquiry is sent.
              <Required />
            </span>
          </label>
          <FieldError id={`${FIELD_ID.demoAck}-error`} message={errors.demoAck} />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto"
            aria-disabled={sending || undefined}
            aria-busy={sending || undefined}
            leadingIcon={
              sending ? (
                <span
                  aria-hidden="true"
                  className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent motion-reduce:animate-none"
                />
              ) : undefined
            }
          >
            {sending ? 'Sending…' : 'Send my inquiry'}
          </Button>
          <p className="mt-3 text-sm text-muted" aria-live="polite">
            {sending ? 'Sending your demo inquiry…' : 'Nothing is sent — this demo keeps your answers in this browser only.'}
          </p>
        </div>
      </form>
    </section>
  )
}
