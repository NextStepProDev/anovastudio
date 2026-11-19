/**
 * Partners — clubs and organisations the clinic works with.
 * Deliberately hardcoded (like lib/offer.ts): a short, rarely changing list of logos with
 * links. No categories — at this number one clean "wall of logos" reads best; only if
 * partners grew a lot would it be worth adding a `category` field and grouping.
 *
 * Logos in /public/images/partners. Some sources are coloured or on a white background —
 * the shared finish in the component unifies them (greyscale + mix-blend-multiply, full
 * colour on hover), so files go in "as they are". The only exception: a mark that exists
 * only in a white version (because the partner's site is dark) — on a cream tile it would
 * be invisible, so before adding it we recolour it dark, keeping the alpha channel.
 */
export interface Partner {
  /** The full name — it also goes into the logo's alt and the link's aria-label. */
  name: string;
  /** The partner's site (opened in a new tab). */
  href: string;
  /** The path to the logo relative to /public. */
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
  {
    // No edition number in the name — the tournament is annual, a Roman numeral would go
    // stale by the first August.
    name: "Memoriał Macieja Klimasa",
    href: "https://memorialkeneta.pl",
    logo: "/images/partners/memorial-klimasa.png",
  },
];
