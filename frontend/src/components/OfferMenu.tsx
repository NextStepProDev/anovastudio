"use client";

import { useState } from "react";
import Reveal from "@/components/Reveal";
import { OFFER_SERVICES } from "@/lib/offer";
import type { OfferService } from "@/lib/offer";

/** The price list's tabs are the two locations; the value "oba" matches both. */
type TabId = "libiaz" | "katowice";

const LOCATIONS: { id: TabId; label: string; locative: string; hint: string }[] =
  [
    { id: "libiaz", label: "Libiąż", locative: "Libiążu", hint: "ul. 1 Maja 5C" },
    { id: "katowice", label: "Katowice", locative: "Katowicach", hint: "wkrótce" },
  ];

const gridColsForScopes = (count: number) =>
  count >= 3 ? "sm:grid-cols-2 md:grid-cols-3" : count === 2 ? "sm:grid-cols-2" : "";

/** A chevron signalling that an item expands. */
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

/** A scope's list of items with a dot marker (a pattern shared with the rest of the site). */
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
 * A single menu item = an expandable "disclosure". Collapsed, it shows only the number +
 * name + price·duration (a clean price list); a click expands the lead, scope and note.
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
          {/* Mobile: name and price on separate rows (the long "Kinesiotaping" does not run
              into the price). sm+: name on the left, price on the right on one line. */}
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

      {/* The panel is ALWAYS in the tree; collapsed, it is hidden by the `hidden`
          attribute — not an `&&` condition. Conditional rendering meant the service
          description, the lists of complaints and the note never reached the page's
          markup at all: Googlebot does not click disclosures, so the most keyword-rich
          content of the whole site was invisible to the search engine. As a bonus Ctrl+F
          works and `aria-controls` points at an existing element. */}
      <div id={panelId} hidden={!open} className="pb-10 sm:pb-12">
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
    </div>
  );
}

/**
 * The "treatment menu" — an editorial, expandable list of services (no cards, photos or
 * icons). The tabs choose the location; a service goes into a tab when its `location` =
 * that tab or "oba". The content comes from `lib/offer.ts` (hardcoded).
 * All items collapsed by default.
 */
export default function OfferMenu() {
  const [active, setActive] = useState<TabId>("libiaz");
  const filtered = OFFER_SERVICES.filter(
    (s) => s.location === active || s.location === "oba",
  );
  const activeLoc =
    LOCATIONS.find((loc) => loc.id === active) ?? LOCATIONS[0];

  return (
    <div className="mt-12">
      {/* Deliberately plain buttons with `aria-pressed`, NOT role="tab": the full ARIA tabs
          pattern needs a panel with role="tabpanel", `aria-controls` and arrow-key handling.
          Before, there were bare roles without those behaviours, so a screen reader
          announced "tab 1 of 2" and promised control that was not there. Two toggle
          buttons describe what these tiles really are: a filter. */}
      <div role="group" aria-label="Lokalizacja" className="grid gap-4 sm:grid-cols-2">
        {LOCATIONS.map((loc) => {
          const selected = active === loc.id;
          return (
            <button
              key={loc.id}
              type="button"
              aria-pressed={selected}
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
          Oferta w {activeLoc.locative} jest w przygotowaniu — wkrótce więcej
          informacji.
        </p>
      ) : (
        // key={active} on purpose: switching the tab remounts the list, so Reveal plays
        // the entrance animation again for the new set of items.
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
