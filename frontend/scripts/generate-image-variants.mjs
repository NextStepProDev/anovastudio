/**
 * Dokłada warianty AVIF i WebP obok każdego JPEG-a w `public/images`.
 *
 * Zdjęcia hero nie idą przez optymalizator Next-a (art direction wymaga dwóch
 * różnych plików na slajd, a next/image z ukrywaniem przez CSS pobrałby oba
 * kadry), więc formaty przygotowujemy raz, tutaj, i podajemy je w `<picture>`.
 *
 * Uruchamiać po WGRANIU NOWYCH ZDJĘĆ, nie w CI — źródła zmieniają się raz na
 * kilka miesięcy, a gotowe warianty leżą w repozytorium obok oryginałów:
 *
 *     cd frontend && npm run images
 *
 * Jakość dobrana pod fotografię ciała: przy AVIF 50 znikała faktura skóry
 * (zdjęcia wyglądały jak wygładzone filtrem), 63 trzyma ją nienaruszoną i nadal
 * schodzi ~6× poniżej JPEG-a. sharp jest zależnością Next-a — nic nie dokładamy
 * do package.json.
 */
import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "public/images");
const AVIF_QUALITY = 63;
const WEBP_QUALITY = 80;

const kb = (path) => statSync(path).size / 1024;
const pad = (n) => n.toFixed(0).padStart(4) + " KB";

const jpegs = readdirSync(DIR).filter((file) => /\.jpe?g$/i.test(file));
if (jpegs.length === 0) {
  console.log("Brak plików JPEG w public/images — nie ma czego przetwarzać.");
  process.exit(0);
}

let totals = { jpeg: 0, webp: 0, avif: 0 };

for (const file of jpegs) {
  const base = file.replace(/\.jpe?g$/i, "");
  const source = join(DIR, file);

  await sharp(source)
    .avif({ quality: AVIF_QUALITY, effort: 6 })
    .toFile(join(DIR, `${base}.avif`));
  await sharp(source)
    .webp({ quality: WEBP_QUALITY })
    .toFile(join(DIR, `${base}.webp`));

  const sizes = {
    jpeg: kb(source),
    webp: kb(join(DIR, `${base}.webp`)),
    avif: kb(join(DIR, `${base}.avif`)),
  };
  for (const key of Object.keys(totals)) totals[key] += sizes[key];

  console.log(
    `${base.padEnd(18)} JPEG ${pad(sizes.jpeg)} → WebP ${pad(sizes.webp)} → AVIF ${pad(sizes.avif)}`,
  );
}

console.log("─".repeat(64));
console.log(
  `RAZEM${" ".repeat(14)}JPEG ${pad(totals.jpeg)} → WebP ${pad(totals.webp)} → AVIF ${pad(totals.avif)}`,
);
