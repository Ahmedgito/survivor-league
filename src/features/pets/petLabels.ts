import { Bird, Cat, Dog, Fish, Rabbit, type LucideIcon } from 'lucide-react'
import type { AgeGroup, Energy, HomeType, Pet, Size, Species, TimeAtHome } from '@/data/types'

/** Human labels for the catalogue/profile. All pet data is FICTIONAL sample data. */

export const SPECIES_ICON: Record<Species, LucideIcon> = {
  dog: Dog,
  cat: Cat,
  rabbit: Rabbit,
  bird: Bird,
  fish: Fish,
}

export const SPECIES_SINGULAR: Record<Species, string> = {
  dog: 'dog',
  cat: 'cat',
  rabbit: 'rabbit',
  bird: 'bird',
  fish: 'fish',
}

export const AGE_LABEL: Record<AgeGroup, string> = {
  baby: 'Baby (under 1)',
  young: 'Young (1–2)',
  adult: 'Adult (3–7)',
  senior: 'Senior (8+)',
}

export const SIZE_LABEL: Record<Size, string> = { small: 'Small', medium: 'Medium', large: 'Large' }

export const ENERGY_LABEL: Record<Energy, string> = { chill: 'Chill', balanced: 'Balanced', zoomies: 'Zoomies' }

export const ENERGY_HINT: Record<Energy, string> = {
  chill: 'Happy with naps and slow walks',
  balanced: 'A good mix of play and rest',
  zoomies: 'Needs lots of play and exercise every day',
}

export const HOME_LABEL: Record<HomeType, string> = {
  apartment: 'Flat / apartment',
  house: 'House',
  'house-with-yard': 'House with a yard',
}

export const COMPANY_LABEL: Record<TimeAtHome, string> = {
  rarely: 'Fine on their own for most of the day',
  some: 'Needs someone home for part of the day',
  mostly: 'Needs someone home most of the day',
}

export const SEX_LABEL: Record<Pet['sex'], string> = { male: 'Male', female: 'Female' }

/** Pronoun for sentences like "Turn him". */
export const pronoun = (pet: Pet) => (pet.sex === 'male' ? 'him' : 'her')

/** Short meta line: "Mixed breed · 2 years". */
export const metaLine = (pet: Pet) => `${pet.breed} · ${pet.ageLabel}`

/** Screen-reader description of the pet's visual. */
export const visualDescription = (pet: Pet) => {
  const breed = pet.breed.toLowerCase()
  const species = SPECIES_SINGULAR[pet.species]
  return `${pet.name}, a ${SIZE_LABEL[pet.size].toLowerCase()} ${breed}${breed.includes(species) ? '' : ` ${species}`}`
}

export const formatFee = (fee: number) => `Rs ${fee.toLocaleString('en-US')}`
