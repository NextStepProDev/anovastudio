import Link from "next/link";
import Reveal from "@/components/Reveal";
import Watermark from "@/components/Watermark";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";

// Art direction: desktop = landscape crops (as before), mobile = portrait crops
// (IMG_4670 physiotherapy / IMG_4640 massage / IMG_4600 training).
const heroSlides: HeroSlide[] = [
  {
    kind: "brand",
    alt: "Anova Studio — fizjoterapia, masaż, trening",
  },
  {
    desktop: "/images/hero.jpg",
    mobile: "/images/hero-mobile-1.jpg",
    alt: "Fizjoterapeutka podczas pracy z pacjentem w Anova Studio",
  },
  {
    desktop: "/images/hero-2.jpg",
    mobile: "/images/hero-mobile-2.jpg",
    alt: "Masaż i terapia manualna w Anova Studio",
  },
  {
    desktop: "/images/hero-3.jpg",
    mobile: "/images/hero-mobile-3.jpg",
    alt: "Trening medyczny w Anova Studio",
  },
];

// The offer teaser under the hero — deliberately separate from OFFER_SERVICES (`lib/offer.ts`).
// The price list groups by SERVICE (Physiotherapy with orthopedic/sports/dental scopes),
// while this strip speaks the language of a patient looking for their complaint, not for
// a price-list item — hence the scopes stand here as separate keywords.
// ⚠️ A mismatch has cost once already: dental physiotherapy entered the price list and for
// three weeks did not exist on the home page, although it reached the JSON-LD. When adding
// or changing anything in OFFER_SERVICES, review this list.
const services = [
  "Fizjoterapia ortopedyczna",
  "Fizjoterapia sportowa",
  "Fizjoterapia stomatologiczna",
  "Gimnastyka korekcyjna",
  "Trening medyczny",
  "Kinesiotaping",
  "Masaż",
];

export default function Home() {
  return (
    <>
      {/* A full-bleed hero — the photo fills the whole section and "presses" on the text,
          the gradient keeps the text readable. Responsively:
          • mobile: a vertical layout — the photo on top, the text anchored at the bottom on
            a cream shelf (gradient from the bottom),
          • desktop: the text on the left over a horizontal gradient, the photo revealed on the right. */}
      <section className="relative flex min-h-[calc(100svh-82px)] items-end overflow-hidden bg-paper md:items-center">
        {/* The veil under the text now lives in the carousel (per slide) — the brand card
            does not get it, because it is cream and the veil would only eat the logo. See `PhotoVeil`. */}
        <div aria-hidden className="absolute inset-0">
          <HeroCarousel slides={heroSlides} />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-5 py-12 md:py-12">
          <Reveal className="max-w-xl">
            {/* The kicker on desktop only — on the cream left side it looks lovely, while on
                mobile, above the photo, it lost readability. The content is in the logo anyway. */}
            <p className="kicker hidden md:flex">Fizjoterapia · Masaż · Trening</p>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight md:mt-4 md:text-6xl">
              Odzyskaj swobodę.
              <br />
              Na nowo.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-ink-soft">
              Indywidualne podejście, skuteczna terapia i zespół, któremu możesz
              zaufać.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/kontakt" className="btn btn-primary">
                Umów wizytę
              </Link>
              <Link href="/oferta" className="btn btn-outline">
                Zobacz ofertę
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-paper-warm">
        <Reveal delay={0.1}>
          {/* The number of columns follows the length of the list: with seven keywords a
              six-column grid left the last one alone in a second row. */}
          <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-4 px-5 py-10 sm:grid-cols-4 md:grid-cols-7 md:divide-x md:divide-line">
            {services.map((service) => (
              <li
                key={service}
                className="text-center font-display text-sm font-medium tracking-wide text-ink-soft transition-colors hover:text-ink"
              >
                {service}
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* The manifesto — the emotional core of the page (Ania's copy). Each line in its own
          Reveal, so it reveals only when it scrolls into view itself (a cascade on scroll). */}
      <section className="bg-paper">
        <div className="mx-auto max-w-2xl px-5 py-20 md:py-28">
          <Reveal>
            <p className="kicker">Bo zdrowie zaczyna się od ruchu</p>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
              Każde ciało ma swoją historię.
            </h2>
          </Reveal>
          {/* A reflective passage in serif italics (Fraunces) — it sets it apart "literarily"
              without breaking the consistency of the typography. */}
          <div className="mt-6 space-y-2 font-display text-xl italic leading-relaxed text-ink-soft md:text-2xl">
            <Reveal>
              <p>Czasem jest nią kontuzja.</p>
            </Reveal>
            <Reveal>
              <p>Czasem przewlekły ból.</p>
            </Reveal>
            <Reveal>
              <p>Czasem przeciążenie.</p>
            </Reveal>
            <Reveal>
              <p>
                A czasem po prostu chęć, by znów czuć się dobrze we własnym
                ciele.
              </p>
            </Reveal>
          </div>
          <Reveal>
            <p className="mt-8 font-display text-xl font-medium leading-relaxed text-ink">
              ANOVA Studio powstało po to, aby pomagać ludziom wracać do tego, co
              dla nich ważne.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Cytat-przerywnik. */}
      <section className="relative isolate border-y border-line bg-paper-warm">
        {/* desktop only — on mobile the sections stack vertically and this graver landed
            directly above the CTA section's graver (two marks one above the other) */}
        {/* its own filter id — this page has TWO watermarks (the second in the CTA section
            below), and the default id would give a duplicate id in the document */}
        <Watermark
          id="anova-emboss-quote"
          surface="paperWarm"
          className="hidden left-[-9%] top-1/2 h-[230%] -translate-y-1/2 md:block"
        />
        <Reveal className="mx-auto max-w-4xl px-5 py-16 text-center md:py-20">
          <p className="font-display text-2xl font-medium leading-snug tracking-tight text-ink md:text-3xl">
            Twoje ciało. Twój ruch. Twój moment.
          </p>
        </Reveal>
      </section>

      {/* The closing section with the CTA (Ania's copy). */}
      <section className="relative isolate bg-paper">
        <Watermark
          id="anova-emboss-cta"
          className="right-[-12%] top-1/2 h-[170%] -translate-y-1/2"
        />
        <Reveal className="mx-auto max-w-3xl px-5 py-20 text-center md:py-28">
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
            Wróć do siebie.
            <br />
            Do ruchu. Do sprawności. Do życia bez bólu.
          </h2>
          <p className="mt-6 text-lg leading-8 text-ink-soft">
            Poczuj się dobrze we własnym ciele.
          </p>
          <div className="mt-10 flex justify-center">
            <Link href="/kontakt" className="btn btn-primary">
              Umów wizytę
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
