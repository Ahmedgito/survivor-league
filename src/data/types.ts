/** Shared domain types. All pet & shelter data in this project is FICTIONAL demo data. */

export type Species = 'dog' | 'cat' | 'rabbit' | 'bird' | 'fish'
export type AgeGroup = 'baby' | 'young' | 'adult' | 'senior'
export type Size = 'small' | 'medium' | 'large'
export type Energy = 'chill' | 'balanced' | 'zoomies'
export type HomeType = 'apartment' | 'house' | 'house-with-yard'
export type TimeAtHome = 'rarely' | 'some' | 'mostly'

/** Matches keys in src/data/models.ts (3D model manifest). */
export type PetModelKey = 'dog' | 'cat' | 'rabbit' | 'shiba' | 'husky' | 'goldfish' | 'bird'

export interface Shelter {
  id: string
  name: string
  area: string // fictional neighbourhood, e.g. "Clifton Block 4 (fictional)"
  phone: string // fictional, e.g. "+92 300 0000001"
  email: string // always @example.com
}

export interface Pet {
  id: string // url slug, e.g. "biscuit"
  name: string
  species: Species
  breed: string
  ageLabel: string // e.g. "2 years"
  ageGroup: AgeGroup
  sex: 'male' | 'female'
  size: Size
  energy: Energy
  traits: string[] // 3 short personality words
  goodWith: { kids: boolean; dogs: boolean; cats: boolean }
  bestHome: HomeType[] // homes this pet thrives in
  needsCompany: TimeAtHome // minimum time someone should be home
  story: string // 2–3 sentence bio, first person or warm third person
  fee: number // PKR, fictional
  vaccinated: boolean
  neutered: boolean
  shelterId: string
  model: PetModelKey
  tint: string // hex colour applied to tintable materials
  cardColor: string // soft background colour for cards (light, keeps ink text ≥ 4.5:1)
  emoji: string // decorative only (aria-hidden)
}

export interface MatchAnswers {
  home: HomeType
  time: TimeAtHome
  energy: Energy
  kids?: boolean
}
