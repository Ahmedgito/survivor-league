// Inspect GLB files and print a JSON summary per file:
// size, triangles, animations (name + duration), mesh/node/material names,
// whether materials use textures, scene bounds, and head-joint position (for facing).
// Usage: node scripts/inspect-models.mjs <file.glb> [...]
import fs from 'node:fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { getBounds } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

function worldPos(node) {
  const m = node.getWorldMatrix();
  return [m[12], m[13], m[14]].map((v) => +v.toFixed(3));
}

const out = [];
for (const file of process.argv.slice(2)) {
  const doc = await io.read(file);
  const root = doc.getRoot();
  let tris = 0;
  const meshUse = new Map();
  for (const n of root.listNodes()) if (n.getMesh()) meshUse.set(n.getMesh(), (meshUse.get(n.getMesh()) || 0) + 1);
  for (const [mesh, count] of meshUse) {
    for (const p of mesh.listPrimitives()) {
      const idx = p.getIndices();
      const c = idx ? idx.getCount() : p.getAttribute('POSITION').getCount();
      tris += (c / 3) * count;
    }
  }
  const scene = root.getDefaultScene() || root.listScenes()[0];
  const b = getBounds(scene);
  const heads = root.listNodes().filter((n) => /head|nose|snout|mouth/i.test(n.getName()))
    .map((n) => ({ name: n.getName(), world: worldPos(n) }));
  const tails = root.listNodes().filter((n) => /tail/i.test(n.getName()))
    .map((n) => ({ name: n.getName(), world: worldPos(n) }));
  out.push({
    file: file.split(/[\/]/).pop(),
    sizeKB: +(fs.statSync(file).size / 1024).toFixed(1),
    triangles: Math.round(tris),
    extensionsUsed: root.listExtensionsUsed().map((e) => e.extensionName),
    animations: root.listAnimations().map((a) => {
      let max = 0;
      for (const s of a.listSamplers()) { const arr = s.getInput()?.getArray(); if (arr?.length) max = Math.max(max, arr[arr.length - 1]); }
      return { name: a.getName(), duration: +max.toFixed(3) };
    }),
    meshes: root.listMeshes().map((m) => m.getName()),
    meshNodes: root.listNodes().filter((n) => n.getMesh()).map((n) => n.getName()),
    skins: root.listSkins().length,
    materials: root.listMaterials().map((m) => ({
      name: m.getName(),
      baseColor: m.getBaseColorFactor().map((v) => +v.toFixed(3)),
      texture: !!m.getBaseColorTexture(),
      vertexColors: root.listMeshes().some((me) => me.listPrimitives().some((p) => p.getMaterial() === m && p.getAttribute('COLOR_0'))),
    })),
    textures: root.listTextures().map((t) => ({ name: t.getName(), mime: t.getMimeType(), size: t.getSize() })),
    bboxMin: b.min.map((v) => +v.toFixed(3)),
    bboxMax: b.max.map((v) => +v.toFixed(3)),
    heads, tails,
  });
}
console.log(JSON.stringify(out, null, 1));
