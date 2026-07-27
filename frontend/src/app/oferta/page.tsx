import type { Metadata } from "next";
import Link from "next/link";
import { BRAND } from "@/lib/contact";
import OfferMenu from "@/components/OfferMenu";
import Reveal from "@/components/Reveal";
import Watermark from "@/components/Watermark";

export const metadata: Metadata = {
  title: "Oferta i cennik",
  description: `Oferta gabinetu ${BRAND} w Libiążu — fizjoterapia ortopedyczna i sportowa, gimnastyka korekcyjna, trening medyczny, kinesiotaping, masaż. Sprawdź cennik.`,
};

export default function OfertaPage() {
  return (
    <div className="relative flex-1 overflow-hidden bg-paper">
      {/* Hero na „nasłonecznionej ścianie": tło (.plaster) + faktura (.grain),
          po prawej wytłoczony w tynku napis ANOVA STUDIO, a przed nim wazon.
          Wazon to komponent-slot — podmieni się na wycięte zdjęcie, gdy klient
          je dostarczy. Prawa kolumna tylko na desktopie (jak w mockupie). */}
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

          {/* Szeroki kadr ze ściany + wazonem i pełnym logo ANOVA STUDIO, wycięty
              z renderu klienta w hi-res (public/images/oferta-hero.jpg,
              1536×924). Na mobile widoczny cały (pod tekstem, pełna szerokość,
              naturalne proporcje). Na desktopie stała wysokość + object-cover
              przycina boki, dlatego object-position 75%: kadr przesunięty w prawo
              tak, że logo dostaje margines pustej ściany i nie ląduje na krawędzi
              (gdzie zjadałaby je prawa winieta), a wazon nadal widoczny. */}
          <img
            src="/images/oferta-hero.jpg"
            alt=""
            aria-hidden
            className="h-auto w-full object-cover object-[75%_center] md:h-[26rem]"
            style={{
              // Miękka winieta wtapiająca obraz w tło .plaster ze WSZYSTKICH stron
              // (prawa najszerzej, 42% — logo/ściana łagodnie rozpływają się w tle;
              // lewa 20%) — dzięki temu jeden zestaw masek działa i po prawej
              // (desktop), i pod tekstem (mobile). intersect = maski się przecinają
              // (każda przycina), zamiast domyślnego sumowania widocznego obszaru.
              maskImage:
                "linear-gradient(to right, transparent, #000 20%), linear-gradient(to left, transparent, #000 42%), linear-gradient(to bottom, transparent, #000 12%), linear-gradient(to top, transparent, #000 16%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, #000 20%), linear-gradient(to left, transparent, #000 42%), linear-gradient(to bottom, transparent, #000 12%), linear-gradient(to top, transparent, #000 16%)",
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          />
        </div>
      </section>

      {/* Ambientowe światło ściany — miękka bursztynowa poświata z góry-prawej,
          kontynuacja kierunku światła z hero (.plaster). Pełna szerokość (full-bleed),
          niska intensywność, żeby beż nie był płaski. Treść siedzi nad tłem naturalnie. */}
      <section className="relative isolate overflow-hidden bg-[radial-gradient(58%_42%_at_86%_0%,color-mix(in_srgb,var(--color-glow)_20%,transparent),transparent_70%)]">
        <Watermark className="bottom-[-4%] right-[-4%] h-[480px]" />
        <div className="mx-auto max-w-6xl px-5 pb-16 md:pb-24">
          <OfferMenu />

          {/* Domykające, spokojne CTA — bez ikon i kart, samo światło i typografia. */}
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
