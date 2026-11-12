/**
 * IntroLoader — a night-time prologue to Biscuit's 3D story, shown once per browser session
 * on the first load of "/" while the 3D scene loads.
 *
 * Beats: night sky + fireflies (canvas 2D) · a moon that waxes with REAL progress · Biscuit
 * (SVG) asleep by his kennel, breathing, "z z z" · the pointer is a firefly lantern his nose
 * follows (he peeks when it comes close) · click / tap / Enter / Space boops him (ear flick,
 * tail wag, "Woof!" bubble, hearts) · paw prints stamp across as progress grows · on 100% he
 * wakes, stretches and hops, then an iris opens from his head onto the live 3D story.
 * Min 1.6 s, hard cap 8 s, "Skip intro" always visible. Exit ≤ 1.2 s.
 */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { PawPrint } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLenis } from '@/app/SmoothScroll'
import { hasWebGL } from '@/lib/a11y'
import { isStoryReady } from './loadSignals'
import { trackLoading } from './progress'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const SEEN_KEY = 'pawpath:intro-seen'
const MIN_MS = 1600
const CAP_MS = 8000
const PAWS = 8
const VB = { w: 340, h: 220 }
/** Biscuit's head centre in SVG units: the nose follows from here and the iris opens here. */
const HEAD = { x: 282, y: 160 }
const BG = 'radial-gradient(120% 70% at 50% 112%, #2a2342 0%, #1c1830 62%)'
const WOOFS = ['Woof!', 'Boop!', 'Arf arf!', '*sniff*', 'Hi, friend!']

type ExitKind = 'done' | 'skip' | 'cap'
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

let decision: boolean | null = null
/** Decided once per page load (StrictMode-safe): first visit to "/" this session, 3D not ready yet. */
function shouldShow(): boolean {
  if (decision !== null) return decision
  const onHome = window.location.pathname === '/'
  let seen = false
  try {
    seen = !!sessionStorage.getItem(SEEN_KEY)
    if (onHome && !seen) sessionStorage.setItem(SEEN_KEY, '1')
  } catch {
    /* storage blocked: still show once for this page load */
  }
  decision = onHome && !seen && !isStoryReady() && hasWebGL()
  return decision
}

export function IntroLoader() {
  const [show] = useState(shouldShow)
  const [done, setDone] = useState(false)

  // Hand over from the pre-JS splash in index.html (same night sky + moon, so no visible seam).
  useLayoutEffect(() => {
    const splash = document.getElementById('pp-splash')
    if (!splash) return
    if (show) {
      splash.remove()
      return
    }
    splash.style.opacity = '0'
    const id = window.setTimeout(() => splash.remove(), 400)
    return () => window.clearTimeout(id)
  }, [show])

  if (!show || done) return null
  return createPortal(<Intro onDone={() => setDone(true)} />, document.body)
}

