import { useSyncExternalStore } from 'react'

const RM = '(prefers-reduced-motion: reduce)'

/* ─────────────────────────── Motion preference ───────────────────────────
 * 'system' follows the device setting (prefers-reduced-motion).
 * 'on' / 'off' is the visitor's explicit choice from the in-site "Animations" toggle.
 *
 * Why: many laptops report reduced motion by default (e.g. Windows with
 * "Animation effects" switched off), which would hide the scroll story from
 * people who never asked for that. We respect the device setting by default
 * and let visitors opt in or out themselves.
 * ──────────────────────────────────────────────────────────────────────── */
export type MotionPreference = 'system' | 'on' | 'off'
const MOTION_KEY = 'pawpath:motion'

const nativeMatchMedia: ((q: string) => MediaQueryList) | null =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : null

function readMotionPreference(): MotionPreference {
  try {
    const v = localStorage.getItem(MOTION_KEY)
    return v === 'on' || v === 'off' ? v : 'system'
  } catch {
    return 'system'
  }
}

let motionPref: MotionPreference = typeof window !== 'undefined' ? readMotionPreference() : 'system'
const motionListeners = new Set<() => void>()

function applyMotionAttribute() {
  if (typeof document !== 'undefined') document.documentElement.dataset.motion = motionPref
}

if (nativeMatchMedia) {
  applyMotionAttribute()
  // Make third-party components (React Bits, Motion, GSAP matchMedia) follow the visitor's
  // explicit choice too: answer prefers-reduced-motion queries from the override.
  window.matchMedia = ((query: string) => {
    if (motionPref !== 'system' && query.includes('prefers-reduced-motion')) {
      const wantsReduce = motionPref === 'off'
      const asksReduce = query.includes('reduce')
      return nativeMatchMedia(asksReduce === wantsReduce ? 'all' : 'not all')
    }
    return nativeMatchMedia(query)
  }) as typeof window.matchMedia
}

/** The device-level setting only (ignores the in-site toggle). */
export const systemPrefersReducedMotion = (): boolean => !!nativeMatchMedia?.(RM).matches

export function setMotionPreference(pref: MotionPreference) {
  motionPref = pref
  try {
    if (pref === 'system') localStorage.removeItem(MOTION_KEY)
    else localStorage.setItem(MOTION_KEY, pref)
  } catch {
    /* storage unavailable — keep in memory */
  }
  applyMotionAttribute()
  motionListeners.forEach((l) => l())
}

function subscribeMotion(cb: () => void) {
  motionListeners.add(cb)
  return () => {
    motionListeners.delete(cb)
  }
}

function subscribeSystem(cb: () => void) {
  if (!nativeMatchMedia) return () => {}
  const mq = nativeMatchMedia(RM)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/** 'system' | 'on' | 'off' — the visitor's explicit choice, live-updating. */
export function useMotionPreference(): MotionPreference {
  return useSyncExternalStore(subscribeMotion, () => motionPref, () => 'system')
}

/** True when motion should be reduced (visitor choice first, then device setting). Live-updates. */
export function useReducedMotion(): boolean {
  const pref = useMotionPreference()
  const system = useSyncExternalStore(subscribeSystem, systemPrefersReducedMotion, () => false)
  return pref === 'on' ? false : pref === 'off' ? true : system
}

/** Non-hook version of useReducedMotion for event handlers and effects. */
export const prefersReducedMotion = (): boolean =>
  motionPref === 'on' ? false : motionPref === 'off' ? true : systemPrefersReducedMotion()

/* ─────────────────────────── Capability checks ─────────────────────────── */

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
