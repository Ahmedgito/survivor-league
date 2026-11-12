import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, SearchX, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { SegmentedControl } from '@/components/21st/SegmentedControl'
import { Chip } from '@/components/ui/Chip'
import { Button, buttonClasses } from '@/components/ui/Button'
import BlurText from '@/components/reactbits/BlurText'
import { PETS, SPECIES_LABEL } from '@/data/pets'
import type { AgeGroup, Energy, Pet, Size, Species } from '@/data/types'
import { announce } from '@/lib/a11y'
import { cn } from '@/lib/cn'
import { PetCard } from './PetCard'
import { AGE_LABEL, ENERGY_LABEL, SIZE_LABEL } from './petLabels'

/* ---------- filter model (all synced to URL search params) ---------- */

type WithKey = 'kids' | 'dogs' | 'cats'

const SPECIES: Species[] = ['dog', 'cat', 'rabbit', 'bird', 'fish']
const AGES: AgeGroup[] = ['baby', 'young', 'adult', 'senior']
const SIZES: Size[] = ['small', 'medium', 'large']
const ENERGIES: Energy[] = ['chill', 'balanced', 'zoomies']
const WITHS: WithKey[] = ['kids', 'dogs', 'cats']
const WITH_LABEL: Record<WithKey, string> = { kids: 'Good with kids', dogs: 'Good with dogs', cats: 'Good with cats' }

interface Filters {
  species: Species | ''
  age: AgeGroup[]
  size: Size[]
  energy: Energy[]
  with: WithKey[]
}

type MultiKey = 'age' | 'size' | 'energy' | 'with'

function parseList<T extends string>(raw: string | null, allowed: readonly T[]): T[] {
  if (!raw) return []
  return raw.split(',').filter((v): v is T => (allowed as readonly string[]).includes(v))
}

function readFilters(params: URLSearchParams): Filters {
  const sp = params.get('species')
  return {
    species: sp && (SPECIES as string[]).includes(sp) ? (sp as Species) : '',
    age: parseList(params.get('age'), AGES),
    size: parseList(params.get('size'), SIZES),
    energy: parseList(params.get('energy'), ENERGIES),
    with: parseList(params.get('with'), WITHS),
  }
}

function matches(pet: Pet, f: Filters) {
  if (f.species && pet.species !== f.species) return false
  if (f.age.length && !f.age.includes(pet.ageGroup)) return false
  if (f.size.length && !f.size.includes(pet.size)) return false
  if (f.energy.length && !f.energy.includes(pet.energy)) return false
  if (f.with.some((w) => !pet.goodWith[w])) return false
  return true
}

/** Every active filter as a removable pill. */
interface ActiveFilter {
  id: string
  label: string
  without: Filters
}

function activeFilters(f: Filters): ActiveFilter[] {
  const list: ActiveFilter[] = []
  if (f.species) list.push({ id: 'species', label: SPECIES_LABEL[f.species], without: { ...f, species: '' } })
  const multi = <K extends MultiKey>(key: K, labels: Record<Filters[K][number], string>) => {
    for (const v of f[key] as string[]) {
      list.push({
        id: `${key}:${v}`,
        label: labels[v as Filters[K][number]],
        without: { ...f, [key]: (f[key] as string[]).filter((x) => x !== v) },
      })
    }
  }
  multi('age', AGE_LABEL)
  multi('size', SIZE_LABEL)
  multi('energy', ENERGY_LABEL)
  multi('with', WITH_LABEL)
  return list
}

const countFor = (f: Filters) => PETS.filter((p) => matches(p, f)).length

/* ---------- page ---------- */

