"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import { OFFER_SERVICES } from "@/lib/offer";
import type { OfferService } from "@/lib/offer";

/** Zakładki cennika to dwie lokalizacje; wartość „oba" pasuje do obu. */
type TabId = "libiaz" | "katowice";

const LOCATIONS: { id: TabId; label: string; locative: string; hint: string }[] =
  [
    { id: "libiaz", label: "Libiąż", locative: "Libiążu", hint: "ul. 1 Maja 5C" },
    { id: "katowice", label: "Katowice", locative: "Katowicach", hint: "wkrótce" },
  ];

const gridColsForScopes = (count: number) =>
  count >= 3 ? "sm:grid-cols-2 md:grid-cols-3" : count === 2 ? "sm:grid-cols-2" : "";

/** Chevron sygnalizujący rozwinięcie pozycji. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Lista pozycji zakresu z markerem-kropką (wspólny wzorzec z resztą strony). */
function ScopeList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 space-y-1.5 text-sm leading-6 text-ink-soft">
      {items.map((item) => (
        <li
          key={item}
          className="relative pl-4 before:absolute before:left-0 before:top-[0.62em] before:h-1 before:w-1 before:rounded-full before:bg-accent"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/**
 * Pojedyncza pozycja menu = rozwijalna „disclosure". Zwinięta pokazuje tylko
 * numer + nazwę + cenę·czas (czysty cennik); klik rozwija lead, zakres i przypis.
 */
function ServiceRow({ service }: { service: OfferService }) {
  const [open, setOpen] = useState(false);
  const panelId = `offer-${service.slug}`;

  return (
    <div
      className={`border-t transition-colors duration-300 ${
        open
          ? "border-accent/35 bg-[radial-gradient(72%_100%_at_0%_0%,color-mix(in_srgb,var(--color-glow)_13%,transparent),transparent_58%)]"
          : "border-line"
      }`}
    >
      <h2 className="font-normal">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="group flex w-full items-baseline gap-x-4 py-7 text-left sm:gap-x-8 sm:py-10"
        >
          {/* Mobile: nazwa i cena w osobnych wierszach (długie „Kinesiotaping" nie
              nachodzi na cenę). sm+: nazwa po lewej, cena po prawej w jednej linii. */}
          <span className="block min-w-0 flex-1 sm:flex sm:items-baseline sm:justify-between sm:gap-6">
            <span className="block break-words font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {service.name}
            </span>
            <span className="mt-1 block whitespace-nowrap font-display text-base font-semibold text-ink-muted sm:mt-0 sm:text-lg">
              <span className="text-accent">{service.price}</span>
              <span className="mx-2 text-line">·</span>
              <span>{service.duration}</span>
            </span>
          </span>
          <span className="shrink-0 self-center text-ink-muted transition-colors group-hover:text-accent">
            <Chevron open={open} />
          </span>
        </button>
      </h2>

      {open && (
        <div id={panelId} className="pb-10 sm:pb-12">
          <p className="max-w-2xl text-sm leading-7 text-ink-soft md:text-base">
            {service.lead}
          </p>
          <div
            className={`mt-7 grid gap-x-10 gap-y-7 ${gridColsForScopes(service.scopes.length)}`}
          >
            {service.scopes.map((scope) => (
              <div key={scope.label}>
                <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-ink">
                  {scope.label}
                </p>
                <ScopeList items={scope.items} />
              </div>
            ))}
          </div>
          {service.footnote && (
            <p className="mt-7 max-w-2xl text-sm italic leading-6 text-ink-soft">
              {service.footnote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * „Menu zabiegów" — redakcyjna, rozwijalna lista usług (bez kart, zdjęć i ikon).
 * Zakładki wybierają lokalizację; usługa trafia do zakładki, gdy jej `location`
 * = ta zakładka lub „oba". Numeracja 01–0N liczona per aktywna zakładka. Treść
 * pochodzi z `lib/offer.ts` (na sztywno). Wszystkie pozycje domyślnie zwinięte.
 */
export default function OfferMenu() {
  const [active, setActive] = useState<TabId>("libiaz");
  const filtered = OFFER_SERVICES.filter(
    (s) => s.location === active || s.location === "oba",
  );
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
        <div key={active} className="mt-10 border-b border-line">
          {filtered.map((service, index) => (
            <Reveal key={service.slug} delay={index * 0.06}>
              <ServiceRow service={service} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
