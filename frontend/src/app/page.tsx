import Link from "next/link";
import Reveal from "@/components/Reveal";
import HeroCarousel, { type HeroSlide } from "@/components/HeroCarousel";

// Art direction: desktop = kadry poziome (jak wcześniej), mobile = kadry pionowe
// (IMG_4670 fizjoterapia / IMG_4640 masaż / IMG_4600 trening).
const heroSlides: HeroSlide[] = [
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

const services = [
  "Fizjoterapia ortopedyczna",
  "Fizjoterapia sportowa",
  "Gimnastyka korekcyjna",
  "Trening medyczny",
  "Kinesiotaping",
  "Masaż",
];

export default function Home() {
  return (
    <>
      {/* Hero full-bleed — zdjęcie wypełnia całą sekcję i „napiera" na tekst, gradient
          trzyma napisy czytelne. Responsywnie:
          • mobile: układ pionowy — zdjęcie u góry, tekst zakotwiczony na dole na kremowej
            półce (gradient od dołu),
          • desktop: tekst po lewej na gradiencie poziomym, zdjęcie odsłonięte po prawej. */}
      <section className="relative flex min-h-[calc(100svh-82px)] items-end overflow-hidden bg-paper md:items-center">
        <div aria-hidden className="absolute inset-0">
          <HeroCarousel slides={heroSlides} />
          {/* mobile: pionowy welon od dołu */}
          <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/70 via-40% to-transparent md:hidden" />
          {/* desktop: poziomy welon od lewej */}
          <div className="absolute inset-0 hidden bg-gradient-to-r from-paper from-5% via-paper/55 via-55% to-transparent md:block" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-5 py-12 md:py-12">
          <Reveal className="max-w-xl">
            {/* Kicker tylko na desktopie — na kremowej lewej stronie wygląda pięknie,
                a na mobile nad zdjęciem tracił czytelność. Treść i tak jest w logu. */}
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
          <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-4 px-5 py-10 sm:grid-cols-3 md:grid-cols-6 md:divide-x md:divide-line">
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

      {/* Manifest — emocjonalny rdzeń strony (copy Ani). Każda linia w osobnym Reveal,
          żeby odsłaniała się dopiero gdy sama wjedzie w widok (kaskada przy scrollu). */}
      <section className="bg-paper">
        <div className="mx-auto max-w-2xl px-5 py-20 md:py-28">
          <Reveal>
            <p className="kicker">Bo zdrowie zaczyna się od ruchu</p>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
              Każde ciało ma swoją historię.
            </h2>
          </Reveal>
          {/* Refleksyjny passus w kursywie serifu (Fraunces) — wyróżnia go „literacko"
              bez łamania spójności typografii. */}
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
      <section className="border-y border-line bg-paper-warm">
        <Reveal className="mx-auto max-w-4xl px-5 py-16 text-center md:py-20">
          <p className="font-display text-2xl font-medium leading-snug tracking-tight text-ink md:text-3xl">
            Twoje ciało. Twój ruch. Twój moment.
          </p>
        </Reveal>
      </section>

      {/* Sekcja domykająca z CTA (copy Ani). */}
      <section className="bg-paper">
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
