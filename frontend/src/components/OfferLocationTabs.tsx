"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import type { Service, ServiceLocation } from "@/lib/strapi";

const LOCATIONS: {
  id: ServiceLocation;
  label: string;
  locative: string;
  hint: string;
}[] = [
  { id: "libiaz", label: "Libiąż", locative: "Libiążu", hint: "ul. 1 Maja 5C" },
  { id: "katowice", label: "Katowice", locative: "Katowicach", hint: "wkrótce" },
];

/**
 * Kafelki wyboru lokalizacji nad cennikiem. Domyślnie Libiąż (jego cennik widzi
 * crawler). Katowice na razie bez usług → komunikat „w przygotowaniu" — kafelek jest
 * gotowy pod przyszłe rozwinięcie oferty. Usługi bez ustawionej lokalizacji
 * traktujemy jak „libiaz".
 */
export default function OfferLocationTabs({ services }: { services: Service[] }) {
  const [active, setActive] = useState<ServiceLocation>("libiaz");
  const filtered = services.filter((s) => (s.location ?? "libiaz") === active);
  const activeLoc = LOCATIONS.find((loc) => loc.id === active)!;

  return (
    <div className="mt-12">
      <div
        role="tablist"
        aria-label="Lokalizacja"
        className="grid gap-4 sm:grid-cols-2"
      >
        {LOCATIONS.map((loc) => {
          const selected = active === loc.id;
          return (
            <button
              key={loc.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(loc.id)}
              className={`flex flex-col items-start gap-1 rounded-2xl border px-6 py-5 text-left transition-all ${
                selected
                  ? "border-accent/60 bg-paper shadow-[0_16px_40px_-24px_color-mix(in_srgb,var(--color-accent)_55%,transparent)]"
                  : "border-line hover:border-ink-muted"
              }`}
            >
              <span
                className={`font-display text-xl font-semibold ${
                  selected ? "text-accent" : "text-ink"
                }`}
              >
                {loc.label}
              </span>
              <span className="text-sm text-ink-muted">{loc.hint}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-lg text-ink-soft">
          {`Oferta w ${activeLoc.locative} jest w przygotowaniu — wkrótce więcej informacji.`}
        </p>
      ) : (
        <ul
          key={active}
          className="mt-12 divide-y divide-line border-y border-line"
        >
          {filtered.map((service, index) => (
            <Reveal
              key={service.documentId}
              as="li"
              delay={index * 0.08}
              className="py-6"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-lg font-semibold">
                  {service.name}
                </h2>
                <span
                  aria-hidden
                  className="hidden flex-1 border-b border-dotted border-ink/20 sm:block"
                />
                <p className="shrink-0 font-display text-lg font-semibold tabular-nums text-accent">
                  {service.price}
                </p>
              </div>
              {service.description && (
                <p className="mt-1 max-w-xl text-sm leading-6 text-ink-soft">
                  {service.description}
                </p>
              )}
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
