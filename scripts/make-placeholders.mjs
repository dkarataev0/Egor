// Генератор фото-заглушек «стекло и свет». Запуск: node scripts/make-placeholders.mjs
// Замените файлы в public/images/* своими фото (те же имена и размеры, см. README).
import sharp from "sharp";
import { mkdirSync } from "node:fs";

function rnd(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function svg(w, h, seed, hue) {
  const r = rnd(seed);
  const bands = Array.from({ length: 9 }, () => {
    const x = r() * w * 1.2 - w * 0.1;
    const bw = w * (0.04 + r() * 0.16);
    const o = 0.05 + r() * 0.22;
    return `<polygon points="${x},0 ${x + bw},0 ${x + bw - h * 0.35},${h} ${x - h * 0.35},${h}" fill="url(#shine)" opacity="${o.toFixed(2)}"/>`;
  }).join("");
  const orbs = Array.from({ length: 5 }, () => {
    const cx = r() * w, cy = r() * h, rad = h * (0.15 + r() * 0.35);
    return `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="url(#orb)" opacity="${(0.25 + r() * 0.4).toFixed(2)}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue},45%,88%)"/><stop offset="0.5" stop-color="hsl(${hue + 8},50%,62%)"/><stop offset="1" stop-color="hsl(${hue + 20},55%,28%)"/></linearGradient>
<linearGradient id="shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="orb"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<filter id="b"><feGaussianBlur stdDeviation="${Math.round(h / 90)}"/></filter>
</defs>
<rect width="100%" height="100%" fill="url(#bg)"/>
<g filter="url(#b)">${orbs}</g>${bands}
<rect x="${w * 0.08}" y="${h * 0.1}" width="${w * 0.84}" height="${h * 0.8}" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="${Math.max(2, w / 500)}"/>
</svg>`;
}

const jobs = [
  ["hero/hero", 2400, 1350, 1, 185],
  ["services/railings", 1200, 800, 2, 190],
  ["services/windows", 1200, 800, 3, 200],
  ["services/showers", 1200, 800, 4, 178],
  ...[1, 2, 3, 4, 5, 6].map((n) => [`works/work-${n}`, 1200, n % 2 ? 900 : 1200, 10 + n, 175 + n * 6]),
];

for (const d of ["hero", "services", "works"]) mkdirSync(`public/images/${d}`, { recursive: true });
for (const [name, w, h, seed, hue] of jobs) {
  const buf = Buffer.from(svg(w, h, seed, hue));
  await sharp(buf).webp({ quality: 78 }).toFile(`public/images/${name}.webp`);
  console.log("ok", name);
}
