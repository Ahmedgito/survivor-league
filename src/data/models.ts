// 3D model manifest. Generated from `node scripts/inspect-models.mjs` and
// `node scripts/pose-bounds.mjs` output (see docs/plan/02-assets.md).
// All models are CC0 from Poly Pizza. Pets: Quaternius. Bone/Bowl: KayKit (Kay Lousberg).
//
// Usage with drei:
//   const { scene, animations } = useGLTF(MODELS.dog.url)   // meshopt is decoded automatically
//   <primitive object={scene} scale={MODELS.dog.scale} position-y={MODELS.dog.yOffset} />
//   actions[MODELS.dog.clips.idle!]?.play()
// `scale` makes the model about 1 unit tall (pose at frame 0 of the idle clip); `yOffset` (already
// multiplied by `scale`) puts the lowest point on y = 0. Every model faces +Z after loading.

export type ModelKey =
  | 'dog' | 'cat' | 'rabbit' | 'shiba' | 'husky' | 'goldfish' | 'bird'
  | 'bone' | 'bowl' | 'sofa' | 'door' | 'fence' | 'plant' | 'tree' | 'house'

export interface ModelInfo {
  key: ModelKey
  url: string
  clips: { idle?: string; walk?: string; run?: string; [k: string]: string | undefined }
  allClips: string[]
  /** Multiply to normalise height to ~1 unit. */
  scale: number
  /** Y position (after scaling) that puts the lowest point on the ground. */
  yOffset: number
  facing: '+z' | '-z'
  /** Material names whose `.color` can be changed to tint the model (flat-colour materials).
   *  Texture-atlas models list their single atlas material: tinting it multiplies the whole body. */
  tintableMaterials: string[]
  sizeKB: number
  /** Extra info, not required by consumers. */
  kind: 'pet' | 'prop'
  tris: number
  /** Raw height in model units before `scale`. */
  rawHeight: number
  credit: { author: string; license: 'CC0' | 'CC-BY 3.0' | 'CC-BY 4.0'; source: string }
}

const quaternius = (source: string) => ({ author: 'Quaternius', license: 'CC0' as const, source })
const kaykit = (source: string) => ({ author: 'Kay Lousberg (KayKit)', license: 'CC0' as const, source })

