import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart } from 'lucide-react'
import { buttonClasses } from '@/components/ui/Button'
import { getPet } from '@/data/pets'
import type { Pet } from '@/data/types'
import { useSavedPets } from '@/lib/savedPets'
import { cn } from '@/lib/cn'
import { PetCard } from './PetCard'

export default function SavedPage() {
  const { ids } = useSavedPets()
  const pets = ids.map((id) => getPet(id)).filter((p): p is Pet => Boolean(p))

  useEffect(() => {
    document.title = 'Your saved pets · PawPath'
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 pt-28">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-extrabold sm:text-5xl">Your shortlist</h1>
        <p className="mt-3 text-lg text-muted">
          {pets.length
            ? `You've saved ${pets.length} ${pets.length === 1 ? 'pet' : 'pets'}. Saved pets stay on this device only.`
            : 'Tap the heart on any pet to keep them here while you decide.'}
        </p>
      </header>

      {pets.length > 0 ? (
        <>
          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <li key={pet.id}>
                <PetCard pet={pet} headingLevel="h2" />
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/pets" className={buttonClasses({ variant: 'secondary' })}>
              Keep browsing
            </Link>
            <Link to="/match" className={buttonClasses({ variant: 'ghost' })}>
              Not sure yet? Take the match quiz
            </Link>
          </div>
        </>
      ) : (
        <div className="mt-8 flex flex-col items-center rounded-3xl border-2 border-dashed border-[var(--color-line)] bg-white px-6 py-14 text-center">
          <Heart aria-hidden="true" className="size-14 text-[var(--color-primary)]" />
          <h2 className="mt-4 text-2xl font-extrabold">No saved pets yet</h2>
          <p className="mt-2 max-w-md text-muted">
            Browse the pets waiting for a home and tap the heart on the ones you'd love to meet.
          </p>
          <Link to="/pets" className={cn(buttonClasses({ size: 'lg' }), 'mt-6')}>
            Browse pets
            <ArrowRight aria-hidden="true" className="size-5" />
          </Link>
        </div>
      )}
    </section>
  )
}
