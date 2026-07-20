/** Nazwa marki — każde użycie nazwy w serwisie musi iść przez tę stałą */
export const BRAND = "Anova Studio";

/** Bazowy URL serwisu (sitemap, robots, canonical). Domena docelowa: anovastudio.pl — ustawić NEXT_PUBLIC_SITE_URL w env produkcyjnym */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const CONTACT = {
  phoneDisplay: "600 711 725",
  phoneHref: "tel:+48600711725",
  email: "fizjo4life.libiaz@gmail.com",
  addressStreet: "ul. 1 Maja 5C",
  addressCity: "32-590 Libiąż",
  /** Google Calendar Appointment Schedule link — waiting for the client to provide it */
  bookingUrl: null as string | null,
  /** Profile społecznościowe — wstawić właściwe adresy, gdy klientka poda. Renderowane
      tylko gdy != null (wzorzec jak bookingUrl), więc na razie ukryte na stronie. */
  facebook: null as string | null,
  instagram: null as string | null,
  mapsEmbedUrl:
    "https://www.google.com/maps?q=ul.+1+Maja+5C,+Libi%C4%85%C5%BC&output=embed",
  mapsLinkUrl: "https://www.google.com/maps/search/?api=1&query=ul.+1+Maja+5C,+32-590+Libi%C4%85%C5%BC",
};
