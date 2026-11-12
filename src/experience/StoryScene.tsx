/**
 * StoryScene — the single fixed R3F canvas behind the scroll story (lazy-loaded chunk).
 *
 * Scroll is the puppeteer: `storyState.chapter` (one global timeline written by ScrollTrigger)
 * is damped into `cur`, and its time-derivative is the scroll velocity. Travel beats map scroll
 * position to a path (so scrolling back walks Biscuit back, turned around) and scroll velocity
 * to the clip (still → Idle, slow → Walk, fast → Run, with matching timeScale).
 * Decorative only: the wrapper is aria-hidden and every beat is also told in HTML.
 */
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame, useThree, type ThreeElements } from '@react-three/fiber'
import { Sparkles, useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { MODELS, type ModelKey } from '@/data/models'
import { BEATS, SHOTS, storyState, type Shot } from './storyState'

export type Tier = 'low' | 'mid' | 'high'

/* ------------------------------------------------------------------ helpers */

const damp = THREE.MathUtils.damp
const lerp = THREE.MathUtils.lerp
const smooth = (t: number) => t * t * (3 - 2 * t)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
const range = (c: number, a: number, b: number) => clamp01((c - a) / (b - a))
const HALF_PI = Math.PI / 2
/** Wide screens: pull the camera back a bit so the left-hand card never crops the action. */
const WIDE_MUL = 1.15
const TREAD_LEN = 18
const TREAD_SPEED = 14 // world units travelled across the walk-home chapter

function bounceOut(t: number) {
  const n = 7.5625
  const d = 2.75
  if (t < 1 / d) return n * t * t
  if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75
  if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375
  return n * (t -= 2.625 / d) * t + 0.984375
}

/** Damp an angle along the shortest arc. */
function dampAngle(from: number, to: number, lambda: number, dt: number) {
  const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + delta * (1 - Math.exp(-lambda * dt))
}

/** Quaternius/KayKit exports ship metalness ≈ 1, which renders near-black without an env map. */
function matte<T extends THREE.Object3D>(obj: T): T {
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    const fix = (m: THREE.Material) => {
      const c = m.clone() as THREE.MeshStandardMaterial
      if ('metalness' in c) c.metalness = 0
      if ('roughness' in c) c.roughness = Math.max(c.roughness ?? 1, 0.7)
      return c
    }
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(fix) : fix(mesh.material)
  })
  return obj
}

/** Live (damped) values shared between scene parts. Mutated in useFrame only. */
const live = { cur: 0, speed: 0, kennel: 1, door: 0, tread: 0, treadOffset: 0, home: 0 }

type GroupProps = ThreeElements['group']

/** A static GLB prop, normalised by the manifest (≈1 unit tall, standing on y=0). */
function Prop({ k, size = 1, ...rest }: { k: ModelKey; size?: number } & GroupProps) {
  const { scene } = useGLTF(MODELS[k].url)
  const obj = useMemo(() => matte(scene.clone(true)), [scene])
  const m = MODELS[k]
  return (
    <group {...rest}>
      <primitive object={obj} scale={m.scale * size} position-y={m.yOffset * size} />
    </group>
  )
}

/* ------------------------------------------------------------------ characters */

type CharKey = 'dog' | 'cat' | 'rabbit' | 'shiba' | 'husky'
type Alias = 'idle' | 'walk' | 'run' | 'eat' | 'jumpStart' | 'jump'

interface Actor {
  group: THREE.Group
  /** Cross-fade to a clip alias; timeScale is updated on every call. */
  play: (alias: Alias, timeScale?: number, fade?: number) => void
  rot: number
}

