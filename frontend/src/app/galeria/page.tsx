import type { Metadata } from "next";
import Image from "next/image";
import { getGalleryPhotos, strapiMediaUrl } from "@/lib/strapi";
import { BRAND } from "@/lib/contact";
import { pageMetadata } from "@/lib/seo";
import Reveal from "@/components/Reveal";

// Funkcja, nie stała: resolver metadanych Next-a zjada przekazany obiekt,
// a strona bywa renderowana kilka razy w jednym procesie (gubiła się grafika karty).
export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Galeria",
    description: `Zobacz gabinet ${BRAND} w Libiążu — wnętrza, sprzęt i nasza codzienna praca z pacjentami.`,
    path: "/galeria",
  });
}

export default async function GaleriaPage() {
  const photos = await getGalleryPhotos();

  return (
    <section className="relative isolate mx-auto max-w-6xl px-5 py-16 md:py-24">
      <p className="kicker">Galeria</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink">
        Zajrzyj do naszego gabinetu
      </h1>

      {photos.length === 0 ? (
        <p className="mt-14 max-w-md text-lg leading-8 text-ink-soft">
          Galeria jest w przygotowaniu — zajrzyj tu wkrótce.
        </p>
      ) : (
        <div className="mt-14 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {photos.map((photo, index) => {
            const format = photo.formats?.medium ?? photo;
            return (
              // Safari mis-positions the first item of each CSS-column when the
              // child is display:block — break-inside-avoid alone doesn't fix it,
              // so the column child is inline-block w-full (the canonical masonry
              // fix). The hover `group` lives on this stable break element, NOT on
              // the Reveal: Motion keeps an inline transform on the Reveal through
              // its whileInView cycle, which made group-hover flaky on first load
              // and broke rounded overflow-clipping — so the frame is a plain
              // rectangle (overflow-hidden, no radius) on the Motion element.
              <div
                key={photo.url}
                className="group mb-6 inline-block w-full break-inside-avoid"
              >
                <Reveal
                  delay={(index % 3) * 0.1}
                  className="block overflow-hidden"
                >
                  <Image
                    src={strapiMediaUrl(format.url)}
                    // Opis z Media Library, a gdy go brak — opis zastępczy z numerem.
                    // `alt=""` znaczy „obrazek czysto dekoracyjny, pomiń": czytnik
                    // ekranu przechodził nad CAŁĄ galerią bez słowa, a dla wyszukiwarki
                    // 27 zdjęć gabinetu nie niosło żadnej treści. Numer w opisie jest
                    // celowy — 27 identycznych zdań brzmi w czytniku jak zacięta płyta.
                    // Docelowo pole `alternativeText` uzupełnia się w panelu Strapi
                    // i wtedy ten zapas nie jest używany.
                    alt={
                      photo.alternativeText?.trim() ||
                      `Wnętrze gabinetu ${BRAND} w Libiążu — zdjęcie ${index + 1} z ${photos.length}`
                    }
                    width={format.width}
                    height={format.height}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="w-full bg-paper-warm transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </Reveal>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
