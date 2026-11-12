// Optimise the downloaded Poly Pizza GLBs into public/models/*.glb.
//
// Usage: node scripts/optimize-models.mjs [rawDir] [outDir]
//   defaults: assets-src/raw  public/models
//
// What it does (per model):
//   1. Clean-ups that make the files easier to use from code:
//      - strip FBX2glTF armature prefixes from clip names
//        ("AnimalArmature|AnimalArmature|AnimalArmature|Idle" -> "Idle")
//      - drop the exact duplicate clip set in the Shiba/Husky files
//        (each clip is exported twice: "Idle" and "AnimalArmature|Idle")
//      - give the Husky's "Material.00x" materials the same names the Shiba uses
//      - bake a rotation into the Bird so it stands Y-up and faces +Z like the others
//   2. dedup + prune (keeping leaf bones), resample animations (lossless keyframe reduction)
//   3. Animated pets: EXT_meshopt_compression (reorder + quantise + meshopt).
//      Static props are already tiny, so they only get dedup/prune.
// No Draco: we don't want a decoder fetched from a CDN at runtime.
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, resample, meshopt, transformMesh } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';

const [rawDir = 'assets-src/raw', outDir = 'public/models'] = process.argv.slice(2);
await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

const MODELS = [
  { key: 'dog', compress: true },
  { key: 'cat', compress: true },
  { key: 'rabbit', compress: true },
  { key: 'shiba', compress: true, dropDuplicateClips: true },
  { key: 'husky', compress: true, dropDuplicateClips: true,
    renameMaterials: { Material: 'Main', 'Material.001': 'Main_Light', 'Material.006': 'Black', 'Material.003': 'Eyes_White', 'Material.002': 'Eyes_Black' } },
  { key: 'goldfish', compress: true },
  // Raw bird is Z-up and faces +X. Matrix maps (x, y, z) -> (-y, -z, x): -Z (up) -> +Y, +X (beak) -> +Z.
  { key: 'bird', bake: [0, 0, 1, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 1] },
  { key: 'bone' }, { key: 'bowl' },
  { key: 'sofa' }, { key: 'door' }, { key: 'fence' }, { key: 'plant' }, { key: 'tree' }, { key: 'house' },
];

const shortName = (n) => n.split('|').pop();
fs.mkdirSync(outDir, { recursive: true });

for (const m of MODELS) {
  const src = path.join(rawDir, `${m.key}.glb`);
  const dst = path.join(outDir, `${m.key}.glb`);
  const doc = await io.read(src);
  const root = doc.getRoot();
  const rawClips = root.listAnimations().length;

  if (m.dropDuplicateClips) {
    const plain = new Set(root.listAnimations().filter((a) => !a.getName().includes('|')).map((a) => a.getName()));
    for (const a of root.listAnimations()) if (a.getName().includes('|') && plain.has(shortName(a.getName()))) a.dispose();
  }
  for (const a of root.listAnimations()) a.setName(shortName(a.getName()));
  const names = root.listAnimations().map((a) => a.getName());
  if (new Set(names).size !== names.length) throw new Error(`${m.key}: duplicate clip names after rename: ${names}`);

  if (m.renameMaterials) for (const mat of root.listMaterials()) {
    const n = m.renameMaterials[mat.getName()];
    if (n) mat.setName(n);
  }
  if (m.bake) for (const node of root.listNodes()) {
    // Bake the node's world transform (bird: Rx(-90) x scale 100) into the mesh first, then the fix-up.
    const mesh = node.getMesh();
    if (!mesh) continue;
    transformMesh(mesh, node.getWorldMatrix());
    node.setTranslation([0, 0, 0]).setRotation([0, 0, 0, 1]).setScale([1, 1, 1]);
    transformMesh(mesh, m.bake);
  }

  await doc.transform(
    dedup(),
    prune({ keepLeaves: true }),
    resample(),
    ...(m.compress ? [meshopt({ encoder: MeshoptEncoder, level: 'medium' })] : []),
  );
  await io.write(dst, doc);
  const kb = (fs.statSync(dst).size / 1024).toFixed(1);
  const rawKb = (fs.statSync(src).size / 1024).toFixed(1);
  console.log(`${m.key.padEnd(9)} ${rawKb.padStart(7)} KB -> ${kb.padStart(7)} KB  clips ${rawClips} -> ${root.listAnimations().length}`);
}