function Character({ k, onActor }: { k: CharKey; onActor: (k: CharKey, a: Actor) => void }) {
  const { scene, animations } = useGLTF(MODELS[k].url)
  const obj = useMemo(() => matte(skeletonClone(scene)), [scene])
  const group = useRef<THREE.Group>(null)
  const root = useRef<THREE.Group>(null)
  const { actions } = useAnimations(animations, root)
  const m = MODELS[k]

  useEffect(() => {
    if (!group.current) return
    let current: THREE.AnimationAction | null = null
    let currentName = ''
    const actor: Actor = {
      group: group.current,
      rot: 0,
      play(alias, timeScale = 1, fade = 0.25) {
        const name = m.clips[alias] ?? m.clips.idle
        if (!name) return
        const a = actions[name]
        if (!a) return
        a.timeScale = timeScale
        if (name === currentName) return
        a.reset().setEffectiveWeight(1)
        if (alias === 'jumpStart') {
          a.setLoop(THREE.LoopOnce, 1)
          a.clampWhenFinished = true
        }
        a.fadeIn(current ? fade : 0).play()
        current?.fadeOut(fade)
        current = a
        currentName = name
      },
    }
    actor.play('idle')
    onActor(k, actor)
  }, [actions, k, m, onActor])

  return (
    <group ref={group} visible={k === 'dog'}>
      <group ref={root}>
        <primitive object={obj} scale={m.scale} position-y={m.yOffset} />
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ sets */

/** Visibility helper: `sink` drops the group into the ground; `scale` grows it. */
function useShow(getter: () => number, mode: 'scale' | 'sink' = 'sink') {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    const g = ref.current
    if (!g) return
    const v = getter()
    g.visible = v > 0.01
    if (mode === 'scale') g.scale.setScalar(Math.max(0.0001, smooth(clamp01(v))))
    else g.position.y = (smooth(clamp01(v)) - 1) * 3.5
  })
  return ref
}

function Shelter({ tier, tall }: { tier: Tier; tall: boolean }) {
  const ref = useShow(() => live.kennel)
  const doorRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.MeshStandardMaterial>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  const flies = useRef<THREE.Group>(null)
  useFrame(() => {
    const d = live.door
    if (doorRef.current) doorRef.current.rotation.y = -1.75 * d
    if (glowRef.current) glowRef.current.emissiveIntensity = 0.1 + 1.8 * d
    if (lightRef.current) lightRef.current.intensity = 14 * d
    if (flies.current) flies.current.visible = live.cur < 1.9
  })
  return (
    <group ref={ref}>
      {/* shelter wall with the door */}
      <mesh position={[0.4, 1.2, -1.45]}>
        <boxGeometry args={[6, 2.4, 0.15]} />
        <meshStandardMaterial color="#2e2848" roughness={1} />
      </mesh>
      {/* the small cabin works as Biscuit's kennel */}
      <Prop k="house" size={1.25} position={[-1.15, 0, -0.75]} rotation-y={0.5} />
      {/* fence in front of him */}
      <Prop k="fence" size={0.5} position={[-0.55, 0, 0.75]} />
      <Prop k="fence" size={0.5} position={[0.55, 0, 0.75]} />
      <mesh position={[-0.35, 0.05, 0.05]} scale={[1, 1, 0.75]}>
        <cylinderGeometry args={[0.5, 0.52, 0.1, 24]} />
        <meshStandardMaterial color="#5b4a7a" roughness={1} />
      </mesh>
      <Prop k="bowl" size={0.17} position={[0.5, 0, 0.25]} />
      {/* door (hinge on its right edge) + warm doorway */}
      <group position={[1.75, 0, -1.36]}>
        <mesh position={[-0.46, 0.95, -0.02]}>
          <planeGeometry args={[0.92, 1.9]} />
          <meshStandardMaterial ref={glowRef} color="#ffc48a" emissive="#ffc48a" emissiveIntensity={0.1} />
        </mesh>
        <group ref={doorRef}>
          <Prop k="door" size={1.9} />
        </group>
        <pointLight ref={lightRef} position={[-0.5, 1.2, 1.0]} color="#ffc48a" intensity={0} distance={8} decay={1.5} />
      </group>
      {tier !== 'low' && !tall && (
        <group ref={flies}>
          <Sparkles count={28} color="#ffd27a" size={4} scale={[6, 2.2, 3.5]} position={[0, 1.2, -0.2]} speed={0.35} opacity={0.9} />
        </group>
      )}
    </group>
  )
}

