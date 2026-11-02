// Генерирует components/logo-markup.ts из brand/logo/logo-layers.svg.
// Запуск: node scripts/make-logo-component.mjs
// Цвета текста и рамки заменяются на currentColor (логотип работает на тёмной и светлой темах),
// id слоёв заменяются классами lg-*, id градиентов и масок получают суффикс __ID__ (на странице несколько логотипов).
import { readFileSync, writeFileSync } from "node:fs";

const svg = readFileSync("brand/logo/logo-layers.svg", "utf8");
const P = JSON.parse(readFileSync("brand/logo/src/params.json", "utf8"));
const g = P.geom, T = P.text, r = (n) => Math.round(n * 100) / 100;

function group(id) {
  const start = svg.indexOf(`<g id="${id}">`);
  const re = /<g\b|<\/g>/g; re.lastIndex = start; let d = 0, m;
  while ((m = re.exec(svg))) { d += m[0] === "</g>" ? -1 : 1; if (!d) return svg.slice(start, m.index + 4); }
  throw new Error("нет слоя " + id);
}
const poly = (pts) => "M" + pts.map((p) => p.map(r).join(" ")).join(" L") + " Z";
const defs = svg.match(/<defs>([\s\S]*?)<\/defs>/)[1];

const vL = T.vit.left, vW = T.vit.right - T.vit.left + 0.4, F = 26;
const extra = `
<linearGradient id="gFeather" x1="0" y1="0" x2="1" y2="0"><stop offset="${r(vW / (vW + F))}" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
<mask id="mVit" maskUnits="userSpaceOnUse" x="${vL - 4}" y="110" width="${r(vW + F + 10)}" height="70"><rect class="lg-reveal" x="${vL}" y="110" width="${r(vW + F)}" height="70" fill="url(#gFeather)"/></mask>
<linearGradient id="gGlint" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".38" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity=".6"/><stop offset=".62" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="glassClip"><path d="${poly([g.back.tl, g.back.tr, g.back.br, g.back.bl])}"/><path d="${poly([g.mid.tl, g.mid.tr, g.mid.br, g.mid.bl])}"/><path d="${poly(g.frontInner)}"/></clipPath>`;
const glint = `<g clip-path="url(#glassClip)"><g class="lg-glint"><rect x="-13" y="70" width="26" height="160" fill="url(#gGlint)" transform="translate(${r(Math.tan(Math.PI / 6) * 150)} 0) skewX(-30)"/></g></g>`;

let tag = group("tagline");
tag = tag.replace(/<circle id="tagline-dot-(\d)"/g, '<circle class="lg-td lg-d$1"')
  .replace(/<path id="tagline-[a-z-]+-\d+"/g, '<path class="lg-tl"')
  .replace(/ id="tagline-[a-z-]+"/g, "").replace('<g id="tagline">', '<g class="lg-tag">');
const cls = (s, id, c) => s.replace(`<g id="${id}">`, `<g class="${c}">`);
let body = [
  cls(group("glass-back"), "glass-back", "lg-back"),
  cls(group("glass-mid"), "glass-mid", "lg-mid"),
  glint,
  cls(group("frame-front"), "frame-front", "lg-frameg").replace('id="frame-front-outline"', 'class="lg-frame"'),
  cls(group("glass-front"), "glass-front", "lg-front"),
  cls(group("text-art"), "text-art", "lg-art"),
  `<g mask="url(#mVit)">${cls(group("text-vitrazh"), "text-vitrazh", "lg-vit")}</g>`,
  tag,
].join("\n");
let all = `<defs>${defs}${extra}</defs>\n${body}`;
// цвета: текст, рамка и подпись наследуют currentColor
all = all.replace(/#1c2739/g, "currentColor").replace(/#101a2b/g, "currentColor").replace(/#232b38/g, "currentColor");
// id градиентов, масок и clipPath → с суффиксом
for (const id of ["gBackEdge", "gBack", "gMidFrame", "gMid", "gFront", "gFeather", "mVit", "gGlint", "glassClip"]) {
  all = all.replace(new RegExp(`id="${id}"`, "g"), `id="${id}__ID__"`).replace(new RegExp(`url\\(#${id}\\)`, "g"), `url(#${id}__ID__)`);
}
all = all.replace(/\s+pathLength="1"/, ' pathLength="1"');
const vb = [6, 84, 319, 136];
const ts = `// АВТОГЕНЕРАЦИЯ: node scripts/make-logo-component.mjs (исходник: brand/logo/logo-layers.svg). Руками не править.
export const LOGO_VIEWBOX = "${vb.join(" ")}";
export const LOGO_RATIO = ${r(vb[2] / vb[3])};
const MARKUP = ${JSON.stringify(all)};
/** Разметка логотипа с уникальными id градиентов и масок (id — суффикс экземпляра). */
export const logoMarkup = (id: string) => MARKUP.replace(/__ID__/g, id);
export const VIT_REVEAL = ${r(vW + F)};
`;
writeFileSync("components/logo-markup.ts", ts);
console.log("ok", ts.length, "байт; ids:", (all.match(/__ID__/g) || []).length);
