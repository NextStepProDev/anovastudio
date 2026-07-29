"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export type HeroSlide =
  /** Kadr fotograficzny — osobny plik na mobile i desktop (art direction). */
  | { kind?: "photo"; desktop: string; mobile: string; alt: string }
  /** Plansza brandowa — logotyp na oświetlonej ścianie, zamiast zdjęcia. */
  | { kind: "brand"; alt: string };

// Docelowe powiększenie kadru w efekcie Ken Burns (aktywny slajd powoli dojeżdża tu).
const KEN_BURNS_SCALE = 1.14;

/**
 * Zdjęcie z art direction: mobile dostaje pionowy kadr, desktop poziomy — przez
 * <picture> z media, więc ładuje się TYLKO pasujący plik. Pierwszy kadr ładowany
 * zachłannie (LCP), pozostałe leniwie.
 */
function SlideImage({
  slide,
  eager,
}: {
  slide: Extract<HeroSlide, { desktop: string }>;
  eager: boolean;
}) {
  return (
    <picture>
      {/* desktop (≥768px) — poziomy kadr */}
      <source media="(min-width: 768px)" srcSet={slide.desktop} />
      {/* mobile — pionowy kadr (domyślny <img>) */}
      <img
        src={slide.mobile}
        alt={slide.alt}
        className="absolute inset-0 h-full w-full object-cover"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
      />
    </picture>
  );
}

/**
 * Kremowy welon, który trzyma nagłówek czytelny NA ZDJĘCIACH:
 * • mobile — pionowy, od dołu (ostrzejsza góra),
 * • desktop — poziomy, od lewej; sięga ~połowy tekstu, prawa strona kadru zostaje
 *   w oryginalnych barwach.
 * Siedzi w slajdzie (a nie nad całą karuzelą), bo plansza brandowa go nie chce:
 * jej tło i tak jest kremowe, więc tekst czyta się bez niego, a welon tylko
 * zmywałby logo i spychał je do krawędzi.
 */
function PhotoVeil() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/66 via-44% to-transparent to-78% md:hidden" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-paper from-10% via-paper/60 via-64% to-transparent to-79% md:block" />
    </>
  );
}

/**
 * Plansza otwierająca rotację: logotyp na oświetlonej ścianie (`.plaster`) z ciepłą
 * poświatą pod znakiem. To nie jest zdjęcie, więc zamiast `object-cover` dostaje
 * własny layout. Wersja `logo-compact` (bez claimu), bo claim powtarza już kicker.
 *
 * Znak dostaje wyłącznie ten obszar kadru, którego nie zajmuje blok tekstu, i skaluje
 * się DO NIEGO — nigdy nie jest wymiarowany procentem ekranu, bo blok tekstu ma
 * szerokość i wysokość w pikselach i przy takim liczeniu wchodzi na napisy.
 */
function BrandSlide({ alt }: { alt: string }) {
  return (
    <div className="plaster absolute inset-0">
      {/* MOBILE (tekst przyklejony do dołu): znak dostaje pas nad nagłówkiem, a jego
          wysokość to wysokość hero minus miejsce bloku tekstu. Blok jest w praktyce
          stały (~380–410 px), więc odejmujemy 430 px zapasu i ograniczamy znak przez
          `max-h-full`: na iPhonie SE zostaje tu tylko ~176 px, więc logo samo maleje
          zamiast wejść w napisy; na wyższych ekranach rośnie. `pt-6` pilnuje, żeby na
          najniższych ekranach znak nie kleił się do belki menu. */}
      <div className="absolute inset-x-0 top-0 flex h-[calc(100%-430px)] items-center justify-center px-6 pb-2 pt-6 md:hidden">
        <div aria-hidden className="halo absolute inset-0" />
        {/* zwykły <img>: to SVG, więc optymalizator next/image nic tu nie wnosi */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo/logo-compact.svg"
          alt={alt}
          width={472}
          height={339}
          className="relative max-h-full w-auto max-w-[68%]"
          decoding="async"
        />
      </div>

      {/* ≥md (tekst w pionie na środku, po lewej): znak idzie do prawej kolumny TEJ SAMEJ
          siatki co treść hero — dlatego kontener powtarza `max-w-6xl px-5`. Szerokość to
          reszta wiersza po bloku tekstu: 36rem (jego `max-w-xl`) + 1.5rem odstępu. Liczone
          z siatki, nie z procentu ekranu, bo przy 768 px rząd przycisków sięga aż do 78%
          szerokości okna i każde „prawe 14%" na niego wchodziło. */}
      <div className="mx-auto hidden h-full max-w-6xl items-center justify-end px-5 md:flex">
        <div className="relative w-[calc(100%-37.5rem)] max-w-[500px]">
          <div aria-hidden className="halo absolute -inset-[40%]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo/logo-compact.svg"
            alt={alt}
            width={472}
            height={339}
            className="relative w-full"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

/** Rozdziela oba typy slajdów — zdjęcie albo planszę brandową. */
function Slide({ slide, eager }: { slide: HeroSlide; eager: boolean }) {
  return slide.kind === "brand" ? (
    <BrandSlide alt={slide.alt} />
  ) : (
    <SlideImage slide={slide} eager={eager} />
  );
}

/**
 * Rotujące zdjęcia w hero — crossfade między kadrami + efekt Ken Burns (powolny zoom
 * na aktywnym kadrze). Respektuje prefers-reduced-motion (jak Reveal): przy ograniczonym
 * ruchu pokazuje statycznie pierwszy kadr, bez rotacji i bez zoomu.
 */
export default function HeroCarousel({
  slides,
  interval = 5000,
}: {
  slides: HeroSlide[];
  interval?: number;
}) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion || slides.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      interval,
    );
    return () => clearInterval(id);
  }, [reduceMotion, slides.length, interval]);

  if (reduceMotion || slides.length < 2) {
    const only = slides[0];
    return (
      <>
        <Slide slide={only} eager />
        {only.kind !== "brand" && <PhotoVeil />}
      </>
    );
  }

  // LCP-em jest pierwszy KADR, a nie plansza brandowa (ta jest czystym SVG), więc
  // zachłannie ładujemy pierwsze prawdziwe zdjęcie w kolejce.
  const firstPhoto = slides.findIndex((slide) => slide.kind !== "brand");

  // Zoom trwa nieco dłużej niż czas ekspozycji + przenikanie, żeby ruch był ciągły.
  const zoomDuration = (interval + 1100) / 1000;

  return (
    <>
      {slides.map((slide, i) => {
        const active = i === index;
        // Ken Burns tylko dla zdjęć. Skalowanie idzie od środka kadru, więc na planszy
        // brandowej wypychało logo (siedzące w górnym pasie) do góry — na mobile znak
        // wjeżdżał pod belkę menu i się ucinał. Logotyp i tak nie zyskuje na zoomie;
        // planszę animuje samo przenikanie.
        const zooms = slide.kind !== "brand";
        return (
          <motion.div
            key={i}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            aria-hidden={!active}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1 }}
              animate={{ scale: active && zooms ? KEN_BURNS_SCALE : 1 }}
              transition={{
                duration: active ? zoomDuration : 0.8,
                ease: active ? "linear" : "easeOut",
              }}
            >
              <Slide slide={slide} eager={i === firstPhoto} />
            </motion.div>
            {/* poza wrapperem Ken Burnsa — welon ma stać nieruchomo, nie zoomować */}
            {slide.kind !== "brand" && <PhotoVeil />}
          </motion.div>
        );
      })}
    </>
  );
}
