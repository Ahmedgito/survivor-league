// Compute posed (skinned) bounds of a GLB at t=0 of a chosen clip, and optionally
// write side (+X looking, Z to the right) and front (looking down -Z) SVG silhouettes
// for eyeballing which way the model faces.
// Usage: node scripts/pose-bounds.mjs <file.glb> [clipName|-] [svgOutPrefix]
import fs from 'node:fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const [file, clipArg, svgPrefix] = process.argv.slice(2);
const doc = await io.read(file);
const root = doc.getRoot();

// Pose: sample chosen clip at its first keyframe.
const anims = root.listAnimations();
const clip = clipArg && clipArg !== '-' ? anims.find((a) => a.getName() === clipArg) : anims.find((a) => /idle/i.test(a.getName())) || anims[0];
if (clip) for (const ch of clip.listChannels()) {
  const node = ch.getTargetNode(); const path = ch.getTargetPath(); const s = ch.getSampler();
  if (!node || path === 'weights') continue;
  const out = s.getOutput();
  // CUBICSPLINE stores [inTangent, value, outTangent] per key, so the first value is element 1.
  const v = out.getElement(s.getInterpolation() === 'CUBICSPLINE' ? 1 : 0, []);
  if (path === 'translation') node.setTranslation(v); else if (path === 'rotation') node.setRotation(v); else if (path === 'scale') node.setScale(v);
}

function mul(a, b) { const o = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]; return o; }
function tx(m, p) { return [0, 1, 2].map((r) => m[r] * p[0] + m[4 + r] * p[1] + m[8 + r] * p[2] + m[12 + r]); }

const tris = []; const min = [Infinity, Infinity, Infinity]; const max = [-Infinity, -Infinity, -Infinity];
for (const node of root.listNodes()) {
  const mesh = node.getMesh(); if (!mesh) continue;
  const skin = node.getSkin();
  let jointMats = null;
  if (skin) {
    const ibm = skin.getInverseBindMatrices();
    jointMats = skin.listJoints().map((j, i) => { const m = ibm ? ibm.getElement(i, []) : [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; return mul(j.getWorldMatrix(), m); });
  }
  const world = node.getWorldMatrix();
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION'); const J = prim.getAttribute('JOINTS_0'); const W = prim.getAttribute('WEIGHTS_0');
    const col = prim.getMaterial()?.getBaseColorFactor() || [0.6, 0.6, 0.6, 1];
    const tex = svgPrefix ? await decodeTexture(prim.getMaterial()?.getBaseColorTexture()) : null;
    const UV = prim.getAttribute('TEXCOORD_0'); const C = prim.getAttribute('COLOR_0');
    const verts = [];
    for (let i = 0; i < pos.getCount(); i++) {
      const p = pos.getElement(i, []);
      let w;
      if (jointMats && J && W) {
        const j = J.getElement(i, []); const ww = W.getElement(i, []); w = [0, 0, 0];
        for (let k = 0; k < 4; k++) if (ww[k]) { const q = tx(jointMats[j[k]], p); w[0] += q[0] * ww[k]; w[1] += q[1] * ww[k]; w[2] += q[2] * ww[k]; }
      } else w = tx(world, p);
      verts.push(w);
      for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], w[k]); max[k] = Math.max(max[k], w[k]); }
    }
    const idx = prim.getIndices();
    const count = idx ? idx.getCount() : verts.length;
    for (let i = 0; i < count; i += 3) {
      const a = idx ? idx.getScalar(i) : i, b = idx ? idx.getScalar(i + 1) : i + 1, c = idx ? idx.getScalar(i + 2) : i + 2;
      let tcol = col;
      if (tex && UV) {
        const uv = [a, b, c].map((q) => UV.getElement(q, [])); const u = (uv[0][0] + uv[1][0] + uv[2][0]) / 3; const v = (uv[0][1] + uv[1][1] + uv[2][1]) / 3;
        const px = Math.min(tex.w - 1, Math.max(0, Math.floor((u - Math.floor(u)) * tex.w))); const py = Math.min(tex.h - 1, Math.max(0, Math.floor((v - Math.floor(v)) * tex.h)));
        const o = (py * tex.w + px) * tex.ch; tcol = [0, 1, 2].map((k) => Math.pow(tex.data[o + k] / 255, 2.2) * col[k]);
      }
      if (C) { const cc = C.getElement(a, []); tcol = tcol.map((x, k) => (k < 3 ? x * cc[k] : x)); }
      tris.push({ v: [verts[a], verts[b], verts[c]], col: tcol });
    }
  }
}
async function decodeTexture(t) {
  if (!t) return null;
  const sharp = (await import('sharp')).default;
  const { data, info } = await sharp(Buffer.from(t.getImage())).raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height, ch: info.channels };
}
const r = (x) => +x.toFixed(3);
console.log(JSON.stringify({ file: file.split(/[\\/]/).pop(), clip: clip?.getName() ?? null, min: min.map(r), max: max.map(r), height: r(max[1] - min[1]), width: r(max[0] - min[0]), depth: r(max[2] - min[2]) }));

if (svgPrefix) {
  // Simple flat-shaded orthographic render. view: 'side' => screen x = +Z, depth = -X (camera at +X);
  // 'front' => camera at +Z looking toward -Z (+X to the right). 'top' => camera at +Y.
  const toHex = (c, shade) => '#' + c.slice(0, 3).map((v) => Math.round(255 * Math.min(1, Math.pow(v, 1 / 2.2) * shade)).toString(16).padStart(2, '0')).join('');
  for (const view of ['side', 'front', 'back', 'top']) {
    const S = 400, pad = 20; const span = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
    const sx = (p) => pad + ((view === 'side' ? p[2] - min[2] : view === 'back' ? max[0] - p[0] : p[0] - min[0]) / span) * (S - 2 * pad);
    // top view: camera at +Y looking down, +X right, +Z toward the bottom of the image.
    const sy = (p) => view === 'top' ? pad + ((p[2] - min[2]) / span) * (S - 2 * pad) : S - pad - ((p[1] - min[1]) / span) * (S - 2 * pad);
    const axis = view === 'side' ? 0 : view === 'top' ? 1 : 2; // camera sits on the + side of this axis ('back': the - side)
    const sign = view === 'back' ? 1 : -1;
    const depth = (t) => sign * (t.v[0][axis] + t.v[1][axis] + t.v[2][axis]);
    const sorted = [...tris].sort((a, b) => depth(a) - depth(b)).reverse();
    // painter's algorithm: larger depth() = farther from the camera, drawn first.
    let body = '';
    for (const t of sorted) {
      const [a, b, c] = t.v; const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]; const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; const len = Math.hypot(...n) || 1;
      const shade = 0.5 + 0.5 * Math.abs((n[0] * 0.5 + n[1] * 0.7 + n[2] * 0.5) / len);
      body += `<polygon points="${t.v.map((p) => sx(p).toFixed(1) + ',' + sy(p).toFixed(1)).join(' ')}" fill="${toHex(t.col, shade * 1.6)}"/>`;
    }
    const label = view === 'side' ? '+Z →' : view === 'front' ? '(from +Z) +X →' : view === 'back' ? '(from -Z) +X ←' : '(from +Y) +X →, +Z ↓';
    fs.writeFileSync(`${svgPrefix}-${view}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}"><rect width="100%" height="100%" fill="#cfe3f5"/>${body}<text x="10" y="16" font-size="14">${view} ${label}</text></svg>`);
  }
}
