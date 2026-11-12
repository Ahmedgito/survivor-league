# 02 · 3D assets

All shipped models are **CC0** and come from Poly Pizza. Licences were read from each model page's embedded `"Licence":"CC0 1.0"` field on 2026-11-12. Each model page is linked in `src/data/models.ts` (`credit.source`).
Total: **15 files, 1.31 MB** (target ≤ 3 MB). Every pet is under 300 KB.

| Key | File | KB | Tris | Clips | Licence | Author | Source |
|---|---|---|---|---|---|---|---|
| dog ⭐ | `public/models/dog.glb` | 73.9 | 3,604 | Death, Headbutt, Idle, Idle_Eating, Jump_Loop, Jump_Start, Run, Walk | CC0 | Quaternius | https://poly.pizza/m/2kUk0QqpCg |
| cat | `cat.glb` | 65.4 | 2,448 | same 8 as dog | CC0 | Quaternius | https://poly.pizza/m/qKICY6xla2 |
| rabbit | `rabbit.glb` | 295.1 | 2,282 | 30 (Idle, Walk, Run, Jump*, Wave, Yes, No, Sitting_*, Duck, HitReact, Death, plus holding/tool clips) | CC0 | Quaternius | https://poly.pizza/m/mKev485XTR |
| shiba | `shiba.glb` | 276.5 | 1,950 | 12: Idle, Idle_2, Idle_2_HeadLow, Walk, Gallop, Gallop_Jump, Jump_ToIdle, Eating, Idle_HitReact_Left/Right, Attack, Death | CC0 | Quaternius | https://poly.pizza/m/y4wdQpg767 |
| husky | `husky.glb` | 292.9 | 1,920 | same 12 as shiba | CC0 | Quaternius | https://poly.pizza/m/wcWiuEqwzq |
| goldfish | `goldfish.glb` | 71.8 | 1,590 | Swimming_Normal, Swimming_Fast, Swimming_Impulse, Attack, Out_Of_Water, Death | CC0 | Quaternius | https://poly.pizza/m/qS6CgsWFAh |
| bird | `bird.glb` | 46.7 | 1,204 | none (static) | CC0 | Quaternius | https://poly.pizza/m/gYYC0gYMnw |
| bone | `bone.glb` | 23.6 | 204 | none | CC0 | Kay Lousberg (KayKit) | https://poly.pizza/m/gVLnQi8VrX |
| bowl | `bowl.glb` | 30.1 | 256 | none | CC0 | Kay Lousberg (KayKit) | https://poly.pizza/m/c8KfkHCEnu |
| sofa | `sofa.glb` | 14.2 | 416 | none | CC0 | Quaternius | https://poly.pizza/m/lmePppSu8a |
| door | `door.glb` | 23.1 | 456 | none | CC0 | Quaternius | https://poly.pizza/m/LI93WgnjyS |
| fence | `fence.glb` | 12.4 | 212 | none | CC0 | Quaternius | https://poly.pizza/m/r0n40F7FKx |
| plant | `plant.glb` | 15.4 | 449 | none | CC0 | Quaternius | https://poly.pizza/m/bfLOqIV5uP |
| tree | `tree.glb` | 44.8 | 2,412 | none | CC0 | Quaternius | https://poly.pizza/m/i4QMw4L64D |
| house | `house.glb` | 55.7 | 1,028 | none | CC0 | Quaternius | https://poly.pizza/m/L7h0SjZX2K |

Key durations (seconds): dog Idle 6.67, Walk 0.83, Run 0.5, Idle_Eating 3.33, Jump_Start 0.25, Jump_Loop 1.0. The scale, yOffset, facing and tintable materials for each model are in `src/data/models.ts`.

