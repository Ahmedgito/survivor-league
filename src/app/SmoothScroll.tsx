import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/lib/a11y'

gsap.registerPlugin(ScrollTrigger)

const LenisContext = createContext<Lenis | null>(null)
/** Access the Lenis instance (null when reduced motion is on → native scroll). */
export const useLenis = () => useContext(LenisContext)

/**
 * Lenis owns smooth scrolling and drives GSAP ScrollTrigger from one ticker.
 * Disabled entirely under prefers-reduced-motion (native scrolling, ScrollTrigger still works).
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    if (reduced) return
    const instance = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: true })
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    setLenis(instance)
    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [reduced])

  // Scroll to top on route change, then let ScrollTrigger re-measure.
  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 100)
    return () => window.clearTimeout(id)
  }, [pathname, lenis])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
