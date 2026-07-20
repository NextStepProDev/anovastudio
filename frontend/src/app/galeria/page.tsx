import type { Metadata } from "next";
import Image from "next/image";
import { getGalleryPhotos, strapiMediaUrl } from "@/lib/strapi";
import { BRAND } from "@/lib/contact";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Galeria",
  description: `Zobacz gabinet ${BRAND} w Libiążu — wnętrza, sprzęt i nasza codzienna praca z pacjentami.`,
};

export default async function GaleriaPage() {
  const photos = await getGalleryPhotos();

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
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
              // fix). The Motion transform and overflow-clip stay on the inner
              // Reveal, never on the break element.
              <div
                key={photo.url}
                className="mb-6 inline-block w-full break-inside-avoid"
              >
                <Reveal
                  delay={(index % 3) * 0.1}
                  className="group photo-frame block"
                >
                  <Image
                    src={strapiMediaUrl(format.url)}
                    alt={photo.alternativeText ?? ""}
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
