/**
 * Testy czystych funkcji pomocniczych — tych, które przetwarzają dane wpisywane
 * ręcznie (ceny w kodzie, kursy w CMS-ie) i przez to mogą dostać na wejściu coś
 * innego, niż zakładał autor. Reszta serwisu to rendering, który sprawdza smoke
 * test w deployu; tutaj chodzi o logikę, którą da się złamać jednym przecinkiem.
 *
 *     npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";

import { priceValue } from "@/lib/schema";
import { parseCourses } from "@/lib/strapi";
import { OFFER_SERVICES } from "@/lib/offer";

test("priceValue wyciąga liczbę z ceny zapisanej po ludzku", () => {
  assert.equal(priceValue("200 zł"), "200");
  assert.equal(priceValue("50 zł"), "50");
  // Spacja jako separator tysięcy — bez usuwania spacji wyszłoby samo "1"
  assert.equal(priceValue("1 200 zł"), "1200");
});

test("priceValue zwraca null, gdy w cenie nie ma liczby", () => {
  // Takie wpisy są realne („do ustalenia", „w pakiecie") i NIE mogą trafić
  // do danych dla Google jako cena — schema.ts pomija wtedy pole `price`.
  assert.equal(priceValue("do ustalenia"), null);
  assert.equal(priceValue(""), null);
});

test("każda usługa w cenniku ma cenę czytelną dla wyszukiwarek", () => {
  // Strażnik na przyszłe edycje lib/offer.ts: cena wpisana bez cyfry wypadłaby
  // po cichu z danych strukturalnych i nikt by tego nie zauważył.
  for (const service of OFFER_SERVICES) {
    assert.ok(
      priceValue(service.price),
      `usługa "${service.name}" ma cenę bez liczby: ${service.price}`,
    );
  }
});

test("parseCourses rozbija tekst z CMS-a na pozycje listy", () => {
  assert.deepEqual(parseCourses("Terapia manualna\nKinesiotaping"), [
    "Terapia manualna",
    "Kinesiotaping",
  ]);
});

test("parseCourses czyści puste linie i spacje z wklejanego tekstu", () => {
  // Tekst wklejany z Worda regularnie niesie puste linie i spacje na końcach —
  // bez czyszczenia lista dostawała puste kropki.
  assert.deepEqual(parseCourses("  Kurs A  \n\n\n   \n Kurs B\n"), [
    "Kurs A",
    "Kurs B",
  ]);
});

test("parseCourses radzi sobie z pustym polem", () => {
  // Pole `courses` jest opcjonalne w Strapi, więc null i undefined są normą.
  assert.deepEqual(parseCourses(null), []);
  assert.deepEqual(parseCourses(undefined), []);
  assert.deepEqual(parseCourses("   "), []);
});
