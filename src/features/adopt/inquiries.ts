/** Demo inquiry store — localStorage only ('pawpath:inquiries'). Nothing is ever sent anywhere. */
import type { HomeType } from '@/data/types'

export interface Inquiry {
  id: string
  reference: string // e.g. "PP-2417" (fictional)
  petId: string
  fullName: string
  email: string
  phone?: string
  ageGroup: '16-17' | '18-24' | '25+'
  home: HomeType
  hadPets: 'yes' | 'no'
  message?: string
  createdAt: string
}

const KEY = 'pawpath:inquiries'

export function listInquiries(): Inquiry[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Inquiry[]) : []
  } catch {
    return []
  }
}

export function makeReference(): string {
  return `PP-${Math.floor(1000 + Math.random() * 9000)}`
}

export function saveInquiry(i: Omit<Inquiry, 'id' | 'reference' | 'createdAt'>): Inquiry {
  const inquiry: Inquiry = {
    ...i,
    id: `${Date.now()}`,
    reference: makeReference(),
    createdAt: new Date().toISOString(),
  }
  try {
    localStorage.setItem(KEY, JSON.stringify([...listInquiries(), inquiry]))
  } catch {
    /* storage unavailable — the success screen still works */
  }
  return inquiry
}

/** Most recent demo inquiry for a pet (e.g. for a "You asked about Biscuit" banner). */
export function latestInquiryFor(petId: string): Inquiry | undefined {
  return listInquiries()
    .filter((i) => i.petId === petId)
    .at(-1)
}

export function clearInquiries() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
