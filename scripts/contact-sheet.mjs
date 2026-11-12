// Build a labelled-by-order contact sheet from a list of images (for eyeballing model style).
// Usage: node scripts/contact-sheet.mjs <out.jpg> <img1> <img2> ...
import sharp from 'sharp';
const [out, ...imgs] = process.argv.slice(2);
const S = 240, cols = 6, rows = Math.ceil(imgs.length / cols);
const tiles = await Promise.all(imgs.map((p) => sharp(p).resize(S, S, { fit: 'cover' }).toBuffer()));
const composite = tiles.map((input, i) => ({ input, left: (i % cols) * S, top: Math.floor(i / cols) * S }));
await sharp({ create: { width: cols * S, height: rows * S, channels: 3, background: '#fff' } })
  .composite(composite).jpeg({ quality: 80 }).toFile(out);
console.log(imgs.map((p, i) => `${i}: ${p.split(/[\/]/).pop()}`).join('\n'));
