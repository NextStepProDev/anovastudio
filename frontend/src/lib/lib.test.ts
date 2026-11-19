/**
 * Tests of the pure helpers — the ones that process data typed in by hand (prices in the
 * code, courses in the CMS) and so may get input other than the author assumed. The rest
 * of the site is rendering, checked by the smoke test in the deploy; this is about logic
 * that a single comma can break.
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
  // A space as the thousands separator — without removing spaces the result would be just "1"
  assert.equal(priceValue("1 200 zł"), "1200");
});

test("priceValue zwraca null, gdy w cenie nie ma liczby", () => {
  // Such entries are real ("do ustalenia", "w pakiecie") and must NOT reach Google's data
  // as a price — schema.ts then leaves out the `price` field.
  assert.equal(priceValue("do ustalenia"), null);
  assert.equal(priceValue(""), null);
});

test("każda usługa w cenniku ma cenę czytelną dla wyszukiwarek", () => {
  // A guard for future edits of lib/offer.ts: a price typed without a digit would
  // silently drop out of the structured data and nobody would notice.
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
  // Text pasted from Word regularly carries empty lines and trailing spaces — without
  // cleanup the list got empty bullets.
  assert.deepEqual(parseCourses("  Kurs A  \n\n\n   \n Kurs B\n"), [
    "Kurs A",
    "Kurs B",
  ]);
});

test("parseCourses radzi sobie z pustym polem", () => {
  // The `courses` field is optional in Strapi, so null and undefined are normal.
  assert.deepEqual(parseCourses(null), []);
  assert.deepEqual(parseCourses(undefined), []);
  assert.deepEqual(parseCourses("   "), []);
});
