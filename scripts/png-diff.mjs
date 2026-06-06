// Minimal PNG diff using only Node built-ins (zlib) — no new dependency.
// Decodes two 8-bit non-interlaced PNGs (color type 2/RGB or 6/RGBA) and reports
// the fraction of pixels whose max channel difference exceeds a tolerance. Used
// to quantify spheres-vs-quads visual parity from the harness A/B screenshots.
//
//   node scripts/png-diff.mjs a.png b.png [tolerance=32]

import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

function decodePng(path) {
  const buf = readFileSync(path);
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  for (let i = 0; i < 8; i++) if (buf[i] !== sig[i]) throw new Error(`${path}: not a PNG`);

  let width, height, bitDepth, colorType;
  const idat = [];
  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      const interlace = data[12];
      if (bitDepth !== 8) throw new Error(`${path}: only 8-bit supported (got ${bitDepth})`);
      if (interlace !== 0) throw new Error(`${path}: interlaced PNG not supported`);
      if (colorType !== 2 && colorType !== 6) throw new Error(`${path}: only RGB/RGBA supported (got ${colorType})`);
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    off += 12 + len; // length + type + data + crc
  }

  const channels = colorType === 6 ? 4 : 3;
  const bpp = channels; // 8-bit
  const stride = width * bpp;
  const raw = inflateSync(Buffer.concat(idat));
  const out = Buffer.alloc(height * stride);

  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    return pb <= pc ? b : c;
  };

  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    for (let x = 0; x < stride; x++) {
      const rawByte = raw[pos++];
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? out[(y - 1) * stride + x - bpp] : 0;
      let val;
      switch (filter) {
        case 0: val = rawByte; break;
        case 1: val = rawByte + a; break;
        case 2: val = rawByte + b; break;
        case 3: val = rawByte + ((a + b) >> 1); break;
        case 4: val = rawByte + paeth(a, b, c); break;
        default: throw new Error(`bad filter ${filter}`);
      }
      out[y * stride + x] = val & 0xff;
    }
  }
  return { width, height, channels, data: out };
}

function diff(aPath, bPath, tolerance = 32) {
  const a = decodePng(aPath);
  const b = decodePng(bPath);
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error(`size mismatch: ${a.width}x${a.height} vs ${b.width}x${b.height}`);
  }
  const total = a.width * a.height;
  let differing = 0;
  let bigDiff = 0; // > 96, i.e. a real color change, not an AA fringe
  for (let i = 0; i < total; i++) {
    const ai = i * a.channels, bi = i * b.channels;
    const dr = Math.abs(a.data[ai] - b.data[bi]);
    const dg = Math.abs(a.data[ai + 1] - b.data[bi + 1]);
    const db = Math.abs(a.data[ai + 2] - b.data[bi + 2]);
    const m = Math.max(dr, dg, db);
    if (m > tolerance) differing++;
    if (m > 96) bigDiff++;
  }
  return {
    total,
    differing,
    differingPct: (differing / total) * 100,
    bigDiff,
    bigDiffPct: (bigDiff / total) * 100,
  };
}

const [, , aPath, bPath, tol] = process.argv;
if (!aPath || !bPath) {
  console.error("usage: node scripts/png-diff.mjs a.png b.png [tolerance]");
  process.exit(1);
}
const r = diff(aPath, bPath, tol ? Number(tol) : 32);
console.log(JSON.stringify(r, null, 2));
