import type { Metadata } from "next";
import { BRAND, CONTACT } from "@/lib/contact";
import Reveal from "@/components/Reveal";
import Watermark from "@/components/Watermark";

export const metadata: Metadata = {
  title: "Kontakt",
  description: `Skontaktuj się z gabinetem ${BRAND} w Libiążu — umów wizytę telefonicznie lub napisz do nas.`,
};

export default function KontaktPage() {
  return (
    // flex-1 + flex-col: the grid grows into the leftover viewport height,
    // so the map column (md:flex-1) stretches instead of leaving dead space.
    <section className="relative isolate mx-auto flex w-full max-w-6xl flex-1 flex-col px-5 py-16 md:py-24">
      <Watermark className="left-[-10%] top-1/2 h-[125%] -translate-y-1/2" />
      <p className="kicker">Kontakt</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink">
        Umów wizytę
      </h1>

      <div className="mt-14 grid flex-1 gap-12 md:grid-cols-2">
        {/* justify-center: dane kontaktowe wiszą w pionie na środku wysokości mapy,
            żeby rozciągnięta mapa nie "wystawała" pod krótszą kolumną tekstu. */}
        <Reveal className="flex flex-col justify-center">
          <dl className="space-y-8">
            <div>
              <dt className="font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Telefon
              </dt>
              <dd className="mt-2">
                <a
                  href={CONTACT.phoneHref}
                  className="font-display text-2xl font-semibold text-ink transition-colors hover:text-accent"
                >
                  {CONTACT.phoneDisplay}
                </a>
              </dd>
            </div>

            <div>
              <dt className="font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">
                E-mail
              </dt>
              <dd className="mt-2">
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-lg text-ink transition-colors hover:text-accent"
                >
                  {CONTACT.email}
                </a>
              </dd>
            </div>

            <div>
              <dt className="font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Adres
              </dt>
              <dd className="mt-2 text-lg leading-7 text-ink">
                {CONTACT.addressStreet}
                <br />
                {CONTACT.addressCity}
              </dd>
            </div>
          </dl>

          <div className="mt-10">
            {CONTACT.bookingUrl ? (
              <a
                href={CONTACT.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Zarezerwuj termin online
              </a>
            ) : (
              <a href={CONTACT.phoneHref} className="btn btn-primary">
                Zadzwoń i umów wizytę
              </a>
            )}
          </div>

          {(CONTACT.facebook || CONTACT.instagram) && (
            <div className="mt-10">
              <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">
                Znajdź nas
              </p>
              <ul className="mt-3 flex gap-6 text-lg">
                {CONTACT.facebook && (
                  <li>
                    <a
                      href={CONTACT.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink transition-colors hover:text-accent"
                    >
                      Facebook
                    </a>
                  </li>
                )}
                {CONTACT.instagram && (
                  <li>
                    <a
                      href={CONTACT.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink transition-colors hover:text-accent"
                    >
                      Instagram
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </Reveal>

        <Reveal delay={0.15} className="flex flex-col">
          {/* Wnętrza osadzonej mapy Google nie da się ostylować (obce origin), ale filtr
              CSS działa na całym elemencie. Wartości dobrane tak, żeby domyślny „ląd"
              Google (#f5f3f0) wypadł dokładnie w kolorze --color-paper: zbicie jasności
              zdejmuje biel, sepia dokłada ciepło, a odsycenie tonuje krzykliwy błękit
              wody i zieleń parków. Na hover filtr znika — ta sama zasada co na ścianie
              partnerów: stonowane w spoczynku, pełny kolor, gdy ktoś naprawdę korzysta.
              Celowo jedna właściwość [filter:...], a nie utilities brightness/sepia/saturate
              — te Tailwind składa w stałej kolejności (jasność, odsycenie, sepia), a filtry
              nie są przemienne: ląd wychodzi wtedy #f9f0e0 zamiast równo w paper. */}
          <div className="group relative aspect-[4/3] overflow-hidden bg-paper-warm md:aspect-auto md:flex-1">
            <iframe
              src={CONTACT.mapsEmbedUrl}
              title={`Mapa dojazdu do gabinetu ${BRAND}`}
              className="absolute inset-0 h-full w-full border-0 [filter:brightness(0.94)_sepia(0.25)_saturate(0.5)] transition-[filter] duration-500 group-hover:[filter:none]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
          <a
            href={CONTACT.mapsLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 self-start text-sm text-ink-soft underline underline-offset-4 transition-colors hover:text-accent"
          >
            Otwórz w Mapach Google
          </a>
        </Reveal>
      </div>
    </section>
  );
}
