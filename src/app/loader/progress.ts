/**
 * Real loading progress for the intro, as a weighted mix (0..1):
 *   fonts 10% · 3D scene chunk 30% · GLB bytes 35% · story-ready signal 25%.
 * GLBs are prefetched with fetch() so drei's useGLTF then hits the HTTP cache.
 */
import { MODELS } from '@/data/models'
import { onStoryReady } from './loadSignals'

const W = { fonts: 0.1, scene: 0.3, models: 0.35, story: 0.25 }

export function trackLoading(onUpdate: (p: number) => void): () => void {
  let alive = true
  let fonts = 0
  let scene = 0
  let models = 0
  let story = 0
  const emit = () => {
    if (alive) onUpdate(W.fonts * fonts + W.scene * scene + W.models * models + W.story * story)
  }

  // 1 · Web fonts
  const fontsReady = document.fonts?.ready ?? Promise.resolve()
  fontsReady.then(
    () => ((fonts = 1), emit()),
    () => ((fonts = 1), emit()),
  )

  // 2 · The 3D scene chunk (Vite dedupes this with StoryPage's own lazy import)
  import('@/experience/StoryScene').then(
    () => ((scene = 1), emit()),
    () => ((scene = 1), emit()),
  )

  // 3 · GLB models: count bytes (content-length when available, manifest size otherwise)
  const files = Object.values(MODELS).map((m) => ({ url: m.url, total: Math.max(1, m.sizeKB * 1024), loaded: 0 }))
  const sumModels = () => {
    let l = 0
    let t = 0
    for (const f of files) {
      l += Math.min(f.loaded, f.total)
      t += f.total
    }
    models = t ? l / t : 1
    emit()
  }
  for (const f of files) {
    void (async () => {
      try {
        const res = await fetch(f.url)
        const len = Number(res.headers.get('content-length'))
        if (len > 0) f.total = len
        const reader = res.body?.getReader()
        if (reader) {
          for (;;) {
            const { done, value } = await reader.read()
            if (done) break
            f.loaded += value.byteLength
            sumModels()
          }
        } else await res.arrayBuffer()
      } catch {
        /* offline / blocked: never hold the intro hostage */
      }
      f.loaded = f.total
      sumModels()
    })()
  }

  // 4 · Story-ready signal from StoryPage's onReady
  const off = onStoryReady(() => {
    story = 1
    emit()
  })

  return () => {
    alive = false
    off()
  }
}
