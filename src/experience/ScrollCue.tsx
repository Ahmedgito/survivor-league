import { useEffect, useState } from 'react'
import { ChevronsDown, Hand, Mouse } from 'lucide-react'
import { useLenis } from '@/app/SmoothScroll'
import { cn } from '@/lib/cn'

/**
 * Small "scroll to start" cue for the immersive story.
 * - Appears ~0.8s after the intro loader has gone (the loader marks #root `inert` while it's up)
 *   or, on repeat visits, once the 3D scene is ready.
 * - Fades away as soon as the visitor scrolls; comes back only at the very top.
 * - It's a real button: clicking it moves the story down one step.
 * - Phones: centred under the navbar (the hero card is a bottom sheet there).
 *   Desktop: bottom centre (the hero card sits in the left column).
 */
export function ScrollCue({ show }: { show: boolean }) {
  const lenis = useLenis()
  const [touch] = useState(() => window.matchMedia('(pointer: coarse)').matches)
  const [atTop, setAtTop] = useState(true)
  const [loaderUp, setLoaderUp] = useState(() => !!document.getElementById('root')?.hasAttribute('inert'))
  const [armed, setArmed] = useState(false)

  // Hide once the visitor starts scrolling.
  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY < 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Wait for the intro loader to leave (it sets/removes `inert` on #root).
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    const sync = () => setLoaderUp(root.hasAttribute('inert'))
    sync()
    const mo = new MutationObserver(sync)
    mo.observe(root, { attributes: true, attributeFilter: ['inert'] })
    return () => mo.disconnect()
  }, [])

  // Small delay so the cue fades in after the loader's iris reveal, not during it.
  useEffect(() => {
    if (!show || loaderUp) {
      setArmed(false)
      return
    }
    const id = window.setTimeout(() => setArmed(true), 800)
    return () => window.clearTimeout(id)
  }, [show, loaderUp])

  const visible = armed && atTop
  const label = touch ? 'Swipe up to follow Biscuit' : 'Scroll to follow Biscuit'

  const go = () => {
    const target = window.scrollY + window.innerHeight * 0.85
    if (lenis) lenis.scrollTo(target)
    else window.scrollTo({ top: target, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      onClick={go}
      inert={!visible}
      aria-hidden={!visible}
      className={cn(
        'on-night fixed left-1/2 top-24 z-30 inline-flex min-h-11 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full',
        'bg-night-2/90 px-4 py-2 text-sm font-semibold text-on-night shadow-lg ring-1 ring-white/15 backdrop-blur-md',
        'transition-[opacity,translate] duration-500 ease-out hover:bg-night-2 md:top-auto md:bottom-8',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
      )}
    >
      {touch ? <Hand aria-hidden className="size-4 shrink-0" /> : <Mouse aria-hidden className="size-4 shrink-0" />}
      <span>{label}</span>
      <ChevronsDown aria-hidden className="size-4 shrink-0 animate-bounce text-sun" />
    </button>
  )
}