export default function CatalogPage() {
  const [params, setParams] = useSearchParams()
  const filters = useMemo(() => readFilters(params), [params])
  const results = useMemo(() => PETS.filter((p) => matches(p, filters)), [filters])
  const active = useMemo(() => activeFilters(filters), [filters])
  const extraCount = active.filter((a) => a.id !== 'species').length
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    document.title = 'Meet the pets · PawPath'
  }, [])

  const countRef = useRef<HTMLParagraphElement>(null)
  /** Write filters to the URL. `refocus` moves focus to the result count when the pressed control disappears. */
  const write = (next: Filters, refocus = false) => {
    if (refocus) window.requestAnimationFrame(() => countRef.current?.focus())
    const p = new URLSearchParams()
    if (next.species) p.set('species', next.species)
    for (const key of ['age', 'size', 'energy', 'with'] as const) {
      if (next[key].length) p.set(key, next[key].join(','))
    }
    setParams(p, { replace: true, preventScrollReset: true })
  }

  const toggleMulti = <K extends MultiKey>(key: K, value: Filters[K][number], on: boolean) => {
    const current = filters[key] as string[]
    const next = on ? [...current, value] : current.filter((v) => v !== value)
    write({ ...filters, [key]: next })
  }

  const clearAll = () => write({ species: '', age: [], size: [], energy: [], with: [] }, true)

  // Announce the result count when filters change (debounced so rapid clicks announce once).
  const countText = `${results.length} ${results.length === 1 ? 'pet matches' : 'pets match'}`
  const paramKey = params.toString()
  const lastKey = useRef(paramKey)
  useEffect(() => {
    if (lastKey.current === paramKey) return
    const t = window.setTimeout(() => {
      lastKey.current = paramKey
      announce(countText)
    }, 300)
    return () => window.clearTimeout(t)
  }, [countText, paramKey])

  // Empty-state suggestion: which single filter, if removed, shows the most pets?
  const suggestion = useMemo(() => {
    if (results.length || !active.length) return null
    let best: { filter: ActiveFilter; n: number } | null = null
    for (const a of active) {
      const n = countFor(a.without)
      if (n > 0 && (!best || n > best.n)) best = { filter: a, n }
    }
    return best
  }, [results.length, active])

  const speciesOptions = [
    { value: 'all', label: 'All' },
    ...SPECIES.map((s) => ({ value: s, label: SPECIES_LABEL[s] })),
  ]

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 pt-28">
      <header className="max-w-2xl">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--color-primary-strong)]">
          Adopt, don't shop
        </p>
        <BlurText
          tag="h1"
          text="Meet the pets waiting for you"
          trigger="load"
          animateBy="words"
          className="mt-2 text-4xl font-extrabold sm:text-5xl"
        />
        <p className="mt-4 text-lg text-muted">
          Every pet here is a fictional sample from our demo shelters. Filter by what fits your life, tap a card to
          read their story, and save the ones you love.
        </p>
      </header>

      {/* ---- Filters ---- */}
      <div className="mt-8 rounded-3xl bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
        <h2 className="sr-only">Filters</h2>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Phones: wrapping single-choice chips (6 segments don't fit in 360px). sm+: segmented control. */}
          <div role="group" aria-label="Pet type" className="flex flex-wrap gap-2 sm:hidden">
            {speciesOptions.map((o) => {
              const selected = (filters.species || 'all') === o.value
              return (
                <Chip
                  key={o.value}
                  pressed={selected}
                  onPressedChange={() => write({ ...filters, species: o.value === 'all' ? '' : (o.value as Species) })}
                >
                  {o.label}
                </Chip>
              )
            })}
          </div>
          <div className="hidden sm:block">
            <SegmentedControl
              label="Pet type"
              options={speciesOptions}
              value={filters.species || 'all'}
              onValueChange={(v) => write({ ...filters, species: v === 'all' ? '' : (v as Species) })}
            />
          </div>
          <button
            type="button"
            aria-expanded={moreOpen}
            aria-controls="more-filters"
            onClick={() => setMoreOpen((o) => !o)}
            className={cn(buttonClasses({ variant: 'secondary' }), 'self-start lg:hidden')}
          >
            <SlidersHorizontal aria-hidden="true" className="size-5" />
            More filters{extraCount ? ` (${extraCount})` : ''}
          </button>
        </div>

        <div id="more-filters" className={cn('mt-5 grid gap-5 sm:grid-cols-2', moreOpen ? 'grid' : 'hidden lg:grid')}>
          <FilterGroup legend="Age">
            {AGES.map((a) => (
              <Chip key={a} pressed={filters.age.includes(a)} onPressedChange={(on) => toggleMulti('age', a, on)}>
                {AGE_LABEL[a]}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup legend="Size">
            {SIZES.map((s) => (
              <Chip key={s} pressed={filters.size.includes(s)} onPressedChange={(on) => toggleMulti('size', s, on)}>
                {SIZE_LABEL[s]}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup legend="Energy">
            {ENERGIES.map((e) => (
              <Chip key={e} pressed={filters.energy.includes(e)} onPressedChange={(on) => toggleMulti('energy', e, on)}>
                {ENERGY_LABEL[e]}
              </Chip>
            ))}
          </FilterGroup>
          <FilterGroup legend="Good with (all selected must be true)">
            {WITHS.map((w) => (
              <Chip key={w} pressed={filters.with.includes(w)} onPressedChange={(on) => toggleMulti('with', w, on)}>
                {w[0].toUpperCase() + w.slice(1)}
              </Chip>
            ))}
          </FilterGroup>
        </div>
      </div>

      {/* ---- Result count + active filters ---- */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <p ref={countRef} tabIndex={-1} className="text-lg text-ink">
          <strong>{results.length}</strong> {results.length === 1 ? 'pet matches' : 'pets match'}
        </p>
        {active.length > 0 && (
          <>
            <ul className="flex flex-wrap gap-2" aria-label="Active filters">
              {active.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => write(a.without, true)}
                    aria-label={`Remove filter: ${a.label}`}
                    className="inline-flex min-h-11 items-center gap-1 rounded-full bg-[var(--color-primary-soft)] px-3 text-sm font-semibold text-[var(--color-primary-strong)] hover:bg-[#fed7aa] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                  >
                    {a.label}
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <Button variant="ghost" onClick={clearAll}>
              Clear filters
            </Button>
          </>
        )}
      </div>

      {/* ---- Grid / empty state ---- */}
      {results.length > 0 ? (
        <>
          <h2 className="sr-only">Pets</h2>
          <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((pet, i) => (
              <li key={pet.id}>
                <PetCard pet={pet} priority={i < 3} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-3xl border-2 border-dashed border-[var(--color-line)] bg-white px-6 py-14 text-center">
          <SearchX aria-hidden="true" className="size-14 text-muted" />
          <h2 className="mt-4 text-2xl font-extrabold">No pets match these filters — yet.</h2>
          <p className="mt-2 max-w-md text-muted">Try loosening one filter, or clear them all to see every pet.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {suggestion && (
              <Button onClick={() => write(suggestion.filter.without, true)}>
                Remove “{suggestion.filter.label}” to see {suggestion.n} {suggestion.n === 1 ? 'pet' : 'pets'}
              </Button>
            )}
            <Button variant="secondary" onClick={clearAll}>
              Clear filters
            </Button>
          </div>
        </div>
      )}

      {/* ---- Match quiz banner ---- */}
      <aside
        aria-labelledby="quiz-banner-title"
        className="on-night mt-12 flex flex-col items-start gap-4 rounded-3xl bg-[var(--color-night)] p-6 text-[var(--color-on-night)] sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div className="flex items-start gap-3">
          <Sparkles aria-hidden="true" className="mt-1 size-6 shrink-0 text-[var(--color-sun)]" />
          <div>
            <h2 id="quiz-banner-title" className="text-2xl font-extrabold text-[var(--color-on-night)]">
              Not sure who fits?
            </h2>
            <p className="mt-1 text-[var(--color-on-night-muted)]">
              Take the 1-minute match quiz and we'll rank every pet for your home and schedule.
            </p>
          </div>
        </div>
        <Link
          to="/match"
          className={cn(buttonClasses({ variant: 'primary' }), 'shrink-0 focus-visible:outline-[var(--color-sun)]')}
        >
          Take the 1-minute match quiz
          <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </aside>
    </section>
  )
}

function FilterGroup({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-ink">{legend}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  )
}
