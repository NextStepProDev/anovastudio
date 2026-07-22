import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/strapi";
import { BRAND } from "@/lib/contact";
import OfferLocationTabs from "@/components/OfferLocationTabs";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Oferta i cennik",
  description: `Oferta gabinetu ${BRAND} w Libiążu — fizjoterapia ortopedyczna i sportowa, gimnastyka korekcyjna, trening medyczny, kinesiotaping, masaż. Sprawdź cennik.`,
};

export default async function OfertaPage() {
  const services = await getServices();

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

          {/* PLACEHOLDER: kadr ze ściany + wazonem wycięty z renderu klienta
              (public/images/oferta-hero.jpg). Źródło ma tylko 850px, więc obraz
              jest miękki — podmienić na eksport renderu w wysokiej rozdzielczości,
              bez interfejsu. Widoczny też na mobile (pod tekstem, pełna szerokość,
              naturalne proporcje); na desktopie po prawej ze stałą wysokością. */}
          <img
            src="/images/oferta-hero.jpg"
            alt=""
            aria-hidden
            className="h-auto w-full object-cover object-center md:h-[26rem]"
            style={{
              // Miękka winieta wtapiająca obraz w tło .plaster ze WSZYSTKICH stron
              // (lewa mocniej) — dzięki temu jeden zestaw masek działa i po prawej
              // (desktop), i pod tekstem (mobile). intersect = maski się przecinają
              // (każda przycina), zamiast domyślnego sumowania widocznego obszaru.
              maskImage:
                "linear-gradient(to right, transparent, #000 20%), linear-gradient(to left, transparent, #000 12%), linear-gradient(to bottom, transparent, #000 12%), linear-gradient(to top, transparent, #000 16%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, #000 20%), linear-gradient(to left, transparent, #000 12%), linear-gradient(to bottom, transparent, #000 12%), linear-gradient(to top, transparent, #000 16%)",
              maskComposite: "intersect",
              WebkitMaskComposite: "source-in",
            }}
          />
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-5 pb-16 md:pb-24">
        <OfferLocationTabs services={services} />

        <div className="mt-12">
          <Link href="/kontakt" className="btn btn-primary">
            Umów wizytę
          </Link>
        </div>
      </section>
    </div>
  );
}
