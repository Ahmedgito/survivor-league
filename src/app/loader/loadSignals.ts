/**
 * Story-ready signal for the intro loader.
 * StoryPage's existing `onReady` dispatches `window` event STORY_READY_EVENT (a one-line change,
 * no import), and anything can call `markStoryReady()` directly. Subscribers fire once.
 */
export const STORY_READY_EVENT = 'pawpath:story-ready'

type Listener = () => void
let ready = false
const listeners = new Set<Listener>()

export function markStoryReady() {
  if (ready) return
  ready = true
  listeners.forEach((l) => l())
  listeners.clear()
}

export const isStoryReady = () => ready

/** Calls `cb` once when the 3D story has mounted (immediately if it already has). Returns unsubscribe. */
export function onStoryReady(cb: Listener): () => void {
  if (ready) {
    cb()
    return () => {}
  }
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

if (typeof window !== 'undefined') window.addEventListener(STORY_READY_EVENT, markStoryReady)
