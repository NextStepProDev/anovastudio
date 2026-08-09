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
  // normal + italic (prawdziwa kursywa Fraunces, nie sztuczny faux-italic)
  style: ["normal", "italic"],
});

/**
 * Strony bez treści z CMS-a (`/`, `/oferta`, `/kontakt`, `/wspolpraca`) były w pełni
 * statyczne, więc rok w stopce (`new Date().getFullYear()`) wypalał się w obrazie
 * przy budowaniu i 1 stycznia pokazywałby stary rocznik aż do następnego deployu.
 * Doba odświeżania to na wizytówce zerowy koszt, a problem znika u źródła. Strony
 * pobierające dane ze Strapi mają własne, krótsze okno (60 s w lib/strapi.ts) —
 * Next bierze mniejszą z wartości, więc ta stała ich nie spowalnia.
 */
export const revalidate = 86400;

const HOME_TITLE = `${BRAND} — Rehabilitacja ortopedyczna i sportowa | Libiąż`;
const HOME_DESCRIPTION = `Gabinet fizjoterapii ortopedycznej i sportowej ${BRAND} w Libiążu. Dbamy o zdrowie każdego pacjenta — fizjoterapia, gimnastyka korekcyjna, trening medyczny, kinesiotaping, masaż.`;

// Funkcja, nie stała — z tego samego powodu, dla którego podstrony mają
// `generateMetadata()` (patrz lib/seo.ts): resolver metadanych Next-a zjada
// przekazany obiekt, a layout renderuje się raz na każdą stronę w procesie.
// Przy `export const metadata` obiekt karty powstawał jeden raz, przy ładowaniu
// modułu, i był współdzielony przez wszystkie rendery — czyli dokładnie ten
// wzorzec, który na podstronach świadomie porzucono.
export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: HOME_TITLE,
      template: `%s | ${BRAND}`,
    },
    description: HOME_DESCRIPTION,
    applicationName: BRAND,
    // Podstrony nadpisują to własnym canonical (patrz lib/seo.ts); tu obsługa strony głównej.
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
      // Zgoda na duży podgląd zdjęcia i pełny fragment tekstu w wynikach Google.
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
        {/* Wizytówka gabinetu dla wyszukiwarek — adres, telefon, cennik, profile. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema()),
          }}
        />
        {/* Skok do treści dla klawiatury i czytników ekranu — niewidoczny, dopóki
            nie dostanie fokusu, wtedy wjeżdża nad belkę menu (z-60 > sticky header). */}
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
