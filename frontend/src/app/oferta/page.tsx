import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/contact";
import { pageMetadata } from "@/lib/seo";
import OfferMenu from "@/components/OfferMenu";
import Reveal from "@/components/Reveal";
import Watermark from "@/components/Watermark";

// A function, not a constant: Next's metadata resolver consumes the object passed in,
// and the page can be rendered several times in one process (the card image got lost).
export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Oferta i cennik",
    description: `Oferta gabinetu ${BRAND} w Libiążu — fizjoterapia ortopedyczna i sportowa, gimnastyka korekcyjna, trening medyczny, kinesiotaping, masaż. Sprawdź cennik.`,
    path: "/oferta",
  });
}

// A soft vignette blending the hero into the .plaster background on ALL sides (the right
// widest, 42% — the logo/wall melt gently into the background; the left 20%) — so one
// set of masks works both on the right (desktop) and under the text (mobile).
// intersect = the masks intersect (each one crops), instead of the default union of the
// visible area.
const HERO_VIGNETTE =
  "linear-gradient(to right, transparent, #000 20%), linear-gradient(to left, transparent, #000 42%), linear-gradient(to bottom, transparent, #000 12%), linear-gradient(to top, transparent, #000 16%)";

export default function OfertaPage() {
  return (
    <div className="relative flex-1 overflow-hidden bg-paper">
      {/* The hero on a "sunlit wall": the background (.plaster) + texture (.grain), on the
          right the ANOVA STUDIO lettering embossed in the plaster, with a vase in front of it.
          The vase is a slot component — it will be swapped for a cut-out photo when the
          client provides one. The right column on desktop only (as in the mockup). */}
      <section className="plaster grain relative overflow-hidden">
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 md:min-h-[27rem] md:grid-cols-2 md:py-24">
          <Reveal className="max-w-xl">
            <p className="kicker">Oferta i cennik</p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Jak możemy Ci pomóc
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-ink-soft">
              Łączymy nowoczesną fizjoterapię, terapię manualną oraz
              indywidualnie dobrany ruch, aby skutecznie wspierać Twój powrót do
              zdrowia i lepszej jakości życia.
            </p>
          </Reveal>

          {/* A wide crop of the wall + vase and the full ANOVA STUDIO logo, cut from the
              client's hi-res render (public/images/oferta-hero.jpg, 1536×924). On mobile
              shown whole (under the text, full width, natural proportions). On desktop a
              fixed height + object-cover crops the sides, hence object-position 75%: the
              crop is shifted right so the logo gets a margin of empty wall and does not
              land on the edge (where the right vignette would eat it), while the vase stays
              visible. */}
          {/* display:contents on <picture> — so the grid item remains the <img> itself (with
              its height and mask), and <picture> serves only to choose the format:
              AVIF ~41 KB / WebP ~53 KB instead of a 126 KB JPEG. */}
          <picture className="contents">
            <source type="image/avif" srcSet="/images/oferta-hero.avif" />
            <source type="image/webp" srcSet="/images/oferta-hero.webp" />
            <img
              src="/images/oferta-hero.jpg"
              alt=""
              aria-hidden
              decoding="async"
              className="h-auto w-full object-cover object-[75%_center] md:h-[26rem]"
              style={{
                maskImage: HERO_VIGNETTE,
                WebkitMaskImage: HERO_VIGNETTE,
                maskComposite: "intersect",
                WebkitMaskComposite: "source-in",
              }}
            />
          </picture>
        </div>
      </section>

      {/* Ambient wall light — a soft amber glow from the top right, continuing the
          direction of the light from the hero (.plaster). Full width (full-bleed), low
          intensity, so the beige is not flat. The content sits over the background naturally. */}
      <section className="relative isolate overflow-hidden bg-[radial-gradient(58%_42%_at_86%_0%,color-mix(in_srgb,var(--color-glow)_20%,transparent),transparent_70%)]">
        <Watermark className="bottom-[-4%] right-[-4%] h-[480px]" />
        <div className="mx-auto max-w-6xl px-5 pb-16 md:pb-24">
          <OfferMenu />

          {/* A closing, calm CTA — no icons or cards, just light and typography. */}
          <Reveal className="mt-16 text-center md:mt-20">
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Masz pytania?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-7 text-ink-soft">
              Skontaktuj się z nami — chętnie pomożemy dobrać odpowiednią terapię.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/kontakt" className="btn btn-primary">
                Umów wizytę
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
