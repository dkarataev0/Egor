// Импорт фото работ: оригиналы → WebP (до 1400 px), раскладка по услугам, data/works.json.
// Запуск: node scripts/import-works.mjs <папка с оригиналами> <gallery_map.json>
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";

const [, , origDir, mapFile] = process.argv;
const map = JSON.parse(readFileSync(mapFile, "utf8"));
const SERVICE = {
  "Межкомнатные перегородки": ["partitions-interior", "Межкомнатные перегородки"],
  "Офисные": ["partitions-office", "Офисные перегородки"],
  "Лестничные ограждения": ["railings", "Стеклянные перила и ограждения"],
  "Сауны и хаммамы": ["saunas", "Сауны и хаммамы"],
  "Двери": ["doors", "Двери из стекла"],
  "Входные группы": ["entrances", "Входные группы"],
  "Душевые перегородки": ["showers", "Душевые кабины из стекла"],
  "Зеркала на заказ": ["mirrors", "Зеркала на заказ"],
};
// Не берём кадры, не относящиеся к стеклу: кухни в категории «Зеркала» (№24–33) и стройплощадку (входные группы №10).
const SKIP = { "Зеркала на заказ": [24, 25, 26, 27, 28, 29, 30, 31, 32, 33], "Входные группы": [10] };
const works = []; let id = 1, bytes = 0;
for (const [cat, files] of Object.entries(map)) {
  const [svc] = SERVICE[cat];
  mkdirSync(`public/images/works/${svc}`, { recursive: true });
  let n = 1;
  for (const [idx, f] of files.entries()) {
    if ((SKIP[cat] ?? []).includes(idx + 1)) continue;
    const out = `public/images/works/${svc}/${String(n).padStart(2, "0")}.webp`;
    const info = await sharp(join(origDir, basename(f)), { failOn: "none" }).rotate().resize(1400, 1400, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 72, effort: 5 }).toFile(out);
    bytes += statSync(out).size;
    works.push({ id: id++, service: svc, image: "/" + out.replace(/^public\//, ""), w: info.width, h: info.height });
    n++;
  }
  console.log(cat, files.length);
}
writeFileSync("data/works.json", JSON.stringify(works, null, 2) + "\n");
console.log("всего", works.length, "фото,", (bytes / 1e6).toFixed(1), "МБ");