function Intro({ onDone }: { onDone: () => void }) {
  const lenis = useLenis()
  const lenisRef = useRef(lenis)
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const dogRef = useRef<SVGGElement>(null)
  const followRef = useRef<SVGGElement>(null)
  const headRef = useRef<SVGGElement>(null)
  const pupilRef = useRef<SVGGElement>(null)
  const earRef = useRef<SVGGElement>(null)
  const tailRef = useRef<SVGGElement>(null)
  const bubbleRef = useRef<SVGGElement>(null)
  const bubbleTextRef = useRef<SVGTextElement>(null)
  const heartsRef = useRef<SVGGElement>(null)
  const shadeRef = useRef<SVGCircleElement>(null)
  const glowRef = useRef<SVGCircleElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const pawsRef = useRef<HTMLDivElement>(null)
  const exitingRef = useRef(false)
  const boopUntil = useRef(0)
  const boopCount = useRef(0)
  const releaseRef = useRef<(() => void) | null>(null)
  const exitRef = useRef<(k: ExitKind) => void>(() => {})
  const [status, setStatus] = useState('')
  const [boops, setBoops] = useState(0)

  const { contextSafe } = useGSAP(
    () => {
      gsap.from('.pp-in', { opacity: 0, y: 14, duration: 0.6, stagger: 0.07, ease: 'power3.out', clearProps: 'transform' })
    },
    { scope: rootRef },
  )

  // While the intro is up: page behind is inert (no hidden focus targets), scroll is locked at the top.
  useEffect(() => {
    const app = document.getElementById('root')
    const html = document.documentElement
    const prevOverflow = html.style.overflow
    app?.setAttribute('inert', '')
    html.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    const id = window.setTimeout(() => setStatus('Loading PawPath'), 150)
    releaseRef.current = () => {
      releaseRef.current = null
      app?.removeAttribute('inert')
      document.getElementById('main')?.removeAttribute('aria-busy')
      html.style.overflow = prevOverflow
      lenisRef.current?.start()
    }
    return () => {
      window.clearTimeout(id)
      releaseRef.current?.()
    }
  }, [])

  useEffect(() => {
    lenisRef.current = lenis
    if (lenis && releaseRef.current) lenis.stop()
  }, [lenis])

  exitRef.current = contextSafe((kind: ExitKind) => {
    const root = rootRef.current
    if (exitingRef.current || !root) return
    exitingRef.current = true
    setStatus('Ready')
    const hadFocus = root.contains(document.activeElement)
    root.dataset.awake = 'true'
    if (labelRef.current) labelRef.current.textContent = kind === 'skip' ? 'See you inside!' : "Biscuit's awake!"
    if (kind === 'done' && pctRef.current) pctRef.current.textContent = '100%'

    const r = svgRef.current?.getBoundingClientRect()
    const ix = r ? r.left + (r.width * HEAD.x) / VB.w : window.innerWidth / 2
    const iy = r ? r.top + (r.height * HEAD.y) / VB.h : window.innerHeight / 2
    const maxR = Math.hypot(Math.max(ix, window.innerWidth - ix), Math.max(iy, window.innerHeight - iy)) + 80
    root.style.setProperty('--ix', `${ix}px`)
    root.style.setProperty('--iy', `${iy}px`)
    root.style.setProperty('--ir', '0px')

    const fast = kind === 'skip'
    const at = fast ? 0.05 : 0.45
    const irisDur = fast ? 0.6 : 0.72
    const tl = gsap.timeline({
      onComplete: () => {
        releaseRef.current?.()
        ScrollTrigger.refresh()
        if (hadFocus) document.getElementById('main')?.focus({ preventScroll: true })
        onDone()
      },
    })
    if (!fast) {
      // Wake → stretch → hop.
      tl.to(headRef.current, { y: -7, rotation: -12, transformOrigin: '15% 80%', duration: 0.22, ease: 'back.out(3)' }, 0)
        .to(earRef.current, { rotation: -30, transformOrigin: '50% 0%', duration: 0.11, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0.02)
        .to(tailRef.current, { rotation: 24, transformOrigin: '100% 80%', duration: 0.09, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 0)
        .to(dogRef.current, { scaleX: 1.1, scaleY: 0.9, transformOrigin: '50% 100%', duration: 0.18, ease: 'power2.out' }, 0.06)
        .to(dogRef.current, { scaleX: 0.95, scaleY: 1.06, y: -34, duration: 0.2, ease: 'power2.out' }, 0.26)
        .to(dogRef.current, { scaleX: 1, scaleY: 1, y: 0, duration: 0.3, ease: 'bounce.out' }, 0.46)
    }
    // Iris opens from Biscuit's head onto the live 3D story; the 2D sketch pushes in as it goes.
    tl.to('.pp-ui', { opacity: 0, y: 8, duration: 0.25, ease: 'power1.in' }, at)
      .call(() => root.classList.add('pp-iris'), undefined, at)
      .to(root, { '--ir': `${maxR}px`, duration: irisDur, ease: 'power2.in' }, at)
      .to(sceneRef.current, { scale: 1.12, duration: irisDur, ease: 'power2.in' }, at)
  })

  const boop = contextSafe(() => {
    if (exitingRef.current) return
    const n = boopCount.current++
    setBoops(n + 1)
    boopUntil.current = performance.now() + 1200
    if (bubbleTextRef.current) bubbleTextRef.current.textContent = WOOFS[n % WOOFS.length]
    gsap
      .timeline()
      .fromTo(earRef.current, { rotation: 0 }, { rotation: -34, transformOrigin: '50% 0%', duration: 0.1, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 0)
      .fromTo(headRef.current, { y: 0 }, { y: -5, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, 0)
      .fromTo(tailRef.current, { rotation: 0 }, { rotation: 22, transformOrigin: '100% 80%', duration: 0.09, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 0)
      .fromTo(bubbleRef.current, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, transformOrigin: '30% 100%', duration: 0.3, ease: 'back.out(2.5)' }, 0)
      .to(bubbleRef.current, { opacity: 0, duration: 0.3 }, 1.1)
    Array.from(heartsRef.current?.children ?? []).forEach((el, i) => {
      const a = -Math.PI / 2 + (i - 3.5) * 0.34 + (Math.random() - 0.5) * 0.2
      const d = 46 + Math.random() * 28
      gsap.fromTo(
        el,
        { x: 316, y: 158, scale: 0.3, opacity: 1, rotation: 0 },
        { x: 316 + Math.cos(a) * d, y: 158 + Math.sin(a) * d, scale: 0.9 + Math.random() * 0.5, rotation: (Math.random() - 0.5) * 60, duration: 1, ease: 'power2.out' },
      )
      gsap.to(el, { opacity: 0, duration: 0.4, delay: 0.6 })
    })
  })

  // One rAF loop: progress → moon / paws / %, lantern + fireflies (canvas), nose follow, exit checks.
  useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !root || !ctx) return
    const paws = Array.from(pawsRef.current?.children ?? []) as HTMLElement[]
    const t0 = performance.now()
    let target = 0
    let shown = 0
    let last = t0
    let raf = 0
    let lit = -1
    let pctShown = -1
    let w = 0
    let h = 0
    let headX = 0
    let headY = 0
    let size = 300
    let px = 0
    let py = 0
    let lx = 0
    let ly = 0
    let pointer = false
    let peek = false
    let peekAt = 0
    let busy = false
    const stopTracking = trackLoading((p) => {
      target = p
    })

    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = 64
    const sctx = sprite.getContext('2d')
    if (sctx) {
      const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      g.addColorStop(0, 'rgba(255,246,210,1)')
      g.addColorStop(0.18, 'rgba(255,210,122,0.85)')
      g.addColorStop(0.45, 'rgba(255,210,122,0.2)')
      g.addColorStop(1, 'rgba(255,210,122,0)')
      sctx.fillStyle = g
      sctx.fillRect(0, 0, 64, 64)
    }
    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    const stars = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random() * 0.7, r: rand(0.8, 1.8), a: rand(0.35, 0.9), s: rand(0.4, 1.2), p: rand(0, 6.28) }))
    let flies: { x: number; y: number; r: number; a: number; s: number; p: number }[] = []

    const measure = () => {
      w = window.innerWidth
      h = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const r = svgRef.current?.getBoundingClientRect()
      if (r) {
        headX = r.left + (r.width * HEAD.x) / VB.w
        headY = r.top + (r.height * HEAD.y) / VB.h
        size = r.width
      }
      if (!flies.length) {
        flies = Array.from({ length: w < 640 ? 18 : 32 }, () => ({ x: rand(0, w), y: rand(h * 0.1, h), r: rand(7, 15), a: rand(0, 6.28), s: rand(0.2, 0.55), p: rand(0, 6.28) }))
        lx = headX
        ly = headY - 90
      }
    }
    measure()
    const remeasure = window.setTimeout(measure, 750) // after the entrance tween settles

    const onPointer = (e: PointerEvent) => {
      px = e.clientX
      py = e.clientY
      pointer = true
    }

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const t = now - t0
      const sec = now / 1000

      if (!exitingRef.current) {
        const goal = Math.min(target, t / (MIN_MS - 200))
        shown += (goal - shown) * Math.min(1, dt * 6)
        if (goal - shown < 0.003) shown = goal
        const pct = Math.round(shown * 100)
        if (pct !== pctShown && pctRef.current) {
          pctShown = pct
          pctRef.current.textContent = `${pct}%`
        }
        shadeRef.current?.setAttribute('transform', `translate(${-(16 + 50 * shown)} 0)`)
        glowRef.current?.setAttribute('opacity', String(0.25 + 0.55 * shown))
        const n = Math.floor(shown * PAWS + 1e-6)
        if (n !== lit) {
          lit = n
          paws.forEach((el, i) => (el.dataset.on = String(i < n)))
        }
        if (!busy) {
          const m = document.getElementById('main')
          if (m) {
            m.setAttribute('aria-busy', 'true')
            busy = true
          }
        }
        if (shown >= 0.999 && t >= MIN_MS) exitRef.current('done')
        else if (t >= CAP_MS) exitRef.current('cap')
      }

      // The lantern follows the pointer; until someone moves it, it idles around Biscuit.
      if (!pointer) {
        px = headX + Math.cos(sec * 0.7) * Math.min(150, w * 0.32)
        py = headY - 90 + Math.sin(sec * 1.1) * 36
      }
      const k = Math.min(1, dt * 6)
      lx += (px - lx) * k
      ly += (py - ly) * k

      // Biscuit's nose follows the lantern; he peeks when it comes close (hysteresis: no flicker).
      const dx = lx - headX
      const dy = ly - headY
      const dist = Math.hypot(dx, dy) || 1
      if (followRef.current)
        followRef.current.style.transform = `translate(${clamp(dx / 60, -3, 4)}px, ${clamp(dy / 80, -3, 2)}px) rotate(${clamp(dy / 16, -14, 6)}deg)`
      pupilRef.current?.setAttribute('transform', `translate(${((dx / dist) * 1.6).toFixed(2)} ${((dy / dist) * 1.6).toFixed(2)})`)
      const near = pointer && dist < (peek ? size * 0.5 : size * 0.36)
      const want = now < boopUntil.current || near
      if (want !== peek && now - peekAt > 350) {
        peek = want
        peekAt = now
        root.dataset.peek = String(want)
      }

      // Canvas: twinkling stars + drifting fireflies (slow pulses, never flashing).
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#fff8f0'
      for (const s of stars) {
        ctx.globalAlpha = s.a * (0.55 + 0.45 * Math.sin(sec * s.s + s.p))
        ctx.fillRect(s.x * w, s.y * h, s.r, s.r)
      }
      ctx.globalCompositeOperation = 'lighter'
      for (const f of flies) {
        f.a += (Math.random() - 0.5) * 0.12
        f.x += Math.cos(f.a) * f.s * dt * 60
        f.y += Math.sin(f.a) * f.s * dt * 60
        const ax = lx - f.x
        const ay = ly - f.y
        if (ax * ax + ay * ay < 48400) {
          f.x += ax * dt * 0.35
          f.y += ay * dt * 0.35
        }
        if (f.x < -20) f.x = w + 20
        else if (f.x > w + 20) f.x = -20
        if (f.y < -20) f.y = h + 20
        else if (f.y > h + 20) f.y = -20
        ctx.globalAlpha = 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(sec * 1.2 + f.p))
        ctx.drawImage(sprite, f.x - f.r, f.y - f.r, f.r * 2, f.r * 2)
      }
      ctx.globalAlpha = 0.85 + 0.15 * Math.sin(sec * 2.4)
      ctx.drawImage(sprite, lx - 36, ly - 36, 72, 72)
      ctx.globalAlpha = 1
      ctx.drawImage(sprite, lx - 12, ly - 12, 24, 24)
      ctx.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(tick)
    }

    const onVisibility = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onPointer, { passive: true })
    window.addEventListener('resize', measure)
    document.addEventListener('visibilitychange', onVisibility)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(remeasure)
      stopTracking()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('resize', measure)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      data-peek="false"
      className="pp-intro on-night fixed inset-0 z-[100] overflow-hidden bg-night text-on-night"
      style={{ backgroundImage: BG }}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="pp-in absolute inset-0 size-full" />
      <Moon shadeRef={shadeRef} glowRef={glowRef} />
      <Fence />

      <div ref={sceneRef} className="relative flex h-full flex-col items-center justify-center px-4 pt-16 pb-20 text-center">
        <button
          type="button"
          onClick={boop}
          aria-label={boops ? `Boop Biscuit (${boops} so far)` : 'Boop Biscuit'}
          className="pp-in relative w-[min(88vw,440px,calc(46svh*1.545))] cursor-pointer touch-manipulation rounded-[2rem] p-1 [-webkit-tap-highlight-color:transparent]"
        >
          <Biscuit
            refs={{ svgRef, dogRef, followRef, headRef, pupilRef, earRef, tailRef, bubbleRef, bubbleTextRef, heartsRef }}
          />
        </button>
        <p aria-hidden="true" className="pp-in pp-ui mt-3 font-display text-[clamp(1.15rem,1rem+0.8vw,1.5rem)] font-bold">
          <span ref={labelRef}>Waking Biscuit up…</span> <span ref={pctRef} className="tabular-nums text-sun">0%</span>
        </p>
        <p aria-hidden="true" className="pp-in pp-ui mt-1 min-h-6 text-sm text-on-night-muted">
          {boops ? (
            <>
              <span className="font-semibold text-sun">
                {boops} {boops === 1 ? 'boop' : 'boops'}
              </span>{' '}
              · he likes that
            </>
          ) : (
            'Psst: boop his nose. The firefly follows you.'
          )}
        </p>
        <div ref={pawsRef} aria-hidden="true" className="pp-in pp-ui mt-4 flex items-end gap-[clamp(6px,2.4vw,16px)]">
          {Array.from({ length: PAWS }, (_, i) => (
            <span
              key={i}
              className="pp-paw"
              data-on="false"
              style={{ '--py': `${i % 2 ? -7 : 3}px`, '--pr': `${i % 2 ? 98 : 82}deg` } as CSSProperties}
            >
              <PawPrint className="size-5" strokeWidth={2.5} />
            </span>
          ))}
        </div>
      </div>

      <p
        aria-hidden="true"
        className="pp-in pp-ui absolute left-4 top-[max(1rem,env(safe-area-inset-top))] flex h-11 items-center gap-2 font-display text-lg font-extrabold"
      >
        <span className="grid size-8 place-items-center rounded-full bg-primary text-white">
          <PawPrint className="size-4" />
        </span>
        PawPath
      </p>
      <button
        type="button"
        onClick={() => exitRef.current('skip')}
        className="pp-in pp-ui absolute right-4 top-[max(1rem,env(safe-area-inset-top))] inline-flex min-h-11 items-center rounded-full bg-night-2 px-4 text-sm font-semibold text-on-night ring-1 ring-white/25 transition-colors hover:bg-[#3a3058]"
      >
        Skip intro
      </button>
      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  )
}

