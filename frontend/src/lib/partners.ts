/**
 * Partnerzy — kluby i organizacje, z którymi gabinet współpracuje.
 * Świadomie trzymane na sztywno w kodzie (jak lib/offer.ts): krótka, rzadko
 * zmienna lista logotypów z linkami. Bez podziału na kategorie — przy tej
 * liczbie jedna czysta „ściana logotypów" czyta się najlepiej; gdyby partnerów
 * mocno przybyło, dopiero wtedy warto dodać pole `category` i grupować.
 *
 * Logotypy w /public/images/partners. Część źródeł jest kolorowa lub na białym
 * tle — ujednolica je wspólne wykończenie w komponencie (wyszarzenie +
 * mix-blend-multiply, pełny kolor na hover), więc pliki wrzucamy „jak są".
 */
export interface Partner {
  /** Pełna nazwa — trafia też w alt logo i aria-label linku. */
  name: string;
  /** Strona partnera (otwierana w nowej karcie). */
  href: string;
  /** Ścieżka do logo względem /public. */
  logo: string;
}

export const PARTNERS: Partner[] = [
  {
    name: "Fire Academy",
    href: "https://www.fireworkout.pl",
    logo: "/images/partners/fire-academy.png",
  },
  {
    name: "Next Step Pro Climbing",
    href: "https://www.nextsteppro.pl",
    logo: "/images/partners/next-step-pro.png",
  },
  {
    name: "Szkoła Piłkarska Górnik Libiąż",
    href: "https://www.szkola.gorniklibiaz.pl",
    logo: "/images/partners/gornik-libiaz.png",
  },
  {
    name: "UKS „Jedynka” Libiąż",
    href: "https://www.facebook.com/profile.php?id=100057182781440",
    logo: "/images/partners/uks-jedynka.png",
  },
];
