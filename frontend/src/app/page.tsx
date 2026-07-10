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
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
        <Reveal>
          <p className="kicker">
            Gabinet fizjoterapii ortopedycznej i sportowej
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
            Ruch to życie.
            <br />
            Pomożemy Ci do niego wrócić.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-ink-soft">
            Dbamy o zdrowie każdego pacjenta. Indywidualne podejście,
            nowoczesne metody i doświadczenie, któremu możesz zaufać.
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

        <Reveal delay={0.15} className="relative">
          <div
            aria-hidden
            className="absolute inset-0 translate-x-4 translate-y-4 border border-line bg-paper-warm md:translate-x-6 md:translate-y-6"
          />
          <div className="relative aspect-[4/3] overflow-hidden">
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