function Signpost({ label }: { label: number }) {
  return (
    <group>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.07, 1, 0.07]} />
        <meshStandardMaterial color="#7a4a2a" />
      </mesh>
      <mesh position={[0, 0.92, 0.02]}>
        <boxGeometry args={[0.55, 0.3, 0.05]} />
        <meshStandardMaterial color="#c2410c" />
      </mesh>
      {Array.from({ length: label }, (_, i) => (
        <mesh key={i} position={[(-0.12 * (label - 1)) / 2 + 0.12 * i, 0.92, 0.05]} rotation-x={HALF_PI}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
          <meshStandardMaterial color="#fff8f0" />
        </mesh>
      ))}
    </group>
  )
}

function Treadmill({ tier }: { tier: Tier }) {
  const ref = useShow(() => live.tread)
  const count = tier === 'low' ? 6 : 12
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const tree = i % 2 === 0
        return { tree, x: (i / count) * TREAD_LEN, z: tree ? -2.3 - (i % 4 === 0 ? 1.1 : 0) : -1.0, size: tree ? 2.2 + (i % 3) * 0.4 : 0.5 }
      }),
    [count],
  )
  const movers = useRef<(THREE.Group | null)[]>([])
  const signs = useRef<(THREE.Group | null)[]>([])
  useFrame(() => {
    const off = live.treadOffset
    for (let i = 0; i < items.length; i++) {
      const g = movers.current[i]
      if (g) g.position.x = ((((items[i].x - off) % TREAD_LEN) + TREAD_LEN) % TREAD_LEN) - TREAD_LEN / 2
    }
    BEATS.signs.forEach((s, i) => {
      const g = signs.current[i]
      if (g) g.position.x = (s - 3) * TREAD_SPEED + 0.35 - off
    })
  })
  return (
    <group ref={ref}>
      <mesh rotation-x={-HALF_PI} position={[0, 0.004, 0]}>
        <planeGeometry args={[40, 1.1]} />
        <meshStandardMaterial color="#e2b98a" roughness={1} />
      </mesh>
      {items.map((it, i) => (
        <group key={i} ref={(g) => { movers.current[i] = g }} position={[it.x, 0, it.z]}>
          <Prop k={it.tree ? 'tree' : 'fence'} size={it.size} />
        </group>
      ))}
      {BEATS.signs.map((_, i) => (
        <group key={i} ref={(g) => { signs.current[i] = g }} position={[10, 0, -0.65]}>
          <Signpost label={i + 1} />
        </group>
      ))}
    </group>
  )
}

function HomeSet({ tier }: { tier: Tier }) {
  const ref = useShow(() => live.home, 'scale')
  const house = useRef<THREE.Group>(null)
  const sofa = useRef<THREE.Group>(null)
  const bone = useRef<THREE.Group>(null)
  useFrame(() => {
    const c = live.cur
    if (house.current) house.current.position.x = -2.1 - 7 * (1 - smooth(range(c, ...BEATS.houseIn)))
    if (sofa.current) sofa.current.position.x = 1.8 + 7 * (1 - smooth(range(c, ...BEATS.sofaIn)))
    if (bone.current) {
      const t = range(c, ...BEATS.boneDrop)
      bone.current.visible = t > 0
      bone.current.position.y = 2.6 * (1 - bounceOut(t))
    }
  })
  return (
    <group ref={ref}>
      <mesh rotation-x={-HALF_PI} position={[0.15, 0.006, 0.45]}>
        <circleGeometry args={[1.2, 40]} />
        <meshStandardMaterial color="#e9a27c" roughness={1} />
      </mesh>
      <group ref={house} position={[-2.1, 0, -2.4]}>
        <Prop k="house" size={2.3} rotation-y={0.35} />
      </group>
      <group ref={sofa} position={[1.8, 0, -1.2]}>
        <Prop k="sofa" size={1.15} rotation-y={-0.5} />
      </group>
      {tier !== 'low' && <Prop k="plant" size={0.9} position={[-1.4, 0, -0.4]} />}
      <Prop k="bowl" size={0.17} position={[0.7, 0, 0.5]} />
      <group ref={bone} position={[-0.4, 0, 0.95]}>
        <Prop k="bone" size={0.17} rotation-y={0.6} />
      </group>
    </group>
  )
}