function Moon({ shadeRef, glowRef }: { shadeRef: RefObject<SVGCircleElement | null>; glowRef: RefObject<SVGCircleElement | null> }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute right-[9%] top-[12%] w-[clamp(64px,15vmin,124px)]">
      <defs>
        <radialGradient id="pp-moon-glow">
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <mask id="pp-moon-mask">
          <rect width="100" height="100" fill="#fff" />
          <circle ref={shadeRef} cx="50" cy="50" r="31" fill="#000" transform="translate(-16 0)" />
        </mask>
      </defs>
      <circle ref={glowRef} cx="50" cy="50" r="50" fill="url(#pp-moon-glow)" opacity="0.25" />
      <circle cx="50" cy="50" r="30" fill="#fff1cf" mask="url(#pp-moon-mask)" />
    </svg>
  )
}

function Fence() {
  return (
    <svg aria-hidden="true" className="pp-in absolute inset-x-0 bottom-0 h-[72px] w-full">
      <defs>
        <pattern id="pp-picket" width="30" height="72" patternUnits="userSpaceOnUse">
          <path d="M7 72V20l8-10 8 10v52z" fill="#141124" />
        </pattern>
      </defs>
      <rect y="30" width="100%" height="8" fill="#141124" />
      <rect y="52" width="100%" height="8" fill="#141124" />
      <rect width="100%" height="72" fill="url(#pp-picket)" />
    </svg>
  )
}

