import type { Metadata } from "next";
import Image from "next/image";
import { getStaff, strapiMediaUrl } from "@/lib/strapi";

export const metadata: Metadata = {
  title: "Zespół",
  description:
    "Poznaj zespół fizjo4life — doświadczonych fizjoterapeutów, którzy pomogą Ci wrócić do pełnej sprawności.",
};

export default async function ZespolPage() {
  const staff = await getStaff();

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 md:py-24">
      <p className="font-display text-sm font-medium uppercase tracking-[0.2em] text-accent">
        Zespół
      </p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink">
        Ludzie, którym możesz zaufać
      </h1>

      <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <article key={member.documentId}>
            <div className="relative aspect-[3/4] overflow-hidden bg-paper-warm">
              {member.photo && (
                <Image
                  src={strapiMediaUrl(
                    member.photo.formats?.medium?.url ?? member.photo.url,
                  )}
                  alt={member.photo.alternativeText ?? member.fullName}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>
            <h2 className="mt-5 font-display text-xl font-semibold text-ink">
              {member.fullName}
            </h2>
            <p className="mt-1 font-display text-sm font-medium uppercase tracking-wide text-accent">
              {member.position}
            </p>
            {member.bio && (
              <p className="mt-3 text-sm leading-6 text-ink-soft">
                {member.bio}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
