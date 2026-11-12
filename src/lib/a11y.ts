/* ─────────────────────────── Motion policy ───────────────────────────
 * Product decision (2026-11-12): animations are ALWAYS ON, including on devices that report
 * prefers-reduced-motion (e.g. Windows with "Animation effects" switched off), so every visitor
 * gets the immersive scroll story. Third-party components (React Bits, Motion, GSAP matchMedia)
 * query prefers-reduced-motion themselves, so those queries are answered as "no-preference" here;
 * the Tailwind `motion-reduce:` variant is disabled in src/index.css.
 * Story copy stays real HTML on solid cards, and devices without WebGL still get the static story.
 * ──────────────────────────────────────────────────────────────────── */
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const nativeMatchMedia = window.matchMedia.bind(window)
  // Note: "reduce" is a substring of "prefers-reduced-motion", so match the *value* explicitly.
  const asksReduce = /prefers-reduced-motion\s*:\s*reduce|\(\s*prefers-reduced-motion\s*\)/
  window.matchMedia = ((query: string) =>
    query.includes('prefers-reduced-motion')
      ? nativeMatchMedia(asksReduce.test(query) ? 'not all' : 'all')
      : nativeMatchMedia(query)) as typeof window.matchMedia
}

/** Always false: animations are forced on site-wide (see the motion policy above). */
export function useReducedMotion(): boolean {
  return false
}

/** Non-hook version of useReducedMotion. Always false (animations are forced on). */
export const prefersReducedMotion = (): boolean => false

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
