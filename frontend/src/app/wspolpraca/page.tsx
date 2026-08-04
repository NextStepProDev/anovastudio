import type { Metadata } from "next";
import Link from "next/link";
import { BRAND, CONTACT } from "@/lib/contact";
import { pageMetadata } from "@/lib/seo";
import { PARTNERS } from "@/lib/partners";
import Reveal from "@/components/Reveal";
import Watermark from "@/components/Watermark";

// Funkcja, nie stała: resolver metadanych Next-a zjada przekazany obiekt,
// a strona bywa renderowana kilka razy w jednym procesie (gubiła się grafika karty).
export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Współpraca",
    description: `Współpraca z gabinetem ${BRAND} w Libiążu — oferta dla klubów sportowych, firm i grup zorganizowanych.`,
    path: "/wspolpraca",
  });
}

const audiences = [
  {
    name: "Kluby sportowe",
    text: "Opieka fizjoterapeutyczna zawodników — profilaktyka urazów, szybszy powrót do treningu po kontuzji i wsparcie w trakcie sezonu.",
  },
  {
    name: "Firmy",
    text: "Zdrowy zespół to mniej zwolnień. Pakiety dla pracowników, warsztaty ergonomii i profilaktyka bólu pleców przy pracy siedzącej.",
  },
  {
    name: "Grupy zorganizowane",
    text: "Zajęcia ruchowe i konsultacje dla grup — od gimnastyki korekcyjnej dla dzieci po trening zdrowotny dla seniorów.",
  },
];

export default function WspolpracaPage() {
  return (
    <section className="relative isolate mx-auto max-w-6xl px-5 py-16 md:py-24">
      <Watermark className="right-[-4%] top-[2%] h-[400px]" />
      <Reveal>
        <p className="kicker">Współpraca</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink">
          Współpracujmy dla zdrowia
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-soft">
          Współpracujemy z klubami sportowymi, firmami i grupami
          zorganizowanymi. Każdą współpracę dopasowujemy do potrzeb — napisz
          lub zadzwoń, a przygotujemy ofertę dla Twojej organizacji.
        </p>
      </Reveal>

      <ul className="mt-14 grid gap-8 md:grid-cols-3">
        {audiences.map((audience, index) => (
          <Reveal
            as="li"
            key={audience.name}
            delay={index * 0.1}
            className="border border-line bg-paper-warm p-8 transition-all duration-300 hover:border-accent hover:shadow-[0_16px_48px_-16px_color-mix(in_srgb,var(--color-accent)_35%,transparent)]"
          >
            <span className="font-display text-sm font-semibold tracking-[0.2em] text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">
              {audience.name}
            </h2>
            <p className="mt-3 text-sm leading-6 text-ink-soft">
              {audience.text}
            </p>
          </Reveal>
        ))}
      </ul>

      {/* Ściana partnerów — logotypy klikalne, prowadzą na stronę partnera.
          Wspólne wykończenie (wyszarzenie + mix-blend-multiply, pełny kolor na
          hover) ujednolica różnorodne źródła: czarne znaki, kolorowy herb i
          logo na białym tle „rozpływają się" w ciepłym kafelku, a pod kursorem
          rozświetlają. */}
      <div className="mt-20 md:mt-28">
        <Reveal>
          <p className="kicker">Partnerzy</p>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Zaufali nam
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-ink-soft">
            Kluby sportowe i organizacje, z którymi współpracujemy na co dzień.
            Kliknij logo, aby przejść na stronę partnera.
          </p>
        </Reveal>

        {/* flex, nie grid — przy liczbie partnerów niepodzielnej przez liczbę kolumn
            (dziś 5 na 4) siatka zostawiłaby samotny kafelek dociśnięty do lewej;
            wrap z justify-center domyka ostatni rząd na środku. Szerokości liczone
            z gapów, żeby rytm był identyczny jak w siatce: 2 kolumny / 4 kolumny. */}
        <ul className="mt-10 flex flex-wrap justify-center gap-4 md:gap-6">
          {PARTNERS.map((partner, index) => (
            <Reveal
              as="li"
              key={partner.name}
              delay={index * 0.08}
              className="w-[calc(50%-0.5rem)] md:w-[calc(25%-1.125rem)]"
            >
              <a
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${partner.name} — otwórz stronę partnera w nowej karcie`}
                className="group flex h-32 items-center justify-center border border-line bg-paper-warm p-6 transition-all duration-300 hover:border-accent hover:shadow-[0_16px_48px_-16px_color-mix(in_srgb,var(--color-accent)_35%,transparent)] md:h-36"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  loading="lazy"
                  className="max-h-full w-auto max-w-[78%] object-contain opacity-70 mix-blend-multiply grayscale transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100 group-hover:grayscale-0"
                />
              </a>
            </Reveal>
          ))}
        </ul>
      </div>

      <Reveal delay={0.2} className="mt-20 md:mt-28">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/kontakt" className="btn btn-primary">
            Skontaktuj się z nami
          </Link>
          <a href={CONTACT.phoneHref} className="btn btn-outline">
            {CONTACT.phoneDisplay}
          </a>
        </div>
      </Reveal>
    </section>
  );
}
