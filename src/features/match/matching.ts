/**
 * Lifestyle Match scoring — a pure, explainable function.
 * All pets are FICTIONAL demo data (src/data/pets.ts).
 *
 * Score (0–100) = Home 30 + Time with company 25 + Pace 30 + Household 15.
 *  - Home (30):   your home is at least as roomy as the smallest home in pet.bestHome → 30, else 0
 *                  (rank flat 0 / house 1 / house with yard 2 — more space never costs points).
 *  - Company (25): rank rarely 0 / some 1 / mostly 2. If how much you're home ≥ what the pet
 *                  needs (pet.needsCompany) → 25; short by one step → 12; short by two → 0.
 *  - Pace (30):   energy chill 0 / balanced 1 / zoomies 2. Difference 0 → 30, 1 → 15, 2 → 0.
 *  - Household (15): every member you live with (kids / dogs / cats) must be in pet.goodWith → 15,
 *                  otherwise 0. "None of these" → 15.
 * Reasons: one per factor that earned FULL points, highest points first, max 3.
 * Heads-up: the single factor with the largest point loss (if any).
 * Ties keep the dataset order (stable sort).
 */
import { PETS } from '@/data/pets'
import type { Energy, HomeType, Pet, TimeAtHome } from '@/data/types'

export type Household = 'kids' | 'dogs' | 'cats'

export interface QuizAnswers {
  home: HomeType
  time: TimeAtHome
  energy: Energy
  /** Who else lives with you. Empty array = "None of these". */
  household: Household[]
}

export interface MatchResult {
  pet: Pet
  score: number
  reasons: string[]
  headsUp?: string
}

export const HOME_OPTIONS: { value: HomeType; label: string; hint: string; icon: string }[] = [
  { value: 'apartment', label: 'Flat or apartment', hint: 'No private outdoor space', icon: '🏢' },
  { value: 'house', label: 'House, no yard', hint: 'More room inside', icon: '🏠' },
  { value: 'house-with-yard', label: 'House with a yard', hint: 'Room to run outside', icon: '🌳' },
]

export const TIME_OPTIONS: { value: TimeAtHome; label: string; hint: string; icon: string }[] = [
  { value: 'rarely', label: 'Most of the day (8+ hours)', hint: 'School, work or uni all day', icon: '🎒' },
  { value: 'some', label: 'About half the day (4–6 hours)', hint: 'Someone pops back in between', icon: '⏳' },
  { value: 'mostly', label: "Someone's usually home", hint: 'Rarely an empty house', icon: '🛋️' },
]

export const ENERGY_OPTIONS: { value: Energy; label: string; hint: string; icon: string }[] = [
  { value: 'chill', label: 'Couch & chill', hint: 'Slow walks and long naps', icon: '😌' },
  { value: 'balanced', label: 'Daily walks', hint: 'Some play, some rest', icon: '🚶' },
  { value: 'zoomies', label: 'Always on the move', hint: 'Runs, games, adventures', icon: '⚡' },
]

export const HOUSEHOLD_OPTIONS: { value: Household; label: string; icon: string }[] = [
  { value: 'kids', label: 'Kids under 12', icon: '🧒' },
  { value: 'dogs', label: 'A dog', icon: '🐕' },
  { value: 'cats', label: 'A cat', icon: '🐈' },
]

const HOME_RANK: Record<HomeType, number> = { apartment: 0, house: 1, 'house-with-yard': 2 }
const TIME_RANK: Record<TimeAtHome, number> = { rarely: 0, some: 1, mostly: 2 }
const ENERGY_RANK: Record<Energy, number> = { chill: 0, balanced: 1, zoomies: 2 }
const ENERGY_WORD: Record<Energy, string> = { chill: 'Chill', balanced: 'Balanced', zoomies: 'High' }
const HOME_REASON: Record<HomeType, string> = {
  apartment: 'Happy in a flat',
  house: 'Happy in a house',
  'house-with-yard': 'Has room to run in your yard',
}
const HOUSEHOLD_WORD: Record<Household, string> = { kids: 'young kids', dogs: 'dogs', cats: 'cats' }

