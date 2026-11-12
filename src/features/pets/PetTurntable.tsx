import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, useAnimations, useGLTF } from '@react-three/drei'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { Color, Mesh, type Group, type Material, type MeshStandardMaterial } from 'three'
import { MODELS } from '@/data/models'
import type { Pet } from '@/data/types'

/**
 * Live 3D turntable of a pet's low-poly model (CC0, Quaternius). Lazy-loaded by PetProfilePage.
 * The canvas is decorative (aria-hidden); the figure caption + page text carry the meaning.
 */
export default function PetTurntable({
  pet,
  spinning,
  turnRequest,
}: {
  pet: Pet
  /** Auto-rotate on/off (Pause control lives in HTML outside the canvas). */
  spinning: boolean
  /** Incremented by the "Turn left/right" buttons: { id, delta radians }. */
  turnRequest: { id: number; delta: number }
}) {
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.8, 2.9], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'pan-y' }}
      onCreated={({ camera }) => camera.lookAt(0, 0.42, 0)}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[2.5, 4, 3]} intensity={2} />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} />
      <Suspense fallback={null}>
        <Model pet={pet} spinning={spinning} turnRequest={turnRequest} />
      </Suspense>
      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={3} blur={2.4} far={1.5} />
    </Canvas>
  )
}

function Model({
  pet,
  spinning,
  turnRequest,
}: {
  pet: Pet
  spinning: boolean
  turnRequest: { id: number; delta: number }
}) {
  const info = MODELS[pet.model]
  const { scene, animations } = useGLTF(info.url)
  const group = useRef<Group>(null)
  const target = useRef(0.6) // extra rotation queued by the turn buttons

  // Clone the (skinned) scene so several pets can share the cached GLTF, then tint cloned materials.
  const object = useMemo(() => {
    const copy = cloneSkinned(scene)
    // Flat-colour materials take the tint as-is. Texture-atlas materials multiply colour with the
    // texture, so a full-strength tint goes muddy: blend it towards white for those.
    const tint = new Color(pet.tint)
    const atlasTint = new Color('#ffffff').lerp(tint, 0.5)
    copy.traverse((child) => {
      if (!(child instanceof Mesh)) return
      const swap = (m: Material) => {
        if (!info.tintableMaterials.includes(m.name)) return m
        const next = m.clone() as MeshStandardMaterial
        if ('color' in next && next.color) next.color.copy(next.map ? atlasTint : tint)
        return next
      }
      child.material = Array.isArray(child.material) ? child.material.map(swap) : swap(child.material)
    })
    return copy
  }, [scene, pet.tint, info.tintableMaterials])

  const { actions } = useAnimations(animations, group)
  useEffect(() => {
    const name = info.clips.idle
    const action = name ? actions[name] : undefined
    action?.reset().fadeIn(0.2).play()
    return () => {
      action?.fadeOut(0.2)
    }
  }, [actions, info.clips.idle])

  useEffect(() => {
    if (turnRequest.id > 0) target.current += turnRequest.delta
  }, [turnRequest])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    if (spinning) g.rotation.y += dt * 0.5
    // ease any queued manual turn
    const step = target.current * Math.min(1, dt * 8)
    g.rotation.y += step
    target.current -= step
  })

  return (
    <group ref={group}>
      <primitive object={object} scale={info.scale} position-y={info.yOffset} />
    </group>
  )
}
