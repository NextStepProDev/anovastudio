/** The brand name — every use of the name on the site must go through this constant */
export const BRAND = "Anova Studio";

/** The site's base URL (sitemap, robots, canonical). Target domain: anovastudio.pl — set NEXT_PUBLIC_SITE_URL in the production env */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const CONTACT = {
  phoneDisplay: "600 711 725",
  phoneHref: "tel:+48600711725",
  email: "kontakt.anovastudio@gmail.com",
  addressStreet: "ul. 1 Maja 5C",
  addressCity: "32-590 Libiąż",
  /** Google Calendar Appointment Schedule link — waiting for the client to provide it */
  bookingUrl: null as string | null,
  /** Social profiles. Rendered only when != null (the same pattern as bookingUrl). */
  facebook: "https://www.facebook.com/gabinetfizjoterapiimasazeLibiaz" as string | null,
  instagram: "https://www.instagram.com/anova_studio_" as string | null,
  mapsEmbedUrl:
    "https://www.google.com/maps?q=ul.+1+Maja+5C,+Libi%C4%85%C5%BC&output=embed",
  mapsLinkUrl: "https://www.google.com/maps/search/?api=1&query=ul.+1+Maja+5C,+32-590+Libi%C4%85%C5%BC",
};
