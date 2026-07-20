import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/strapi";
import { BRAND } from "@/lib/contact";
import OfferLocationTabs from "@/components/OfferLocationTabs";

export const metadata: Metadata = {
  title: "Oferta i cennik",
  description: `Oferta gabinetu ${BRAND} w Libiążu — fizjoterapia ortopedyczna i sportowa, gimnastyka korekcyjna, trening medyczny, kinesiotaping, masaż. Sprawdź cennik.`,
};

export default async function OfertaPage() {
  const services = await getServices();

  return (
    <div className="relative flex-1 overflow-hidden bg-paper">
      <section className="relative mx-auto max-w-6xl px-5 py-16 md:py-24">
        <p className="kicker">Oferta i cennik</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">
          Jak możemy Ci pomóc
        </h1>

        <OfferLocationTabs services={services} />

        <div className="mt-12">
          <Link href="/kontakt" className="btn btn-primary">
            Umów wizytę
          </Link>
        </div>
      </section>
    </div>
  );
}