function joinWords(words: string[]): string {
  if (words.length <= 1) return words.join('')
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`
}

interface Factor {
  max: number
  points: number
  reason?: string
  headsUp?: string
}

export function scorePet(pet: Pet, a: QuizAnswers): MatchResult {
  const factors: Factor[] = []

  // Home (30) — more space never hurts: a pet fits if your home is at least as roomy as its smallest best home.
  const minHome = Math.min(...pet.bestHome.map((h) => HOME_RANK[h]))
  const homeOk = HOME_RANK[a.home] >= minHome
  factors.push({
    max: 30,
    points: homeOk ? 30 : 0,
    reason: homeOk ? (pet.bestHome.includes(a.home) ? HOME_REASON[a.home] : 'Fits your home') : undefined,
    headsUp: homeOk ? undefined : minHome === 2 ? 'Happiest with a yard to run in' : 'Needs more room than a flat',
  })

  // Company / time alone (25)
  const shortBy = TIME_RANK[pet.needsCompany] - TIME_RANK[a.time]
  const timePoints = shortBy <= 0 ? 25 : shortBy === 1 ? 12 : 0
  factors.push({
    max: 25,
    points: timePoints,
    reason:
      timePoints === 25
        ? pet.needsCompany === 'rarely'
          ? 'Fine on their own while you’re out'
          : pet.needsCompany === 'some'
            ? 'Okay alone for part of the day'
            : 'Loves company — and you’re around'
        : undefined,
    headsUp:
      timePoints === 25
        ? undefined
        : pet.needsCompany === 'mostly'
          ? 'Prefers company — needs someone home most of the day'
          : 'Needs someone home for part of the day',
  })

  // Pace (30)
  const diff = ENERGY_RANK[pet.energy] - ENERGY_RANK[a.energy]
  const pacePoints = diff === 0 ? 30 : Math.abs(diff) === 1 ? 15 : 0
  factors.push({
    max: 30,
    points: pacePoints,
    reason: diff === 0 ? `${ENERGY_WORD[pet.energy]} energy — matches your pace` : undefined,
    headsUp: diff > 0 ? 'Needs lots of daily play' : diff < 0 ? 'Prefers a quieter pace than yours' : undefined,
  })

  // Household (15)
  const notOk = a.household.filter((m) => !pet.goodWith[m])
  const goodParts: string[] = []
  if (a.household.includes('kids')) goodParts.push('kids')
  if (a.household.includes('dogs')) goodParts.push('dogs')
  if (a.household.includes('cats')) goodParts.push('cats')
  factors.push({
    max: 15,
    points: notOk.length === 0 ? 15 : 0,
    reason: notOk.length === 0 && goodParts.length > 0 ? `Gets on with ${joinWords(goodParts)}` : undefined,
    headsUp:
      notOk.length > 0 ? `Not ready to live with ${joinWords(notOk.map((m) => HOUSEHOLD_WORD[m]))} yet` : undefined,
  })

  const score = factors.reduce((sum, f) => sum + f.points, 0)
  const reasons = factors
    .filter((f) => f.reason && f.points === f.max)
    .sort((x, y) => y.points - x.points)
    .slice(0, 3)
    .map((f) => f.reason as string)
  const worst = factors
    .filter((f) => f.headsUp && f.points < f.max)
    .sort((x, y) => y.max - y.points - (x.max - x.points))[0]

  return { pet, score, reasons, headsUp: worst?.headsUp }
}

/** All pets scored and sorted by score (highest first). Stable for ties. */
export function scorePets(answers: QuizAnswers, pets: Pet[] = PETS): MatchResult[] {
  return pets
    .map((pet, index) => ({ r: scorePet(pet, answers), index }))
    .sort((x, y) => y.r.score - x.r.score || x.index - y.index)
    .map(({ r }) => r)
}

export function fitBand(score: number): string {
  if (score >= 85) return 'Great fit'
  if (score >= 60) return 'Good fit'
  return 'Worth a chat with the shelter'
}

/* ---------- URL <-> answers ---------- */

const isHome = (v: string | null): v is HomeType => v === 'apartment' || v === 'house' || v === 'house-with-yard'
const isTime = (v: string | null): v is TimeAtHome => v === 'rarely' || v === 'some' || v === 'mostly'
const isEnergy = (v: string | null): v is Energy => v === 'chill' || v === 'balanced' || v === 'zoomies'
const isHousehold = (v: string): v is Household => v === 'kids' || v === 'dogs' || v === 'cats'

export function answersToSearch(a: QuizAnswers): string {
  const p = new URLSearchParams({
    home: a.home,
    time: a.time,
    energy: a.energy,
    kids: a.household.length ? a.household.join(',') : 'none',
  })
  return p.toString()
}

/** Returns null when any answer is missing or invalid. */
export function searchToAnswers(s: URLSearchParams): QuizAnswers | null {
  const home = s.get('home')
  const time = s.get('time')
  const energy = s.get('energy')
  const kids = s.get('kids')
  if (!isHome(home) || !isTime(time) || !isEnergy(energy) || kids === null) return null
  const household = kids === 'none' ? [] : kids.split(',').filter(isHousehold)
  if (kids !== 'none' && household.length === 0) return null
  return { home, time, energy, household: Array.from(new Set(household)) }
}

/** Short human summary, e.g. "Flat · away most of the day · couch & chill · lives with a cat". */
export function summarizeAnswers(a: QuizAnswers): string {
  const home = { apartment: 'Flat', house: 'House, no yard', 'house-with-yard': 'House with a yard' }[a.home]
  const time = {
    rarely: 'away most of the day',
    some: 'away about half the day',
    mostly: 'someone usually home',
  }[a.time]
  const pace = { chill: 'couch & chill', balanced: 'daily walks', zoomies: 'always on the move' }[a.energy]
  const who = a.household.length
    ? `lives with ${joinWords(a.household.map((m) => ({ kids: 'kids', dogs: 'a dog', cats: 'a cat' })[m]))}`
    : 'no kids or other pets'
  return [home, time, pace, who].join(' · ')
}

/* ---------- last answers (prefills the adoption form) ---------- */
const KEY = 'pawpath:match'
export function saveLastAnswers(a: QuizAnswers) {
  try {
    localStorage.setItem(KEY, JSON.stringify(a))
  } catch {
    /* storage unavailable */
  }
}
export function loadLastAnswers(): QuizAnswers | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as Partial<QuizAnswers>
    return isHome(v.home ?? null) && isTime(v.time ?? null) && isEnergy(v.energy ?? null) && Array.isArray(v.household)
      ? (v as QuizAnswers)
      : null
  } catch {
    return null
  }
}
