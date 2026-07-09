import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "fizjo4life — Rehabilitacja ortopedyczna i sportowa | Libiąż",
    template: "%s | fizjo4life",
  },
  description:
    "Gabinet fizjoterapii ortopedycznej i sportowej fizjo4life w Libiążu. Dbamy o zdrowie każdego pacjenta — fizjoterapia, gimnastyka korekcyjna, trening medyczny, kinesiotaping, masaż.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
