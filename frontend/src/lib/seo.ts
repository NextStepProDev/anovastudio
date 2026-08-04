import type { Metadata } from "next";
import { BRAND, SITE_URL } from "@/lib/contact";

/** Grafika karty — 1200×630, generowana przez trasę `app/og/route.tsx`. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_ALT = `${BRAND} — fizjoterapia, masaż i trening w Libiążu`;

/** Świeży obiekt na każde wywołanie — resolver metadanych Next-a go zjada. */
export const ogImage = () => ({
  url: `${SITE_URL}/og`,
  ...OG_IMAGE_SIZE,
  alt: OG_IMAGE_ALT,
});

/**
 * Metadane podstrony: tytuł, opis, canonical i karta społecznościowa (OG + X).
 *
 * Next scala metadane PŁYTKO — obiekt `openGraph` z page.tsx nadpisuje ten
 * z layoutu w całości, więc każda podstrona musi podać komplet pól. Stąd ten
 * helper: jedno źródło kształtu karty. Tytuł w `<title>` dostaje szablon
 * „… | Anova Studio" z layoutu — do OG trzeba go dopisać ręcznie, bo szablon
 * obejmuje wyłącznie `title`.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** Ścieżka od korzenia, np. "/oferta" — rozwijana o domenę przez metadataBase. */
  path: string;
}): Metadata {
  const fullTitle = `${title} | ${BRAND}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: BRAND,
      locale: "pl_PL",
      url: path,
      title: fullTitle,
      description,
      images: [ogImage()],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage()],
    },
  };
}
