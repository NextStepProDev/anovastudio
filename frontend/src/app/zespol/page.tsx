import type { Metadata } from "next";
import Image from "next/image";
import { getStaff, strapiMediaUrl } from "@/lib/strapi";
import { BRAND } from "@/lib/contact";
import Reveal from "@/components/Reveal";
import ExpandableBio from "@/components/ExpandableBio";

export const metadata: Metadata = {
  title: "Zespół",
  description: `Poznaj zespół ${BRAND} — doświadczonych fizjoterapeutów, którzy pomogą Ci wrócić do pełnej sprawności.`,
};

export default async function ZespolPage() {
  const staff = await getStaff();

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <p className="kicker">Zespół</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink">
        Ludzie, którym możesz zaufać
      </h1>

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
            {member.bio && <ExpandableBio text={member.bio} className="mt-3" />}
            {member.courses && (
              <div className="mt-4">
                <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">
                  Kursy i szkolenia
                </p>
                <ul className="mt-2 space-y-1 text-sm leading-6 text-ink-soft">
                  {member.courses
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .map((course) => (
                      <li
                        key={course}
                        className="relative pl-4 before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-accent"
                      >
                        {course}
                      </li>
                    ))}
                </ul>
              </div>
            )}
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
