import { BRAND, CONTACT, SITE_URL } from "@/lib/contact";
import { OFFER_SERVICES } from "@/lib/offer";

/** "200 zł" → 200. Ceny w ofercie są tekstem (redakcyjnym), schema chce liczby. */
export function priceValue(price: string): string | null {
  const digits = price.replace(/\s/g, "").match(/\d+/);
  return digits ? digits[0] : null;
}

/**
 * Dane gabinetu dla wyszukiwarek (JSON-LD). To one zasilają wizytówkę w Google:
 * nazwa, adres, telefon, profile społecznościowe i cennik usług.
 *
 * `Physiotherapy` to podtyp `MedicalBusiness` (a ten — `LocalBusiness`);
 * wypisujemy oba, żeby parser rozpoznał lokalną firmę nawet bez znajomości
 * wąskiego typu. Godzin otwarcia świadomie NIE podajemy — nie ma ich jeszcze
 * na stronie, a zmyślone byłyby gorsze niż żadne.
 */
export function localBusinessSchema() {
  const offers = OFFER_SERVICES.filter(
    (service) => service.location !== "katowice",
  ).map((service) => {
    const price = priceValue(service.price);
    return {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.lead,
      },
      ...(price ? { price, priceCurrency: "PLN" } : {}),
      url: `${SITE_URL}/oferta`,
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "Physiotherapy"],
    "@id": `${SITE_URL}#gabinet`,
    name: BRAND,
    description: `Gabinet fizjoterapii ortopedycznej i sportowej ${BRAND} w Libiążu — fizjoterapia, masaż, trening medyczny, gimnastyka korekcyjna, kinesiotaping.`,
    url: SITE_URL,
    telephone: CONTACT.phoneHref.replace("tel:", ""),
    email: CONTACT.email,
    image: `${SITE_URL}/images/hero.jpg`,
    logo: `${SITE_URL}/logo/logo.svg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.addressStreet,
      postalCode: "32-590",
      addressLocality: "Libiąż",
      addressRegion: "małopolskie",
      addressCountry: "PL",
    },
    hasMap: CONTACT.mapsLinkUrl,
    areaServed: [
      { "@type": "City", name: "Libiąż" },
      { "@type": "City", name: "Chrzanów" },
      { "@type": "City", name: "Trzebinia" },
    ],
    medicalSpecialty: "Physiotherapy",
    priceRange: "50–200 zł",
    currenciesAccepted: "PLN",
    sameAs: [CONTACT.facebook, CONTACT.instagram].filter(Boolean),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Oferta ${BRAND}`,
      itemListElement: offers,
    },
  };
}