function Bird({ birdRef }: { birdRef: RefObject<THREE.Group | null> }) {
  return (
    <group ref={birdRef} visible={false}>
      <Prop k="bird" size={0.45} />
    </group>
  )
}

/* ------------------------------------------------------------------ choreography */

const PARADE: { k: Exclude<CharKey, 'dog'>; x: number }[] = [
  { k: 'cat', x: -2.1 },
  { k: 'rabbit', x: -1.05 },
  { k: 'shiba', x: 1.05 },
  { k: 'husky', x: 2.1 },
]
const DOG_SPOT = new THREE.Vector3(0, 0, 0.5)
const DOOR_FRONT = new THREE.Vector3(1.2, 0, -0.75)
const DOOR_ROT = Math.atan2(DOOR_FRONT.x, DOOR_FRONT.z)

interface Beat {
  x: number
  z: number
  y: number
  rot: number
  clip: Alias
  ts: number
}

/** Pick a locomotion clip from scroll velocity. Backwards scroll = turn around and walk back. */
function travel(b: Beat, speed: number, forwardRot: number) {
  const s = Math.abs(speed)
  if (s < 0.035) {
    b.clip = 'idle'
    b.rot = forwardRot - Math.sign(Math.sin(forwardRot) || 1) * 0.55 // glance toward the camera
    b.ts = 1
    return
  }
  const run = s > 0.75
  b.clip = run ? 'run' : 'walk'
  b.ts = THREE.MathUtils.clamp(s / (run ? 0.9 : 0.32), 0.6, 1.8)
  b.rot = speed > 0 ? forwardRot : forwardRot + Math.PI
}

function dogBeat(c: number, speed: number, b: Beat) {
  b.y = 0
  b.ts = 1
  if (c < 1) {
    b.x = 0
    b.z = 0
    b.rot = -0.5
    b.clip = c > BEATS.sniff[0] && c < BEATS.sniff[1] ? 'eat' : 'idle'
  } else if (c < 2) {
    const [j0, j1] = BEATS.jump
    if (c < j0) {
      b.x = 0
      b.z = 0
      b.clip = 'idle'
      b.rot = lerp(-0.5, DOOR_ROT, smooth(range(c, 1.05, 1.35)))
    } else if (c < j1) {
      const t = range(c, j0, j1)
      b.x = 0
      b.z = 0
      b.rot = DOOR_ROT
      b.y = Math.sin(Math.PI * t) * 0.35
      b.clip = t < 0.3 ? 'jumpStart' : 'jump'
    } else {
      const t = smooth(range(c, j1, 1.9))
      b.x = DOOR_FRONT.x * t
      b.z = DOOR_FRONT.z * t
      if (t > 0 && t < 1) travel(b, speed, DOOR_ROT)
      else {
        b.clip = 'idle'
        b.rot = t >= 1 ? DOOR_ROT - 0.6 : DOOR_ROT
      }
    }
  } else if (c < 3) {
    const t = smooth(range(c, 2.0, 2.1))
    b.x = lerp(DOOR_FRONT.x, DOG_SPOT.x, t)
    b.z = lerp(DOOR_FRONT.z, DOG_SPOT.z, t)
    if (t > 0 && t < 1) travel(b, speed, Math.atan2(DOG_SPOT.x - DOOR_FRONT.x, DOG_SPOT.z - DOOR_FRONT.z))
    else {
      b.clip = 'idle'
      b.rot = 0
    }
  } else if (c < 4) {
    b.x = 0
    b.z = 0
    travel(b, speed, HALF_PI)
  } else if (c < 5) {
    const t = smooth(range(c, ...BEATS.dogToBowl))
    b.x = lerp(-1.3, 0.15, t)
    b.z = lerp(0.95, 0.5, t)
    if (t <= 0) {
      b.clip = 'idle'
      b.rot = 0.7
    } else if (t < 1) travel(b, speed, Math.atan2(1.45, -0.45))
    else {
      b.clip = 'eat'
      b.rot = HALF_PI
    }
  } else {
    b.x = DOG_SPOT.x
    b.z = DOG_SPOT.z
    b.rot = 0
    b.clip = 'idle'
  }
}

