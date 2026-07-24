/**
 * Treść oferty — świadomie trzymana na sztywno w kodzie, nie w Strapi.
 * To zamknięty, rzadko zmienny zestaw usług (jedna cena za ustalony czas na
 * usługę), a redakcyjny układ „menu zabiegów" jest ściśle sprzężony z treścią —
 * modelowanie tego w CMS-ie było overkillem. Zmiana ceny/tekstu = edycja tego
 * pliku. Listy w mianowniku (czytają się samodzielnie, bez nagłówka „Pomagamy w").
 */

/** "oba" = usługa widoczna w obu lokalizacjach. */
export type OfferLocation = "libiaz" | "katowice" | "oba";

/** Zakres usługi: etykieta (małe kapitaliki) + lista pozycji. */
export interface OfferScope {
  label: string;
  items: string[];
}

export interface OfferService {
  slug: string;
  name: string;
  lead: string;
  price: string;
  duration: string;
  location: OfferLocation;
  scopes: OfferScope[];
  footnote?: string;
}

export const OFFER_SERVICES: OfferService[] = [
  {
    slug: "fizjoterapia",
    name: "Fizjoterapia",
    lead: "Skuteczna terapia oparta na dokładnej diagnostyce i indywidualnym planie leczenia.",
    price: "200 zł",
    duration: "55 min",
    location: "libiaz",
    footnote:
      "Pierwsza wizyta obejmuje wywiad, diagnostykę funkcjonalną oraz terapię dostosowaną do indywidualnych potrzeb.",
    scopes: [
      {
        label: "Ortopedyczna",
        items: [
          "ból kręgosłupa i rwa kulszowa",
          "ból barku (zespół ciasnoty podbarkowej, bark zamrożony)",
          "ból łokcia (łokieć tenisisty, łokieć golfisty)",
          "ból nadgarstka (cieśń nadgarstka)",
          "ból biodra",
          "ból kolana (kolano biegacza)",
          "ból stopy (ostroga piętowa)",
          "zmiany przeciążeniowe",
          "rehabilitacja po złamaniach",
          "rehabilitacja po artroskopii",
          "rehabilitacja po endoprotezoplastyce",
          "rehabilitacja po rekonstrukcji więzadeł",
          "rehabilitacja po szyciu ścięgna Achillesa",
          "przygotowanie do operacji i powrót po zabiegach",
        ],
      },
      {
        label: "Sportowa",
        items: [
          "urazy i kontuzje sportowe",
          "skręcenia i naderwania",
          "przeciążenia treningowe",
          "powrót do sportu po kontuzji",
          "rehabilitacja po rekonstrukcji ACL",
          "profilaktyka urazów",
          "poprawa mobilności i wydolności ruchowej",
        ],
      },
      {
        label: "Stomatologiczna",
        items: [
          "ból twarzy, zębów i żuchwy",
          "bruksizm",
          "trzaski i blokowanie stawu skroniowo-żuchwowego",
          "ograniczenie otwierania ust",
          "bóle głowy napięciowe",
        ],
      },
    ],
  },
  {
    slug: "masaz",
    name: "Masaż",
    lead: "Terapia wspierająca regenerację, zmniejszenie napięcia oraz poprawę samopoczucia.",
    price: "180 zł",
    duration: "55 min",
    location: "libiaz",
    footnote: "Każdy masaż dobieramy indywidualnie do potrzeb pacjenta.",
    scopes: [
      {
        label: "Polecany przy",
        items: [
          "napięcie mięśniowe",
          "ból pleców i karku",
          "przeciążenia",
          "regeneracja po wysiłku",
          "przewlekły stres",
        ],
      },
      {
        label: "Rodzaje",
        items: [
          "masaż leczniczy (tkanki głębokie)",
          "masaż relaksacyjny",
          "drenaż limfatyczny",
          "masaż sportowy",
          "masaż liftingujący ciała",
          "masaż liftingujący twarzy",
        ],
      },
    ],
  },
  {
    slug: "trening",
    name: "Trening",
    lead: "Indywidualny trening wspierający leczenie, sprawność i bezpieczny powrót do aktywności.",
    price: "180 zł",
    duration: "55 min",
    location: "libiaz",
    footnote: "Każdy trening poprzedzony jest oceną funkcjonalną.",
    scopes: [
      {
        label: "Sprawdza się przy",
        items: [
          "powrót po urazach",
          "rehabilitacja pooperacyjna",
          "bóle przeciążeniowe",
          "poprawa siły i stabilizacji",
          "przygotowanie do aktywności sportowej",
          "profilaktyka nawrotów dolegliwości",
          "wady postawy",
        ],
      },
      {
        label: "Rodzaje",
        items: [
          "trening medyczny",
          "trening funkcjonalny",
          "trening personalny",
          "gimnastyka korekcyjna",
        ],
      },
    ],
  },
  {
    slug: "kinesiotaping",
    name: "Kinesiotaping",
    lead: "Elastyczne aplikacje wspomagające proces leczenia i regeneracji.",
    price: "50 zł",
    duration: "10 min",
    location: "libiaz",
    scopes: [
      {
        label: "Stosujemy przy",
        items: [
          "bóle mięśni i stawów",
          "obrzęki",
          "urazy sportowe",
          "przeciążenia",
          "wsparcie rehabilitacji",
        ],
      },
    ],
  },
];
