import type { Metadata } from "next";
import Image from "next/image";
import { getStaff, strapiMediaUrl } from "@/lib/strapi";
import { BRAND } from "@/lib/contact";
import { pageMetadata } from "@/lib/seo";
import Reveal from "@/components/Reveal";
import StaffDetails from "@/components/StaffDetails";
import Watermark from "@/components/Watermark";

// A function, not a constant: Next's metadata resolver consumes the object passed in,
// and the page can be rendered several times in one process (the card image got lost).
export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Zespół",
    description: `Poznaj zespół ${BRAND} — doświadczonych fizjoterapeutów, którzy pomogą Ci wrócić do pełnej sprawności.`,
    path: "/zespol",
  });
}

export default async function ZespolPage() {
  const staff = await getStaff();

  return (
    <section className="relative isolate mx-auto max-w-6xl px-5 py-16 md:py-24">
      <Watermark className="right-[-4%] top-[2%] h-[400px]" />
      <p className="kicker">Zespół</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink">
        Ludzie, którym możesz zaufać
      </h1>

      {/* The empty state — the same contract as on Galeria (`galeria/page.tsx`). Without it
          an empty response from Strapi (an unpublished entry or a dead CMS, which
          `lib/strapi.ts` is deliberately prepared for) left just the heading over a void
          here — the page looked broken instead of like a page without content. */}
      {staff.length === 0 ? (
        <p className="mt-14 max-w-md text-lg leading-8 text-ink-soft">
          Prezentacja zespołu jest w przygotowaniu — zajrzyj tu wkrótce.
        </p>
      ) : (
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member, index) => (
            <Reveal
              key={member.documentId}
              delay={index * 0.1}
              className="group"
            >
              <article>
                <div className="photo-frame relative aspect-[3/4] bg-paper-warm ring-1 ring-line shadow-[0_24px_60px_-24px_color-mix(in_srgb,var(--color-accent)_45%,transparent)]">
                  {member.photo && (
                    <Image
                      src={strapiMediaUrl(
                        member.photo.formats?.medium?.url ?? member.photo.url,
                      )}
                      alt={member.photo.alternativeText ?? member.fullName}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                <h2 className="mt-5 font-display text-xl font-semibold text-ink">
                  {member.fullName}
                </h2>
                <p className="mt-1 font-display text-sm font-medium uppercase tracking-wide text-accent">
                  {member.position}
                </p>
                <StaffDetails
                  bio={member.bio}
                  courses={member.courses}
                  className="mt-3"
                />
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
