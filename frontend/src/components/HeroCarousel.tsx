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
 * Plansza brandowa dostaje własny, znacznie subtelniejszy zoom — i to na SAMYM znaku,
 * wokół jego środka, a nie na całym slajdzie. Skalowanie slajdu idzie od środka kadru,
 * więc wypychało logo (siedzące w pasie u góry) pod belkę menu; znak rosnący wokół
 * własnego środka rozchodzi się symetrycznie i mieści w zapasie, jaki ma pas.
 */
const BRAND_MARK_SCALE = 1.05;

/** Tytułówka wisi krócej niż kadr — to nie zdjęcie, nie ma się w co wpatrywać. */
const BRAND_HOLD_RATIO = 2 / 3;

/** Wejście znaku: wyłania się z rozmycia i lekko się unosi. */
const BRAND_ENTRY_DURATION = 0.9;
const BRAND_ENTRY_BLUR = "blur(8px)";
const BRAND_ENTRY_RISE = 12;

/** Smuga światła: startuje po wejściu znaku i raz przez niego przejeżdża. */
const SHEEN_DELAY = BRAND_ENTRY_DURATION + 0.3;
const SHEEN_DURATION = 1.5;
/** Skąd/dokąd jedzie smuga — z zapasem, żeby wjechała i zjechała za kadr. */
const SHEEN_TRAVEL = "115%";

/**
 * Sama smuga: wąskie ciepłe pasmo w poprzek pudełka, z jaśniejszym rdzeniem.
 * Kąt 100° (a nie 90°) daje ukos, jak refleks światła padającego z góry.
 */
const SHEEN_GRADIENT = `linear-gradient(
  100deg,
  transparent 38%,
  color-mix(in srgb, var(--color-glow) 70%, transparent) 47%,
  color-mix(in srgb, white 62%, var(--color-glow)) 50%,
  color-mix(in srgb, var(--color-glow) 70%, transparent) 53%,
  transparent 62%
)`;

/**
 * Maska w kształcie logotypu — dzięki niej smuga świeci TYLKO w obrębie znaku,
 * a nie w prostokącie wokół niego. `contain` + `center` to dokładnie to samo
 * kadrowanie, co `object-contain` na <img> pod spodem, więc maska trzyma się
 * znaku niezależnie od proporcji pudełka.
 */
const MARK_MASK = {
  maskImage: "url(/logo/logo-compact.svg)",
  WebkitMaskImage: "url(/logo/logo-compact.svg)",
  maskSize: "contain",
  WebkitMaskSize: "contain",
  maskPosition: "center",
  WebkitMaskPosition: "center",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
} as const;

/** Ile ten slajd ma być na ekranie, w ms. */
function holdOf(slide: HeroSlide, interval: number) {
  return slide.kind === "brand"
    ? Math.round(interval * BRAND_HOLD_RATIO)
    : interval;
}

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
 *
 * Ruch planszy to trzy warstwy, wszystkie ze „światła", nie z kształtu:
 * 1. znak wyłania się z rozmycia i lekko unosi (wejście),
 * 2. ciepła smuga raz przejeżdża po samych literach (maska w kształcie logotypu),
 * 3. poświata pod znakiem powoli oddycha (`BrandHalo`).
 */
