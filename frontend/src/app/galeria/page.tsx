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
      <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-accent">
        Galeria
      </p>
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
              <Reveal
                key={photo.url}
                delay={(index % 3) * 0.1}
                className="mb-6 break-inside-avoid"
              >
                <Image
                  src={strapiMediaUrl(format.url)}
                  alt={photo.alternativeText ?? ""}
                  width={format.width}
                  height={format.height}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="w-full bg-paper-warm"
                />
              </Reveal>
            );
          })}
        </div>
      )}
    </section>
  );
}
