import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

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
      {/* flex-1: the dark hero absorbs any leftover viewport height (main is a
          flex column), so no light gap opens between the services strip and the footer. */}
      <section className="section-dark grain relative flex flex-1 flex-col justify-center overflow-hidden">
        <div aria-hidden className="halo absolute inset-0" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
          <Reveal>
            <p className="kicker text-glow">
              Gabinet fizjoterapii ortopedycznej i sportowej
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Ruch to życie.
              <br />
              Pomożemy Ci do niego wrócić.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-8 text-paper/70">
              Dbamy o zdrowie każdego pacjenta. Indywidualne podejście,
              nowoczesne metody i doświadczenie, któremu możesz zaufać.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/kontakt" className="btn btn-primary">
                Umów wizytę
              </Link>
              <Link href="/oferta" className="btn btn-outline-light">
                Zobacz ofertę
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative aspect-[4/3] overflow-hidden border border-glow/30 shadow-[0_0_84px_-10px_color-mix(in_srgb,var(--color-glow)_38%,transparent)]">
              <Image
                src="/images/hero.jpg"
                alt="Fizjoterapeutka podczas pracy z pacjentem"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                preload
              />
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
    </>
  );
}
