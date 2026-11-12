// Print per-animation channel details (target node, path, keyframe count) to compare clips.
// Usage: node scripts/anim-detail.mjs <file.glb> [nameFilter]
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const [file, filter] = process.argv.slice(2);
const doc = await new NodeIO().registerExtensions(ALL_EXTENSIONS).read(file);
const root = doc.getRoot();
root.listAnimations().forEach((a, i) => {
  if (filter && !a.getName().includes(filter)) return;
  const ch = a.listChannels();
  const targets = new Set(ch.map((c) => c.getTargetNode()?.getName()));
  const keys = ch.reduce((s, c) => s + c.getSampler().getInput().getCount(), 0);
  const interp = new Set(ch.map((c) => c.getSampler().getInterpolation()));
  console.log(i, JSON.stringify(a.getName()), 'channels', ch.length, 'targets', targets.size, 'keys', keys, [...interp].join(','), [...targets].slice(0, 6).join(','));
});
console.log('skins/joints:', root.listSkins().map((s) => s.listJoints().map((j) => j.getName()).join(',')).join(' || '));
console.log('nodes:', root.listNodes().length, 'root children:', (root.getDefaultScene()||root.listScenes()[0]).listChildren().map(n=>n.getName()+' s='+n.getScale().map(v=>+v.toFixed(3))+' r='+n.getRotation().map(v=>+v.toFixed(3))).join(' | '));