## README credit lines
CC0 needs no credit, but we credit the creators anyway:
- 3D pets, furniture and scenery: **Quaternius** (CC0), via [Poly Pizza](https://poly.pizza/u/Quaternius)
- Bone and bowl props: **Kay Lousberg / KayKit** (CC0), via [Poly Pizza](https://poly.pizza)

## Orientation, origin and materials
- After loading, **every model faces +Z** with its origin at the feet. The exceptions: the goldfish's origin is at its body centre (the manifest's `yOffset` corrects this), the bone's origin is at its centre, and the door's origin is at its hinge (x = 0, the door spans −X).
- Dog, cat and rabbit use one 512px texture atlas plus vertex colours (`AtlasMaterial`). Tinting `material.color` multiplies the **whole** body, eyes included. Clone the material before tinting.
- Shiba and husky use flat colours: `Main` (fur) and `Main_Light` (belly/muzzle) can be tinted. The goldfish uses `Goldfish_Main`, `Goldfish_Fins` and `Material.016` (light belly).
- Pose bounds were computed with skinning at frame 0 of the idle clip (`scripts/pose-bounds.mjs`). They are the same before and after optimisation, which confirms quantisation didn't distort the models.

## Processing
```bash
bash scripts/fetch-polypizza-meta.sh assets-src/raw/pages <ids…>   # reads title/licence/creator/GLB URL from page HTML
curl -sf https://static.poly.pizza/<uuid>.glb -o assets-src/raw/<key>.glb
node scripts/optimize-models.mjs                                     # rename clips, dedupe, prune, resample, meshopt → public/models
for m in dog cat rabbit shiba husky goldfish; do                     # re-encode: gives 35–40% smaller shiba/husky files than the in-script write
  npx gltf-transform meshopt public/models/$m.glb tmp.glb --level medium && mv tmp.glb public/models/$m.glb; done
node scripts/inspect-models.mjs public/models/*.glb                  # sizes, tris, clips, materials
node scripts/pose-bounds.mjs public/models/dog.glb Idle              # skinned bounds → scale / yOffset
```
- The animated pets use **EXT_meshopt_compression + KHR_mesh_quantization**. drei's `useGLTF` decodes meshopt out of the box. **No Draco**, so nothing is fetched from a CDN.
- Static props only get dedup/prune (they are under 60 KB). Textures are kept at their original size (atlases ≤ 1024 px, a few KB each).
- `gltf-transform inspect` succeeds on all 15 files.

## Swaps, fixes and problems
- **Clip names cleaned:** the raw files had names like `AnimalArmature|AnimalArmature|AnimalArmature|Idle`. Everything before the last `|` was removed, so they are now `Idle`, `Walk`, and so on.
- **Shiba and husky had every clip twice** (`Idle` and `AnimalArmature|Idle`, 24 clips). The prefixed duplicates were dropped, leaving **12 unique clips**: the raw file's 24 clips are 12 unique clips, which matches the shipped count. The other pets keep the same clip count as their raw files (dog 8, cat 8, rabbit 30, goldfish 6).
- **Husky materials renamed** from `Material`, `Material.00x` to `Main`, `Main_Light`, `Black`, `Eyes_White` and `Eyes_Black`, which match the Shiba's names.
- **Bird:** the raw file was Z-up (it lay on its side) and faced +X. A rotation was baked in so it stands Y-up and faces +Z. The model is a **blue parrot-style bird** (from Quaternius's pirate set), not a jay. Its name in the UI should be just "Bird" or "Parrot".
- **Rabbit** is a biped character with a black top. It includes tool and weapon clips (Sword, Punch, Chop_*, Pan_*, Assembly_*) that **must not** be used on an adoption site.
- **No CC0 Quaternius kennel exists** on Poly Pizza. `house.glb` is a small wooden cabin (0.77 units tall raw), so scale it to about the dog's size and use it as a dog house.
- Avoid every `Death`, `Attack` and `HitReact` clip on a pet-adoption site.

## Recommendations for the story engineer
| Story beat | Dog (hero) clip | Notes |
|---|---|---|
| Waiting at the shelter, calm | `Idle` (6.7 s loop) | Best seen from a ¾ front view (camera at +Z, slightly to the side) |
| Hungry / at the bowl | `Idle_Eating` | Pair with `bowl` in front of the dog (+Z) |
| Noticing the adopter | `Jump_Start` → `Jump_Loop` (blend back to `Idle`) | Short and bouncy |
| Walking home | `Walk` (0.83 s) | Side-on view reads best; move about 1 unit/s × scale |
| Excited / playing fetch | `Run` (0.5 s) + `bone` | |
| Nuzzle / greeting | `Headbutt` | Playful, not aggressive |
| Never | `Death` | |

- **Dog, cat and rabbit are blocky, voxel-like and cute.** They read well from the front and from a ¾ view. A pure top-down view looks flat.
- **Shiba and husky are realistic low-poly animals.** They look best from the side or a ¾ view. For "running", use `Gallop`. For a sniffing or curious beat, use `Idle_2_HeadLow`.
- Rabbit beats: `Wave` (hello), `Yes`, `Sitting_Start` → `Sitting_Idle`, `Sitting_Eating`.
- Goldfish: loop `Swimming_Normal`, and use `Swimming_Impulse` for a happy dart.
- The bird is static. Animate it with a gentle bob in code.
- Scene set: put `sofa`, `plant` and `door` together for the home interior. Put `fence`, `tree` and `house` (as a kennel) together for the yard. All are Quaternius flat-colour pieces. Tint `Red`, `Wood` and the other flat materials to fit the palette.
