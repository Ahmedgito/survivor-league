import { Link, useLocation } from 'react-router-dom'
import { Baby, Cat, Check, Dog, Ruler, X, Zap } from 'lucide-react'
import SpotlightCard from '@/components/reactbits/SpotlightCard'
import { cn } from '@/lib/cn'
import type { Pet } from '@/data/types'
import { SaveHeart } from './SaveHeart'
import { PetPhoto } from './PetPhoto'
import { ENERGY_LABEL, SIZE_LABEL, metaLine } from './petLabels'

export interface PetCardProps {
  pet: Pet
  /** 0–100. Shows a "92% match" badge when set (match results page). */
  matchScore?: number
  /** Short "why it fits" lines shown under the meta (match results page). Max 3 are shown. */
  reasons?: string[]
  /** Heading level for the pet name. Default 'h3' (cards sit under a page h2/h1). */
  headingLevel?: 'h2' | 'h3'
  /** Above-the-fold card (first row): load its photo eagerly with high priority. */
  priority?: boolean
}

const GOOD_WITH = [
  { key: 'kids', label: 'Kids', Icon: Baby },
  { key: 'dogs', label: 'Dogs', Icon: Dog },
  { key: 'cats', label: 'Cats', Icon: Cat },
] as const

/**
 * PetCard — one pet in a grid (catalogue, saved, match results). FICTIONAL sample data.
 * The name link is "stretched" over the whole card with ::after; the save heart sits above it
 * (z-10), so there are no nested interactive elements. Tab order: name link, then heart.
 */
export function PetCard({ pet, matchScore, reasons, headingLevel = 'h3', priority = false }: PetCardProps) {
  const Heading = headingLevel
  const shownReasons = reasons?.slice(0, 3) ?? []
  const location = useLocation()

  return (
    <SpotlightCard
      theme="light"
      spotlightColor="rgba(255, 210, 122, 0.55)"
      className={cn(
        'group flex h-full flex-col !p-0 transition-shadow duration-200 hover:shadow-[var(--shadow-pop)]',
        'has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-offset-3 has-[a:focus-visible]:outline-[var(--color-focus)]',
      )}
    >
      <div className="relative">
        <PetPhoto
          pet={pet}
          priority={priority}
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="aspect-[16/10] w-full"
        />
        {typeof matchScore === 'number' && (
          <p className="absolute bottom-3 left-3 rounded-full bg-[var(--color-accent-strong)] px-3 py-1 text-sm font-bold text-white shadow-[var(--shadow-card)]">
            {Math.round(matchScore)}% match
          </p>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 bg-white p-5">
        <div>
          <Heading className="text-2xl font-extrabold">
            <Link
              to={`/pets/${pet.id}`}
              state={location.pathname === '/pets' ? { from: location.search } : undefined}
              className="text-ink no-underline outline-none after:absolute after:inset-0 after:content-[''] focus-visible:outline-none hover:underline"
            >
              {pet.name}
            </Link>
          </Heading>
          <p className="mt-1 text-[15px] text-muted">{metaLine(pet)}</p>
        </div>

        <ul className="flex flex-wrap gap-2" aria-label="Personality">
          {pet.traits.slice(0, 3).map((trait) => (
            <li
              key={trait}
              className="rounded-full bg-[var(--color-sand)] px-3 py-1 text-sm font-semibold text-ink"
            >
              {trait}
            </li>
          ))}
        </ul>

        {shownReasons.length > 0 && (
          <ul className="space-y-1 text-[15px] text-ink" aria-label={`Why ${pet.name} fits`}>
            {shownReasons.map((r) => (
              <li key={r} className="flex items-start gap-2">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--color-accent-strong)]" strokeWidth={3} />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
          <div className="flex items-center gap-1.5">
            <dt className="flex items-center gap-1">
              <Zap aria-hidden="true" className="size-4" />
              Energy:
            </dt>
            <dd className="font-semibold text-ink">{ENERGY_LABEL[pet.energy]}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <dt className="flex items-center gap-1">
              <Ruler aria-hidden="true" className="size-4" />
              Size:
            </dt>
            <dd className="font-semibold text-ink">{SIZE_LABEL[pet.size]}</dd>
          </div>
        </dl>

        <div className="border-t border-[var(--color-line)] pt-3">
          <p className="sr-only">Good with:</p>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {GOOD_WITH.map(({ key, label, Icon }) => {
              const ok = pet.goodWith[key]
              return (
                <li
                  key={key}
                  className={cn('flex items-center gap-1', ok ? 'font-semibold text-ink' : 'text-muted line-through decoration-1')}
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {ok ? (
                    <Check aria-hidden="true" className="size-3.5 text-[var(--color-success)]" strokeWidth={3} />
                  ) : (
                    <X aria-hidden="true" className="size-3.5" strokeWidth={3} />
                  )}
                  <span>
                    {label}
                    <span className="sr-only">{ok ? ': yes' : ': not yet'}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* After the name link in DOM order (tab: name, then heart); sits above the stretched link. */}
      <div className="absolute right-3 top-3 z-10">
        <SaveHeart pet={pet} />
      </div>
    </SpotlightCard>
  )
}

export default PetCard