/* ------------------------------------------------------------------ director */

const tmpCol = new THREE.Color()
const camGoal = new THREE.Vector3()
const tgtGoal = new THREE.Vector3()
const v3a = new THREE.Vector3()
const v3b = new THREE.Vector3()

function shotVecs(s: Shot, tall: boolean, outCam: THREE.Vector3, outTgt: THREE.Vector3) {
  outTgt.set(...s.target)
  const mul = tall ? (s.tallMul ?? 1.5) * 1.3 : WIDE_MUL
  outCam.set(...s.cam).sub(outTgt).multiplyScalar(mul).add(outTgt)
  // Front-on shots are shifted left on wide screens to clear the card column; centre them when tall.
  if (tall && s.cam[0] === s.target[0]) {
    outCam.x -= outTgt.x
    outTgt.x = 0
  }
}

const SHOT_COLORS = SHOTS.map((s) => ({
  bg: new THREE.Color(s.bg),
  ground: new THREE.Color(s.ground),
  hemiSky: new THREE.Color(s.hemiSky),
  hemiGround: new THREE.Color(s.hemiGround),
  key: new THREE.Color(s.key),
}))
const WARM = new THREE.Color('#ffc48a')

function World({ tier, onReady }: { tier: Tier; onReady: () => void }) {
  const { camera, scene, size, invalidate } = useThree()
  const tall = size.width / size.height < 0.8

  const cast = useRef<Partial<Record<CharKey, Actor>>>({})
  const onActor = useMemo(
    () => (k: CharKey, a: Actor) => {
      cast.current[k] = a
    },
    [],
  )
  const birdRef = useRef<THREE.Group>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const key = useRef<THREE.DirectionalLight>(null)
  const groundMat = useRef<THREE.MeshStandardMaterial>(null)
  const camPos = useRef(new THREE.Vector3())
  const camTgt = useRef(new THREE.Vector3())
  const first = useRef(true)
  const beat = useRef<Beat>({ x: 0, z: 0, y: 0, rot: 0, clip: 'idle', ts: 1 })

  useLayoutEffect(() => {
    scene.background = new THREE.Color(SHOTS[0].bg)
    scene.fog = new THREE.Fog(SHOTS[0].bg, 10, 26)
    return () => {
      scene.background = null
      scene.fog = null
    }
  }, [scene])

  // Framing: wide → action right of centre (card on the left); tall → action in the upper part.
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const { width: w, height: h } = size
    if (tall) cam.setViewOffset(w, h, 0, h * 0.2, w, h)
    else cam.setViewOffset(w, h, -w * 0.17, 0, w, h)
    cam.updateProjectionMatrix()
    invalidate()
  }, [camera, size, tall, invalidate])

  useEffect(() => {
    onReady()
  }, [onReady])

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const snap = first.current
    const goal = storyState.chapter
    const prev = live.cur
    live.cur = snap ? goal : damp(live.cur, goal, 5, dt)
    const c = Math.min(Math.max(live.cur, 0), 6)
    // Scroll velocity in chapters/second (damped → eases to 0 ≈ 0.4s after scrolling stops).
    live.speed = snap ? 0 : damp(live.speed, (live.cur - prev) / Math.max(dt, 1e-4), 8, dt)
    const speed = live.speed
    const time = state.clock.elapsedTime

    /* camera + palette */
    const k = Math.min(Math.floor(c), SHOTS.length - 1)
    const f = c - k
    const from = SHOTS[Math.max(k - 1, 0)]
    const to = SHOTS[k]
    const w = k === 0 ? 1 : smooth(clamp01(f / 0.35))
    shotVecs(from, tall, v3a, v3b)
    shotVecs(to, tall, camGoal, tgtGoal)
    camGoal.lerpVectors(v3a, camGoal, w)
    tgtGoal.lerpVectors(v3b, tgtGoal, w)
    if (k === 0) camGoal.lerp(tgtGoal, 0.22 * smooth(f)) // slow dolly-in on the waiting dog
    if (k === 3) camGoal.x += lerp(-0.25, 0.25, f)
    if (k === 4) camGoal.add(v3a.set(0.5, 0.7, 0.9).multiplyScalar(smooth(range(c, 4.5, 5)))) // pull up and back
    if (snap) {
      camPos.current.copy(camGoal)
      camTgt.current.copy(tgtGoal)
    } else {
      const a = 1 - Math.exp(-4 * dt)
      camPos.current.lerp(camGoal, a)
      camTgt.current.lerp(tgtGoal, a)
    }
    state.camera.position.copy(camPos.current)
    state.camera.lookAt(camTgt.current)

    const cA = SHOT_COLORS[Math.max(k - 1, 0)]
    const cB = SHOT_COLORS[k]
    const ca = snap ? 1 : 1 - Math.exp(-6 * dt)
    const d = (x: number, y: number) => (snap ? y : damp(x, y, 6, dt))
    const bg = scene.background as THREE.Color
    bg.lerp(tmpCol.lerpColors(cA.bg, cB.bg, w), ca)
    ;(scene.fog as THREE.Fog).color.copy(bg)
    groundMat.current?.color.lerp(tmpCol.lerpColors(cA.ground, cB.ground, w), ca)
    live.door = c < 2.3 ? smooth(range(c, 1.0, BEATS.doorOpen)) : 0
    if (hemi.current) {
      hemi.current.color.lerp(tmpCol.lerpColors(cA.hemiSky, cB.hemiSky, w).lerp(WARM, 0.35 * live.door), ca)
      hemi.current.groundColor.lerp(tmpCol.lerpColors(cA.hemiGround, cB.hemiGround, w), ca)
      hemi.current.intensity = d(hemi.current.intensity, lerp(from.hemiI, to.hemiI, w))
    }
    if (key.current) {
      key.current.color.lerp(tmpCol.lerpColors(cA.key, cB.key, w).lerp(WARM, 0.5 * live.door), ca)
      key.current.intensity = d(key.current.intensity, lerp(from.keyI, to.keyI, w))
    }

    /* sets */
    live.kennel = 1 - range(c, 2.0, 2.3)
    live.tread = range(c, 2.85, 3.05) * (1 - range(c, 3.95, 4.1))
    live.home = range(c, 3.95, 4.15)
    live.treadOffset = clamp01(c - 3) * TREAD_SPEED

    /* Biscuit */
    const dog = cast.current.dog
    if (dog) {
      const b = beat.current
      dogBeat(c, speed, b)
      const g = dog.group
      if (snap) {
        g.position.set(b.x, b.y, b.z)
        dog.rot = b.rot
      } else {
        g.position.x = damp(g.position.x, b.x, 8, dt)
        g.position.z = damp(g.position.z, b.z, 8, dt)
        g.position.y = damp(g.position.y, b.y, 14, dt)
        dog.rot = dampAngle(dog.rot, b.rot, 7, dt)
      }
      if (c >= 5) g.position.y = Math.abs(Math.sin(time * 3.2)) * 0.1 * range(c, 5, 5.3) // happy hop
      g.rotation.y = dog.rot
      dog.play(b.clip, b.ts, 0.25)
    }

    /* the parade: each pet walks in from the right, lands, then idles */
    PARADE.forEach((p, i) => {
      const a = cast.current[p.k]
      if (!a) return
      const g = a.group
      const lineup = c >= 5
      const start = BEATS.parade[i]
      const t = range(c, start, start + BEATS.paradeLen)
      const inParade = c >= start && c < 2.97
      g.visible = inParade || lineup
      if (!g.visible) return
      const spot = tall ? p.x * 0.78 : p.x // tighter row on portrait screens
      let x = spot
      let rot = 0
      let clip: Alias = 'idle'
      let ts = 1
      if (lineup) {
        g.scale.setScalar(Math.max(0.001, smooth(range(c, 5, 5.3))))
      } else {
        g.scale.setScalar(1)
        x = lerp(6, spot, smooth(t))
        if (t < 1) {
          const tb: Beat = { x, z: 0, y: 0, rot: 0, clip: 'walk', ts: 1 }
          travel(tb, speed, -HALF_PI)
          rot = tb.rot
          clip = tb.clip
          ts = tb.ts
        }
      }
      g.position.set(snap || lineup ? x : damp(g.position.x, x, 8, dt), 0, -0.15)
      a.rot = snap ? rot : dampAngle(a.rot, rot, 7, dt)
      g.rotation.y = a.rot
      a.play(clip, ts)
    })

    /* the bird: arcs across the parade, follows the walk home, hovers at the end */
    const bird = birdRef.current
    if (bird) {
      const bob = Math.sin(time * 5) * 0.06
      let vis = true
      if (c >= 2 && c < 3) {
        const l = c - 2
        bird.position.set(lerp(-5, 5, l), 2.0 + Math.sin(Math.PI * l) * 0.5 + bob, -0.6)
        bird.rotation.set(0, HALF_PI, Math.sin(time * 9) * 0.12)
      } else if (c >= 3 && c < 4) {
        bird.position.set(-0.35, 1.75 + bob, -0.25)
        bird.rotation.set(0, speed >= 0 ? HALF_PI : -HALF_PI, Math.sin(time * 9) * 0.12)
      } else if (c >= 5) {
        bird.position.set(0, 1.5 + bob, 0.1)
        bird.rotation.set(0, 0, 0)
      } else vis = false
      bird.visible = vis
    }

    first.current = false
  })

  return (
    <>
      <hemisphereLight ref={hemi} args={['#5a5a9a', '#1c1830', 1.6]} />
      <directionalLight ref={key} position={[-3, 4, 3]} intensity={2.2} color="#a8b8ff" />
      <mesh rotation-x={-HALF_PI}>
        <circleGeometry args={[30, 48]} />
        <meshStandardMaterial ref={groundMat} color={SHOTS[0].ground} roughness={1} />
      </mesh>

      <Character k="dog" onActor={onActor} />
      <Shelter tier={tier} tall={tall} />
      <Treadmill tier={tall && tier === 'high' ? 'mid' : tier} />
      <HomeSet tier={tier} />
      {/* The parade cast streams in after Biscuit is on screen. */}
      <Suspense fallback={null}>
        {PARADE.map((p) => (
          <Character key={p.k} k={p.k} onActor={onActor} />
        ))}
        <Bird birdRef={birdRef} />
      </Suspense>
    </>
  )
}

useGLTF.preload(MODELS.dog.url)

export default function StoryScene({ tier, active, onReady }: { tier: Tier; active: boolean; onReady: () => void }) {
  return (
    <Canvas
      flat
      dpr={tier === 'low' ? 1 : tier === 'mid' ? [1, 1.5] : [1, 1.75]}
      gl={{ antialias: tier !== 'low', powerPreference: 'high-performance' }}
      camera={{ fov: 35, near: 0.1, far: 60, position: [1.5, 1.05, 4.3] }}
      frameloop={active ? 'always' : 'never'}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Suspense fallback={null}>
        <World tier={tier} onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
