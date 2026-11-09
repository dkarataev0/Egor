// Картинки карточек услуг (3:2) и фон hero из реальных фото работ.
// Запуск: node scripts/make-service-images.mjs <папка с оригиналами> <gallery_map.json>
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { basename, join } from "node:path";

const [, , origDir, mapFile] = process.argv;
const PICK = {                       // услуга → фото из галереи (папка/номер)
  "partitions-interior": "partitions-interior/06", "partitions-office": "partitions-office/05",
  "partitions-sanitary": "showers/25", "glass-walls": "partitions-office/12", railings: "railings/15",
  showers: "showers/15", doors: "doors/08", saunas: "saunas/03", entrances: "entrances/05",
  mirrors: "mirrors/05", windows: "entrances/07",
};
mkdirSync("public/images/services", { recursive: true });
for (const [id, p] of Object.entries(PICK)) {
  await sharp(`public/images/works/${p}.webp`).resize(1200, 800, { fit: "cover", position: "attention", withoutEnlargement: true })
    .webp({ quality: 74, effort: 5 }).toFile(`public/images/services/${id}.webp`);
}
// hero: большой оригинал «Входные группы», кадр 2 (остеклённая веранда на закате)
const map = JSON.parse(readFileSync(mapFile, "utf8"));
const heroSrc = map["Входные группы"][1];
mkdirSync("public/images/hero", { recursive: true });
const i = await sharp(join(origDir, basename(heroSrc)), { failOn: "none" }).rotate().resize(2400, 1350, { fit: "cover", position: "attention" })
  .webp({ quality: 76, effort: 5 }).toFile("public/images/hero/hero.webp");
await sharp("public/images/hero/hero.webp").resize(1200, 630, { fit: "cover" }).jpeg({ quality: 82 }).toFile("public/og.jpg");
console.log("ok, hero", i.width + "×" + i.height, (i.size / 1024).toFixed(0), "КБ");
