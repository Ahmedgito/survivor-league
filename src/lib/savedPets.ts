import { useSyncExternalStore } from 'react'

/** Tiny saved-pets ("hearts") store persisted to localStorage. */
const KEY = 'pawpath:saved'
const listeners = new Set<() => void>()

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

let saved: string[] = read()

function emit() {
  try {
    localStorage.setItem(KEY, JSON.stringify(saved))
  } catch {
    /* storage unavailable — keep in memory */
  }
  listeners.forEach((l) => l())
}

export const savedPets = {
  get: () => saved,
  has: (id: string) => saved.includes(id),
  toggle(id: string): boolean {
    const nowSaved = !saved.includes(id)
    saved = nowSaved ? [...saved, id] : saved.filter((x) => x !== id)
    emit()
    return nowSaved
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

export function useSavedPets() {
  const ids = useSyncExternalStore(savedPets.subscribe, savedPets.get, savedPets.get)
  return { ids, count: ids.length, has: (id: string) => ids.includes(id), toggle: savedPets.toggle }
}
