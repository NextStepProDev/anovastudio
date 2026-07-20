import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BRAND, SITE_URL } from "@/lib/contact";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND} — Rehabilitacja ortopedyczna i sportowa | Libiąż`,
    template: `%s | ${BRAND}`,
  },
  description: `Gabinet fizjoterapii ortopedycznej i sportowej ${BRAND} w Libiążu. Dbamy o zdrowie każdego pacjenta — fizjoterapia, gimnastyka korekcyjna, trening medyczny, kinesiotaping, masaż.`,
};

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
        <Header />
        {/* min-h pushes the footer below the fold on short pages (100svh minus the 82px
            sticky header); flex lets full-bleed page sections grow into the leftover space. */}
        <main className="flex min-h-[calc(100svh-82px)] flex-1 flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
