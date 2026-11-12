/**
 * Shared, mutable story state. GSAP ScrollTrigger writes numbers here; the R3F scene reads them
 * inside useFrame and damps toward them. Nothing here triggers React re-renders.
 *
 * `chapter` is one global timeline: 0..1 Waiting, 1..2 Noticed, 2..3 The right fit,
 * 3..4 The walk home, 4..5 Home, 5..6 Your turn (end panel scrolling in).
 * The same timeline gates the HTML beats (see BEATS) so cards appear *because* something
 * happened in the scene.
 */
export const storyState = {
  chapter: 0,
}

/** Chapter section heights in svh. Tune pacing here. */
export const CHAPTER_VH = [150, 170, 230, 250, 230] as const

/** Story beats on the global timeline (chapter + local progress). Shared by scene and HTML. */
export const BEATS = {
  sniff: [0.3, 0.55] as const,
  doorOpen: 1.4, // door fully open → "someone noticed" card
  jump: [1.42, 1.55] as const,
  parade: [2.12, 2.29, 2.46, 2.63] as const, // each pet lands
  paradeLen: 0.15,
  fitCard: 2.06,
  fitPunch: 2.82,
  walkCard: 3.04,
  signs: [3.22, 3.5, 3.78] as const,
  houseIn: [4.0, 4.3] as const,
  sofaIn: [4.1, 4.35] as const,
  dogToBowl: [4.3, 4.55] as const,
  homeCard: 4.55,
  boneDrop: [4.58, 4.78] as const,
}

export type V3 = [number, number, number]

export interface Shot {
  cam: V3
  target: V3
  /** Tall-screen distance multiplier (§6.3). */
  tallMul?: number
  bg: string
  ground: string
  hemiSky: string
  hemiGround: string
  hemiI: number
  key: string
  keyI: number
}

const HOME_LIGHT = { bg: '#fff8f0', ground: '#f3e2cc', hemiSky: '#ffffff', hemiGround: '#e9c9a8', hemiI: 1.2, key: '#ffd9a8', keyI: 1.6 }

/** Camera framing + palette per chapter. The camera eases from the previous shot during the
 *  first 35% of each chapter, then holds (with small per-chapter moves added in the scene). */
export const SHOTS: Shot[] = [
  // 0 · Waiting (night)
  {
    cam: [1.5, 1.05, 4.3], target: [0, 0.45, 0],
    // Moonlight bright enough that Biscuit's brown coat reads against the night (was near-black).
    bg: '#1c1830', ground: '#2a2342', hemiSky: '#8682c4', hemiGround: '#2a2342', hemiI: 2.3, key: '#c4ccff', keyI: 2.8,
  },
  // 1 · Noticed (door + warm light)
  {
    cam: [2.3, 1.2, 4.0], target: [0.7, 0.5, -0.4],
    bg: '#2a2342', ground: '#342b52', hemiSky: '#8f84c2', hemiGround: '#342b52', hemiI: 2.3, key: '#ccd2ff', keyI: 2.4,
  },
  // 2 · The right fit (pet parade)
  {
    cam: [-0.7, 1.35, 6.4], target: [-0.7, 0.6, 0], tallMul: 1.9,
    bg: '#fbd9bf', ground: '#f2c6a4', hemiSky: '#ffe9d6', hemiGround: '#c99a7a', hemiI: 1.2, key: '#ffc9a0', keyI: 1.6,
  },
  // 3 · The walk home (side view treadmill)
  {
    cam: [0, 0.95, 4.4], target: [0, 0.55, 0], tallMul: 1.6,
    bg: '#ffe6cf', ground: '#e8c9a0', hemiSky: '#fff1de', hemiGround: '#d9b48a', hemiI: 1.2, key: '#ffb867', keyI: 1.7,
  },
  // 4 · Home
  { cam: [1.7, 1.25, 4.1], target: [0.1, 0.4, 0.3], ...HOME_LIGHT },
  // 5 · Your turn (everyone in a row)
  { cam: [-0.7, 0.9, 6.6], target: [-0.7, -0.35, 0], tallMul: 1.9, ...HOME_LIGHT },
]