function BrandMark({
  alt,
  active,
  still,
  duration,
  className,
}: {
  alt: string;
  active: boolean;
  still: boolean;
  duration: number;
  className: string;
}) {
  // zwykły <img>, nie next/image: to SVG, optymalizator nic tu nie wnosi
  const mark = (
    <img
      src="/logo/logo-compact.svg"
      alt={alt}
      width={472}
      height={339}
      className="h-full w-full object-contain"
      decoding="async"
    />
  );

  // prefers-reduced-motion (albo jeden slajd): znak stoi w docelowym stanie, bez
  // wejścia i bez smugi — inaczej zostałby rozmyty i przezroczysty na zawsze
  if (still) {
    return <div className={className}>{mark}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ scale: 1, opacity: 0, y: BRAND_ENTRY_RISE, filter: BRAND_ENTRY_BLUR }}
      animate={
        active
          ? { scale: BRAND_MARK_SCALE, opacity: 1, y: 0, filter: "blur(0px)" }
          : { scale: 1, opacity: 0, y: BRAND_ENTRY_RISE, filter: BRAND_ENTRY_BLUR }
      }
      // każda cecha ma własne tempo: zoom to powolny podjazd na całą ekspozycję,
      // wejście (rozmycie / krycie / unos) jest krótkie i domyka się na starcie
      transition={{
        scale: { duration: active ? duration : 0.8, ease: active ? "linear" : "easeOut" },
        opacity: { duration: active ? BRAND_ENTRY_DURATION : 0.5, ease: "easeOut" },
        filter: { duration: active ? BRAND_ENTRY_DURATION : 0.5, ease: "easeOut" },
        y: { duration: active ? BRAND_ENTRY_DURATION : 0.5, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {mark}
      {/* smuga w masce znaku — leży NAD logotypem, ale świeci tylko w jego literach */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={MARK_MASK}>
        <motion.div
          className="h-full w-full"
          style={{ background: SHEEN_GRADIENT }}
          initial={{ x: `-${SHEEN_TRAVEL}` }}
          animate={{ x: active ? SHEEN_TRAVEL : `-${SHEEN_TRAVEL}` }}
          transition={
            active
              ? { duration: SHEEN_DURATION, delay: SHEEN_DELAY, ease: "easeInOut" }
              : { duration: 0 } // reset poza kadrem, gdy slajd i tak zgasł
          }
        />
      </div>
    </motion.div>
  );
}

/**
 * Ciepła poświata pod znakiem — na aktywnym slajdzie powoli „oddycha" (jak światło
 * z okna na ścianie), poza nim przygasa. To ona nosi ruch tła; sam znak zostaje
 * czytelny.
 */
function BrandHalo({
  active,
  still,
  className,
}: {
  active: boolean;
  still: boolean;
  className: string;
}) {
  if (still) {
    return <div aria-hidden className={`halo ${className}`} />;
  }

  return (
    <motion.div
      aria-hidden
      className={`halo ${className}`}
      initial={{ opacity: 0.55, scale: 0.95 }}
      animate={
        active
          ? { opacity: [0.7, 1, 0.7], scale: [1, 1.06, 1] }
          : { opacity: 0.55, scale: 0.95 }
      }
      transition={
        active
          ? { duration: 7, ease: "easeInOut", repeat: Infinity }
          : { duration: 0.8, ease: "easeOut" }
      }
    />
  );
}

function BrandSlide({
  alt,
  active,
  still,
  duration,
}: {
  alt: string;
  active: boolean;
  still: boolean;
  duration: number;
}) {
  return (
    <div className="plaster absolute inset-0">
      {/* MOBILE (tekst przyklejony do dołu): znak dostaje pas nad nagłówkiem, a jego
          wysokość to wysokość hero minus miejsce bloku tekstu. Blok jest w praktyce
          stały (~380–410 px), więc odejmujemy 430 px zapasu i ograniczamy znak przez
          `max-h-full`: na iPhonie SE zostaje tu tylko ~176 px, więc logo samo maleje
          zamiast wejść w napisy; na wyższych ekranach rośnie. `pt-6` pilnuje, żeby na
          najniższych ekranach znak nie kleił się do belki menu.

          Znak dostaje teraz pełne pudełko (`h-full w-[68%]`) i skaluje się w nim przez
          `object-contain`, zamiast być wymiarowany samymi ograniczeniami na <img>.
          Rozmiar wychodzi ten sam (mniejsze z: wysokość pasa / 68% szerokości), ale
          pudełko ma definitywne wymiary — a bez nich maska smugi nie miałaby do czego
          się przyłożyć. */}
      <div className="absolute inset-x-0 top-0 flex h-[calc(100%-430px)] items-center justify-center px-6 pb-2 pt-6 md:hidden">
        <BrandHalo active={active} still={still} className="absolute inset-0" />
        <BrandMark
          alt={alt}
          active={active}
          still={still}
          duration={duration}
          className="relative h-full w-[68%]"
        />
      </div>

      {/* ≥md (tekst w pionie na środku, po lewej): znak idzie do prawej kolumny TEJ SAMEJ
          siatki co treść hero — dlatego kontener powtarza `max-w-6xl px-5`. Szerokość to
          reszta wiersza po bloku tekstu: 36rem (jego `max-w-xl`) + 1.5rem odstępu. Liczone
          z siatki, nie z procentu ekranu, bo przy 768 px rząd przycisków sięga aż do 78%
          szerokości okna i każde „prawe 14%" na niego wchodziło. */}
      <div className="mx-auto hidden h-full max-w-6xl items-center justify-end px-5 md:flex">
        <div className="relative w-[calc(100%-37.5rem)] max-w-[500px]">
          <BrandHalo active={active} still={still} className="absolute -inset-[40%]" />
          {/* wysokość z proporcji logotypu — dokładnie to, co dawał <img w-full>,
              tylko jawnie, żeby maska smugi miała pudełko o znanym kształcie */}
          <BrandMark
            alt={alt}
            active={active}
            still={still}
            duration={duration}
            className="relative aspect-[472/339] w-full"
          />
        </div>
      </div>
    </div>
  );
}

/** Rozdziela oba typy slajdów — zdjęcie albo planszę brandową. */
function Slide({
  slide,
  eager,
  active,
  still = false,
  duration,
}: {
  slide: HeroSlide;
  eager: boolean;
  active: boolean;
  /** Rotacja wyłączona (reduced motion / jeden slajd) — plansza renderuje się statycznie. */
  still?: boolean;
  duration: number;
}) {
  return slide.kind === "brand" ? (
    <BrandSlide
      alt={slide.alt}
      active={active}
      still={still}
      duration={duration}
    />
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

  // setTimeout, nie setInterval: czas ekspozycji zależy od slajdu (tytułówka wisi
  // krócej), więc odliczanie trzeba uzbrajać od nowa po każdej zmianie kadru.
  useEffect(() => {
    if (reduceMotion || slides.length < 2) return;
    const id = setTimeout(
      () => setIndex((i) => (i + 1) % slides.length),
      holdOf(slides[index], interval),
    );
    return () => clearTimeout(id);
  }, [index, reduceMotion, slides, interval]);

  if (reduceMotion || slides.length < 2) {
    const only = slides[0];
    return (
      <>
        <Slide slide={only} eager active={false} still duration={0} />
        {only.kind !== "brand" && <PhotoVeil />}
      </>
    );
  }

  // LCP-em jest pierwszy KADR, a nie plansza brandowa (ta jest czystym SVG), więc
  // zachłannie ładujemy pierwsze prawdziwe zdjęcie w kolejce.
  const firstPhoto = slides.findIndex((slide) => slide.kind !== "brand");

  return (
    <>
      {slides.map((slide, i) => {
        const active = i === index;
        // Ken Burns (na całym kadrze) tylko dla zdjęć — na planszy brandowej wypychał
        // logo pod belkę menu, więc ona rusza się inaczej: powiększa się sam znak,
        // wokół własnego środka. Patrz BRAND_MARK_SCALE.
        const zooms = slide.kind !== "brand";
        // Ruch trwa nieco dłużej niż ekspozycja + przenikanie, żeby był ciągły.
        const zoomDuration = (holdOf(slide, interval) + 1100) / 1000;
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
              <Slide
                slide={slide}
                eager={i === firstPhoto}
                active={active}
                duration={zoomDuration}
              />
            </motion.div>
            {/* poza wrapperem Ken Burnsa — welon ma stać nieruchomo, nie zoomować */}
            {slide.kind !== "brand" && <PhotoVeil />}
          </motion.div>
        );
      })}
    </>
  );
}