export const MODELS: Record<ModelKey, ModelInfo> = {
  dog: {
    key: 'dog', url: '/models/dog.glb', kind: 'pet',
    clips: { idle: 'Idle', walk: 'Walk', run: 'Run', eat: 'Idle_Eating', jumpStart: 'Jump_Start', jump: 'Jump_Loop', headbutt: 'Headbutt', death: 'Death' },
    allClips: ['Death', 'Headbutt', 'Idle', 'Idle_Eating', 'Jump_Loop', 'Jump_Start', 'Run', 'Walk'],
    scale: 0.527, yOffset: 0.011, facing: '+z', tintableMaterials: ['AtlasMaterial'],
    sizeKB: 73.9, tris: 3604, rawHeight: 1.898,
    credit: quaternius('https://poly.pizza/m/2kUk0QqpCg'),
  },
  cat: {
    key: 'cat', url: '/models/cat.glb', kind: 'pet',
    clips: { idle: 'Idle', walk: 'Walk', run: 'Run', eat: 'Idle_Eating', jumpStart: 'Jump_Start', jump: 'Jump_Loop', headbutt: 'Headbutt', death: 'Death' },
    allClips: ['Death', 'Headbutt', 'Idle', 'Idle_Eating', 'Jump_Loop', 'Jump_Start', 'Run', 'Walk'],
    scale: 0.536, yOffset: -0.003, facing: '+z', tintableMaterials: ['AtlasMaterial'],
    sizeKB: 65.4, tris: 2448, rawHeight: 1.867,
    credit: quaternius('https://poly.pizza/m/qKICY6xla2'),
  },
  rabbit: {
    key: 'rabbit', url: '/models/rabbit.glb', kind: 'pet',
    clips: {
      idle: 'Idle', walk: 'Walk', run: 'Run', jump: 'Jump', jumpIdle: 'Jump_Idle', land: 'Jump_Land',
      wave: 'Wave', yes: 'Yes', no: 'No', sitStart: 'Sitting_Start', sit: 'Sitting_Idle', sitEnd: 'Sitting_End',
      sitEat: 'Sitting_Eating', duck: 'Duck', hit: 'HitReact', death: 'Death',
    },
    allClips: ['Assembly_End', 'Assembly_Loop', 'Assembly_Start', 'Chop_End', 'Chop_Loop', 'Chop_Start', 'Death', 'Duck', 'HitReact', 'Idle', 'Idle_Holding', 'Jump', 'Jump_Idle', 'Jump_Land', 'No', 'Pan_End', 'Pan_Loop', 'Pan_Start', 'Punch', 'Run', 'Run_Holding', 'Sitting_Eating', 'Sitting_End', 'Sitting_Idle', 'Sitting_Start', 'Sword', 'Walk', 'Walk_Holding', 'Wave', 'Yes'],
    scale: 0.25, yOffset: 0.002, facing: '+z', tintableMaterials: ['AtlasMaterial'],
    sizeKB: 295.1, tris: 2282, rawHeight: 4.005,
    credit: quaternius('https://poly.pizza/m/mKev485XTR'),
  },
  shiba: {
    key: 'shiba', url: '/models/shiba.glb', kind: 'pet',
    clips: {
      idle: 'Idle', idle2: 'Idle_2', sniff: 'Idle_2_HeadLow', walk: 'Walk', run: 'Gallop', jump: 'Gallop_Jump',
      land: 'Jump_ToIdle', eat: 'Eating', hitLeft: 'Idle_HitReact_Left', hitRight: 'Idle_HitReact_Right', attack: 'Attack', death: 'Death',
    },
    allClips: ['Attack', 'Death', 'Eating', 'Gallop', 'Gallop_Jump', 'Idle_HitReact_Left', 'Idle_HitReact_Right', 'Jump_ToIdle', 'Walk', 'Idle_2_HeadLow', 'Idle_2', 'Idle'],
    scale: 0.324, yOffset: -0.001, facing: '+z', tintableMaterials: ['Main', 'Main_Light'],
    sizeKB: 276.5, tris: 1950, rawHeight: 3.087,
    credit: quaternius('https://poly.pizza/m/y4wdQpg767'),
  },
  husky: {
    key: 'husky', url: '/models/husky.glb', kind: 'pet',
    clips: {
      idle: 'Idle', idle2: 'Idle_2', sniff: 'Idle_2_HeadLow', walk: 'Walk', run: 'Gallop', jump: 'Gallop_Jump',
      land: 'Jump_ToIdle', eat: 'Eating', hitLeft: 'Idle_HitReact_Left', hitRight: 'Idle_HitReact_Right', attack: 'Attack', death: 'Death',
    },
    allClips: ['Attack', 'Death', 'Eating', 'Gallop', 'Gallop_Jump', 'Idle_HitReact_Left', 'Idle_HitReact_Right', 'Jump_ToIdle', 'Walk', 'Idle_2', 'Idle_2_HeadLow', 'Idle'],
    scale: 0.314, yOffset: -0.001, facing: '+z', tintableMaterials: ['Main', 'Main_Light'],
    sizeKB: 292.9, tris: 1920, rawHeight: 3.183,
    credit: quaternius('https://poly.pizza/m/wcWiuEqwzq'),
  },
  goldfish: {
    key: 'goldfish', url: '/models/goldfish.glb', kind: 'pet',
    // Origin is at the body centre (it swims), so yOffset lifts it to rest on y = 0.
    clips: { idle: 'Swimming_Normal', walk: 'Swimming_Normal', run: 'Swimming_Fast', dart: 'Swimming_Impulse', attack: 'Attack', outOfWater: 'Out_Of_Water', death: 'Death' },
    allClips: ['Attack', 'Death', 'Out_Of_Water', 'Swimming_Fast', 'Swimming_Impulse', 'Swimming_Normal'],
    scale: 0.222, yOffset: 0.387, facing: '+z', tintableMaterials: ['Goldfish_Main', 'Goldfish_Fins', 'Material.016'],
    sizeKB: 71.8, tris: 1590, rawHeight: 4.511,
    credit: quaternius('https://poly.pizza/m/qS6CgsWFAh'),
  },
  bird: {
    key: 'bird', url: '/models/bird.glb', kind: 'pet',
    // Static (no animations). Blue parrot-style bird; rotation baked so it stands Y-up facing +Z.
    clips: {}, allClips: [],
    scale: 1.575, yOffset: -0.033, facing: '+z', tintableMaterials: ['Atlas'],
    sizeKB: 46.7, tris: 1204, rawHeight: 0.635,
    credit: quaternius('https://poly.pizza/m/gYYC0gYMnw'),
  },
  bone: {
    key: 'bone', url: '/models/bone.glb', kind: 'prop', clips: {}, allClips: [],
    // Origin at centre; lies flat along X.
    scale: 3.62, yOffset: 0.5, facing: '+z', tintableMaterials: ['HalloweenBits'],
    sizeKB: 23.6, tris: 204, rawHeight: 0.276,
    credit: kaykit('https://poly.pizza/m/gVLnQi8VrX'),
  },
  bowl: {
    key: 'bowl', url: '/models/bowl.glb', kind: 'prop', clips: {}, allClips: [],
    scale: 3.333, yOffset: 0, facing: '+z', tintableMaterials: ['restaurant'],
    sizeKB: 30.1, tris: 256, rawHeight: 0.3,
    credit: kaykit('https://poly.pizza/m/c8KfkHCEnu'),
  },
  sofa: {
    key: 'sofa', url: '/models/sofa.glb', kind: 'prop', clips: {}, allClips: [],
    scale: 0.755, yOffset: 0.003, facing: '+z', tintableMaterials: ['Red'],
    sizeKB: 14.2, tris: 416, rawHeight: 1.324,
    credit: quaternius('https://poly.pizza/m/lmePppSu8a'),
  },
  door: {
    key: 'door', url: '/models/door.glb', kind: 'prop', clips: {}, allClips: [],
    // Origin at the hinge (x = 0); the door spans -X. Rotate around Y to swing it open.
    scale: 0.239, yOffset: 0, facing: '+z', tintableMaterials: ['White'],
    sizeKB: 23.1, tris: 456, rawHeight: 4.188,
    credit: quaternius('https://poly.pizza/m/LI93WgnjyS'),
  },
  fence: {
    key: 'fence', url: '/models/fence.glb', kind: 'prop', clips: {}, allClips: [],
    scale: 0.912, yOffset: 0.01, facing: '+z', tintableMaterials: ['Brown'],
    sizeKB: 12.4, tris: 212, rawHeight: 1.097,
    credit: quaternius('https://poly.pizza/m/r0n40F7FKx'),
  },
  plant: {
    key: 'plant', url: '/models/plant.glb', kind: 'prop', clips: {}, allClips: [],
    scale: 1.134, yOffset: -0.002, facing: '+z', tintableMaterials: ['Plant_Green', 'Black'],
    sizeKB: 15.4, tris: 449, rawHeight: 0.882,
    credit: quaternius('https://poly.pizza/m/bfLOqIV5uP'),
  },
  tree: {
    key: 'tree', url: '/models/tree.glb', kind: 'prop', clips: {}, allClips: [],
    scale: 0.179, yOffset: 0, facing: '+z', tintableMaterials: ['Tree_Green', 'Tree_Wood'],
    sizeKB: 44.8, tris: 2412, rawHeight: 5.589,
    credit: quaternius('https://poly.pizza/m/i4QMw4L64D'),
  },
  house: {
    key: 'house', url: '/models/house.glb', kind: 'prop', clips: {}, allClips: [],
    // Small wooden cabin; also works as a dog house / kennel next to a pet.
    scale: 1.307, yOffset: -0.003, facing: '+z', tintableMaterials: ['Wood', 'Stone'],
    sizeKB: 55.7, tris: 1028, rawHeight: 0.765,
    credit: quaternius('https://poly.pizza/m/L7h0SjZX2K'),
  },
}

export const PET_KEYS = ['dog', 'cat', 'rabbit', 'shiba', 'husky', 'goldfish', 'bird'] as const satisfies readonly ModelKey[]
