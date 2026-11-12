import { useSyncExternalStore } from 'react'

const RM = '(prefers-reduced-motion: reduce)'

/** True when the user asks for reduced motion. Live-updates. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(RM)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia(RM).matches,
    () => false,
  )
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(RM).matches

let webglCache: boolean | null = null
/** True when WebGL is available (cached). */
export function hasWebGL(): boolean {
  if (webglCache !== null) return webglCache
  try {
    const c = document.createElement('canvas')
    webglCache = !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    webglCache = false
  }
  return webglCache
}

/** Rough low-power heuristic: small screen + few cores or save-data. */
export function isLowPower(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
  if (nav.connection?.saveData) return true
  if ((nav.deviceMemory ?? 8) <= 2) return true
  return (navigator.hardwareConcurrency ?? 8) <= 2
}

/** Polite live-region announcer for toasts / result counts. */
export function announce(message: string) {
  const el = document.getElementById('a11y-announcer')
  if (!el) return
  el.textContent = ''
  window.setTimeout(() => (el.textContent = message), 50)
}
