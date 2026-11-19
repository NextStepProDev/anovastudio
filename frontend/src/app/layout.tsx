import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BRAND, SITE_URL } from "@/lib/contact";
import { localBusinessSchema } from "@/lib/schema";
import { ogImage } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  // normal + italic (Fraunces' real italic, not a synthetic faux italic)
  style: ["normal", "italic"],
});

/**
 * Pages without CMS content (`/`, `/oferta`, `/kontakt`, `/wspolpraca`) were fully static,
 * so the year in the footer (`new Date().getFullYear()`) was burned into the image at
 * build time and on 1 January would show the old year until the next deploy. A day of
 * revalidation costs nothing on a business-card site, and the problem goes away at the
 * source. Pages fetching data from Strapi have their own, shorter window (60 s in
 * lib/strapi.ts) — Next takes the smaller value, so this constant does not slow them down.
 */
export const revalidate = 86400;

const HOME_TITLE = `${BRAND} — Rehabilitacja ortopedyczna i sportowa | Libiąż`;
const HOME_DESCRIPTION = `Gabinet fizjoterapii ortopedycznej i sportowej ${BRAND} w Libiążu. Dbamy o zdrowie każdego pacjenta — fizjoterapia, gimnastyka korekcyjna, trening medyczny, kinesiotaping, masaż.`;

// A function, not a constant — for the same reason the subpages have `generateMetadata()`
// (see lib/seo.ts): Next's metadata resolver consumes the object passed in, and the
// layout renders once for every page in the process. With `export const metadata` the
// card object was created once, at module load, and shared by all renders — exactly the
// pattern deliberately abandoned on the subpages.
export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: HOME_TITLE,
      template: `%s | ${BRAND}`,
    },
    description: HOME_DESCRIPTION,
    applicationName: BRAND,
    // Subpages override this with their own canonical (see lib/seo.ts); here, the home page.
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: BRAND,
      locale: "pl_PL",
      url: "/",
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: [ogImage()],
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: [ogImage()],
    },
    robots: {
      index: true,
      follow: true,
      // Permission for a large image preview and the full text snippet in Google results.
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${inter.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* The clinic's business card for search engines — address, phone, price list, profiles. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema()),
          }}
        />
        {/* Skip to content for keyboards and screen readers — invisible until it gets focus,
            then it slides in over the menu bar (z-60 > sticky header). */}
        <a
          href="#tresc"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-5 focus:py-3 focus:font-display focus:text-sm focus:font-semibold focus:text-paper"
        >
          Przejdź do treści
        </a>
        <Header />
        {/* min-h pushes the footer below the fold on short pages (100svh minus the 82px
            sticky header); flex lets full-bleed page sections grow into the leftover space. */}
        <main id="tresc" className="flex min-h-[calc(100svh-82px)] flex-1 flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
