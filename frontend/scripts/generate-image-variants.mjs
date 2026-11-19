/**
 * Adds AVIF and WebP variants next to every JPEG in `public/images`.
 *
 * The hero photos do not go through Next's optimizer (art direction needs two different
 * files per slide, and next/image hidden by CSS would download both crops), so the
 * formats are prepared once, here, and given in `<picture>`.
 *
 * Run after ADDING NEW PHOTOS, not in CI — the sources change once every few months, and
 * the finished variants sit in the repository next to the originals:
 *
 *     cd frontend && npm run images
 *
 * Quality tuned for photographs of bodies: at AVIF 50 the skin texture vanished (the
 * photos looked smoothed by a filter), 63 keeps it intact and still comes out ~6× below
 * the JPEG. sharp is a dependency of Next — nothing is added to package.json.
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
