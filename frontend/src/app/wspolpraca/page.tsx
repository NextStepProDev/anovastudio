import type { Metadata } from "next";
import Link from "next/link";
import { BRAND, CONTACT } from "@/lib/contact";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Współpraca",
  description: `Współpraca z gabinetem ${BRAND} w Libiążu — oferta dla klubów sportowych, firm i grup zorganizowanych.`,
};

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
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
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
            className="border border-line bg-paper-warm p-8 transition-colors duration-300 hover:border-ink"
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

      <Reveal delay={0.2} className="mt-14">
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
