"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export type HeroSlide = { desktop: string; mobile: string; alt: string };

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
  slide: HeroSlide;
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
    return <SlideImage slide={slides[0]} eager />;
  }

  // Zoom trwa nieco dłużej niż czas ekspozycji + przenikanie, żeby ruch był ciągły.
  const zoomDuration = (interval + 1100) / 1000;

  return (
    <>
      {slides.map((slide, i) => {
        const active = i === index;
        return (
          <motion.div
            key={slide.desktop}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
            aria-hidden={!active}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1 }}
              animate={{ scale: active ? KEN_BURNS_SCALE : 1 }}
              transition={{
                duration: active ? zoomDuration : 0.8,
                ease: active ? "linear" : "easeOut",
              }}
            >
              <SlideImage slide={slide} eager={i === 0} />
            </motion.div>
          </motion.div>
        );
      })}
    </>
  );
}