type BiscuitRefs = {
  svgRef: RefObject<SVGSVGElement | null>
  dogRef: RefObject<SVGGElement | null>
  followRef: RefObject<SVGGElement | null>
  headRef: RefObject<SVGGElement | null>
  pupilRef: RefObject<SVGGElement | null>
  earRef: RefObject<SVGGElement | null>
  tailRef: RefObject<SVGGElement | null>
  bubbleRef: RefObject<SVGGElement | null>
  bubbleTextRef: RefObject<SVGTextElement | null>
  heartsRef: RefObject<SVGGElement | null>
}

const DISPLAY = 'Bricolage Grotesque, system-ui, sans-serif'

/** Biscuit, curled up asleep in front of his kennel (decorative; the <button> carries the label). */
function Biscuit({ refs: r }: { refs: BiscuitRefs }) {
  return (
    <svg ref={r.svgRef} aria-hidden="true" focusable="false" viewBox={`0 0 ${VB.w} ${VB.h}`} className="block h-auto w-full overflow-visible">
      <ellipse cx="170" cy="204" rx="165" ry="14" fill="#241e3a" />
      {/* kennel */}
      <rect x="26" y="96" width="116" height="102" rx="6" fill="#3b2f5c" />
      <path d="M30 130h108M30 164h108" stroke="#30264d" strokeWidth="3" />
      <path d="M12 104 84 44l72 60z" fill="#9a3412" />
      <path d="M12 104 84 44l72 60" fill="none" stroke="#c2410c" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M58 198v-48a26 26 0 0 1 52 0v48z" fill="#110d1d" />
      <rect x="59" y="107" width="50" height="15" rx="4" fill="#ffd27a" />
      <text x="84" y="118" textAnchor="middle" fontSize="8.5" fontWeight="800" letterSpacing="0.8" fill="#221b2e" fontFamily={DISPLAY}>
        BISCUIT
      </text>
      <path d="M126 199h30l-5-10h-20z" fill="#0f766e" />
      <ellipse cx="236" cy="200" rx="84" ry="7" fill="#000" opacity="0.35" />

      <g ref={r.dogRef}>
        <g className="pp-breathe">
          <g className="pp-sway">
            <g ref={r.tailRef}>
              <path d="M170 178c-26 2-38-16-26-28 8-8 18-2 12 6-6 6 0 16 16 14z" fill="#9c5c2b" />
            </g>
          </g>
          <ellipse cx="198" cy="178" rx="30" ry="22" fill="#a8652f" />
          <ellipse cx="236" cy="172" rx="62" ry="28" fill="#b9763f" />
          <ellipse cx="242" cy="188" rx="42" ry="10" fill="#d9a066" />
          <ellipse cx="300" cy="196" rx="19" ry="7.5" fill="#e3b07a" />
          <ellipse cx="276" cy="198" rx="16" ry="7" fill="#d9a066" />
          <path d="M264 144q10 14 4 34" stroke="#0f766e" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="268" cy="180" r="4.5" fill="#ffd27a" />
          <g ref={r.followRef} className="pp-follow">
            <g ref={r.headRef}>
              <path d="M290 138q10-12 20-2-8 8-20 2z" fill="#7a4520" />
              <ellipse cx="286" cy="160" rx="30" ry="25" fill="#b9763f" />
              <ellipse cx="312" cy="170" rx="19" ry="13" fill="#e3b07a" />
              <ellipse cx="327" cy="164" rx="6.5" ry="5" fill="#221b2e" />
              <circle cx="325" cy="162" r="1.6" fill="#fff" opacity="0.7" />
              <path d="M314 176q6 4 12-1" stroke="#221b2e" strokeWidth="2" fill="none" strokeLinecap="round" />
              <ellipse cx="300" cy="173" rx="5" ry="3" fill="#e8866a" opacity="0.6" />
              <path className="pp-eye-closed" d="M286 156q6 5 12 0" stroke="#221b2e" strokeWidth="2.6" fill="none" strokeLinecap="round" />
              <g className="pp-eye-open">
                <circle cx="292" cy="155" r="5.5" fill="#fff8f0" />
                <g ref={r.pupilRef}>
                  <circle cx="292.5" cy="155.5" r="3.6" fill="#221b2e" />
                  <circle cx="293.8" cy="154" r="1.1" fill="#fff" />
                </g>
              </g>
              <g ref={r.earRef}>
                <path d="M274 138c-16-6-28 6-24 30 2 9 13 9 17-2 3-10 7-16 13-23z" fill="#7a4520" />
              </g>
            </g>
          </g>
        </g>
      </g>

      <g className="pp-zzz" fill="#c9c2db" fontFamily={DISPLAY} fontWeight="800">
        <text className="pp-z" x="318" y="128" fontSize="14">
          z
        </text>
        <text className="pp-z" x="328" y="112" fontSize="18" style={{ animationDelay: '0.8s' }}>
          z
        </text>
        <text className="pp-z" x="338" y="94" fontSize="22" style={{ animationDelay: '1.6s' }}>
          Z
        </text>
      </g>

      <g ref={r.bubbleRef} opacity="0">
        <rect x="216" y="72" width="92" height="34" rx="17" fill="#fff8f0" />
        <path d="M244 104l-8 14 18-12z" fill="#fff8f0" />
        <text ref={r.bubbleTextRef} x="262" y="94" textAnchor="middle" fontSize="15" fontWeight="800" fill="#221b2e" fontFamily={DISPLAY}>
          Woof!
        </text>
      </g>

      <g ref={r.heartsRef}>
        {Array.from({ length: 8 }, (_, i) =>
          i % 2 ? (
            <path key={i} d="M0-6 1.5-1.5 6 0 1.5 1.5 0 6-1.5 1.5-6 0-1.5-1.5z" fill="#ffd27a" opacity="0" />
          ) : (
            <path key={i} d="M0 4C-7-2-4-9 0-5 4-9 7-2 0 4z" fill="#ff8fab" opacity="0" />
          ),
        )}
      </g>
    </svg>
  )
}
