"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

export type HeroSlide =
  /** A photographic frame — a separate file for mobile and desktop (art direction). */
  | { kind?: "photo"; desktop: string; mobile: string; alt: string }
  /** The brand card — the logotype on a lit wall, instead of a photo. */
  | { kind: "brand"; alt: string };

// The target zoom of the frame in the Ken Burns effect (the active slide slowly drives here).
const KEN_BURNS_SCALE = 1.14;

/**
 * The brand card gets its own, much subtler zoom — and on the MARK ITSELF, around its
 * centre, not on the whole slide. Scaling the slide goes from the frame's centre, so it
 * pushed the logo (sitting in the band at the top) under the menu bar; a mark growing
 * around its own centre spreads symmetrically and fits in the slack the band has.
 */
const BRAND_MARK_SCALE = 1.05;

/** The title card stays up shorter than a photo — it is not a picture, nothing to gaze at. */
const BRAND_HOLD_RATIO = 2 / 3;

/** The mark's entrance: it emerges from a blur and rises slightly. */
const BRAND_ENTRY_DURATION = 0.9;
const BRAND_ENTRY_BLUR = "blur(8px)";
const BRAND_ENTRY_RISE = 12;

/** The light streak: starts after the mark's entrance and passes over it once. */
const SHEEN_DELAY = BRAND_ENTRY_DURATION + 0.3;
const SHEEN_DURATION = 1.5;
/** Where the streak travels from/to — with slack, so it enters and leaves past the frame. */
const SHEEN_TRAVEL = "115%";

/**
 * The streak itself: a narrow warm band across the box, with a brighter core.
 * An angle of 100° (not 90°) gives a slant, like a reflection of light falling from above.
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
 * A mask in the shape of the logotype — thanks to it the streak shines ONLY within the
 * mark, not in a rectangle around it. `contain` + `center` is exactly the same framing
 * as `object-contain` on the <img> underneath, so the mask stays on the mark regardless
 * of the box's proportions.
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

/**
 * When the brand card makes NO sense and the rotation has to skip it.
 *
 * In the mobile layout the mark gets the band above the text block, and the band is:
 *   (100svh − 82 px menu bar) − 430 px reserved for the text
 * At 96 px of band the mark is only ~60 px wide and stops communicating anything; below
 * zero it vanishes entirely, and the card is then an empty cream wall for its whole
 * exposure (measured on the live site: hero 426 px).
 * 82 + 430 + 96 = 608 px — below this window height the rotation opens straight with the
 * first photo.
 *
 * The condition deliberately covers the WIDTH too: above `md` the mark goes to a separate
 * column next to the text, where nothing squeezes it, so a low window on a desktop is no
 * reason to skip the card.
 *
 * ⚠️ This is not only about "small phones". The most common case is ANY phone turned
 * landscape — the window height then drops to 320–430 px and the threshold is crossed
 * on every model.
 */
const BRAND_SLIDE_HAS_NO_ROOM =
  "(max-width: 767.98px) and (max-height: 607.98px)";

/**
 * A media query as a source of React state. `useSyncExternalStore` instead of
 * `useEffect` + `useState`, because it manages the subscription itself and gives an
 * explicit server snapshot — without it we would have to render twice and catch the
 * hydration mismatch warning.
 *
 * The server snapshot is `false` ("there is room"): the server does not know the window
 * size, and under that assumption the server HTML contains the full set of slides, and on
 * a tall screen — i.e. most visits — nothing changes after hydration.
 */
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** How long this slide stays on screen, in ms. */
function holdOf(slide: HeroSlide, interval: number) {
  return slide.kind === "brand"
    ? Math.round(interval * BRAND_HOLD_RATIO)
    : interval;
}

/** The path to the variant next to the JPEG: /images/hero.jpg → /images/hero.avif */
const variant = (jpeg: string, ext: "avif" | "webp") =>
  jpeg.replace(/\.jpe?g$/i, `.${ext}`);

/**
 * A photo with art direction: mobile gets a portrait crop, desktop a landscape one —
 * through <picture> with media, so ONLY the matching file loads.
 *
 * Each crop exists in three formats (AVIF / WebP / JPEG, generated by a script — see the
 * frontend README). The browser takes the first `<source>` that matches and that it can
 * decode, so the order matters here: from the lightest format to the most compatible.
 * The JPEGs alone weighed ~240 KB per crop; AVIF goes down to ~40 KB at the same
 * sharpness of skin and texture.
 *
 * Deliberately a plain <picture>, not next/image: art direction needs TWO different files
 * for the same slide, and next/image hidden by CSS would download both crops.
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
      {/* desktop (≥768px) — landscape crop */}
      <source
        media="(min-width: 768px)"
        type="image/avif"
        srcSet={variant(slide.desktop, "avif")}
      />
      <source
        media="(min-width: 768px)"
        type="image/webp"
        srcSet={variant(slide.desktop, "webp")}
      />
      <source media="(min-width: 768px)" srcSet={slide.desktop} />
      {/* mobile — portrait crop (JPEG as the default <img> = the last resort) */}
      <source type="image/avif" srcSet={variant(slide.mobile, "avif")} />
      <source type="image/webp" srcSet={variant(slide.mobile, "webp")} />
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
 * The cream veil that keeps the heading readable ON THE PHOTOS:
 * • mobile — vertical, from the bottom (sharper top),
 * • desktop — horizontal, from the left; it reaches ~half the text, the right side of
 *   the frame keeps its original colours.
 * It sits in the slide (not over the whole carousel), because the brand card does not
 * want it: its background is cream anyway, so the text reads without it, and the veil
 * would only wash out the logo and push it to the edge.
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
 * The card opening the rotation: the logotype on a lit wall (`.plaster`) with a warm glow
 * under the mark. It is not a photo, so instead of `object-cover` it gets its own layout.
 * The `logo-compact` version (no tagline), because the kicker already repeats the tagline.
 *
 * The mark gets only the part of the frame the text block does not occupy, and scales TO
 * IT — it is never sized as a percentage of the screen, because the text block has a
 * width and height in pixels, and with such a calculation it runs into the text.
 *
 * The card's motion is three layers, all made of "light", not of shape:
 * 1. the mark emerges from a blur and rises slightly (entrance),
 * 2. a warm streak passes once over the letters alone (a mask in the logotype's shape),
 * 3. the glow under the mark slowly breathes (`BrandHalo`).
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
  // a plain <img>, not next/image: it is an SVG, the optimizer adds nothing here
  const mark = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo/logo-compact.svg"
      alt={alt}
      width={472}
      height={339}
      className="h-full w-full object-contain"
      decoding="async"
    />
  );

  // prefers-reduced-motion (or a single slide): the mark stands in its final state, with
  // no entrance and no streak — otherwise it would stay blurred and transparent forever
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
      // each property has its own pace: the zoom is a slow drive over the whole exposure,
      // the entrance (blur / opacity / rise) is short and settles at the start
      transition={{
        scale: { duration: active ? duration : 0.8, ease: active ? "linear" : "easeOut" },
        opacity: { duration: active ? BRAND_ENTRY_DURATION : 0.5, ease: "easeOut" },
        filter: { duration: active ? BRAND_ENTRY_DURATION : 0.5, ease: "easeOut" },
        y: { duration: active ? BRAND_ENTRY_DURATION : 0.5, ease: [0.22, 1, 0.36, 1] },
      }}
    >
      {mark}
      {/* the streak inside the mark's mask — it lies ABOVE the logotype, but shines only in its letters */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={MARK_MASK}>
        <motion.div
          className="h-full w-full"
          style={{ background: SHEEN_GRADIENT }}
          initial={{ x: `-${SHEEN_TRAVEL}` }}
          animate={{ x: active ? SHEEN_TRAVEL : `-${SHEEN_TRAVEL}` }}
          transition={
            active
              ? { duration: SHEEN_DURATION, delay: SHEEN_DELAY, ease: "easeInOut" }
              : { duration: 0 } // reset off-frame, when the slide has faded anyway
          }
        />
      </div>
    </motion.div>
  );
}

/**
 * The warm glow under the mark — on the active slide it slowly "breathes" (like window
 * light on a wall), off it, it dims. It carries the background's motion; the mark itself
 * stays readable.
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
      {/* MOBILE (text pinned to the bottom): the mark gets the band above the heading, and
          its height is the hero height minus 430 px reserved for the text block.
          `pt-6` keeps the mark from sticking to the menu bar on the lowest screens.

          ⚠️ MEASURED ON THE LIVE SITE (375×667): with the browser bar visible the hero is
          only ~426 px, so 426 − 430 comes out below zero and the band gets a height of 0.
          Contrary to what the previous comment said ("~176 px remain").

          Deliberately NO floor like `max(84px, …)` here. On such a screen the text block
          starts 64 px from the top of the hero, so any band taller than that puts the mark
          onto the "Odzyskaj swobodę" heading — and a logo ON the text is worse than a
          logo that is not there. Collapsing to zero is the CORRECT behaviour here.

          The problem was something else: an empty band left the brand card with nothing
          to show. `BRAND_SLIDE_HAS_NO_ROOM` solves that — below the height threshold the
          card does not enter the rotation at all, so this band never renders empty. This
          rule handles the range where the band EXISTS but can be tight; the threshold and
          this calculation must stay in agreement.

          The mark now gets a full box (`h-full w-[68%]`) and scales inside it through
          `object-contain`, instead of being sized by constraints on the <img> alone. The
          size comes out the same (the smaller of: band height / 68% of the width), but
          the box has definite dimensions — and without them the streak's mask would have
          nothing to attach to. */}
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

      {/* ≥md (text centred vertically, on the left): the mark goes to the right column of
          THE SAME grid as the hero content — hence the container repeats `max-w-6xl px-5`.
          The width is what the row has left after the text block: 36rem (its `max-w-xl`) +
          1.5rem gap. Computed from the grid, not from a screen percentage, because at
          768 px the button row reaches as far as 78% of the window width and any "right
          14%" ran into it. */}
      <div className="mx-auto hidden h-full max-w-6xl items-center justify-end px-5 md:flex">
        <div className="relative w-[calc(100%-37.5rem)] max-w-[500px]">
          <BrandHalo active={active} still={still} className="absolute -inset-[40%]" />
          {/* the height from the logotype's proportions — exactly what <img w-full> gave,
              only explicit, so the streak's mask has a box of known shape */}
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

/** Dispatches between the two slide types — a photo or the brand card. */
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
  /** Rotation off (reduced motion / a single slide) — the card renders statically. */
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
 * Rotating photos in the hero — a crossfade between frames + the Ken Burns effect (a slow
 * zoom on the active frame). Respects prefers-reduced-motion (like Reveal): with reduced
 * motion it shows the first frame statically, without rotation and without zoom.
 */
export default function HeroCarousel({
  slides,
  interval = 5000,
}: {
  slides: HeroSlide[];
  interval?: number;
}) {
  const reduceMotion = useReducedMotion();

  // On a low screen in the mobile layout the brand card has nowhere to show the mark
  // (see BRAND_SLIDE_HAS_NO_ROOM) — it drops out of the rotation instead of hanging as an
  // empty wall. The filtered list is memoised, because it is a dependency of the countdown
  // effect: a new array on every render would reset the timer.
  const brandHasNoRoom = useMediaQuery(BRAND_SLIDE_HAS_NO_ROOM);
  const visibleSlides = useMemo(
    () => (brandHasNoRoom ? slides.filter((s) => s.kind !== "brand") : slides),
    [slides, brandHasNoRoom],
  );

  /**
   * The active frame and "how far we have mounted" in one state — because it is one
   * decision, made in one place (when the slide advances).
   *
   * Why `mountedThrough`: all slides in the tree at once meant that on the first visit the
   * browser fetched the WHOLE set of frames. `loading="lazy"` does nothing here — the
   * slides are in the viewport (transparent, but not hidden), and only what is off-screen
   * is deferred. So we keep one slide of lead ahead (it has time to load before the
   * crossfade) and never unmount, so that frames do not vanish and come back after the
   * rotation loops.
   */
  const [{ index, mountedThrough }, setRotation] = useState({
    index: 0,
    mountedThrough: 1,
  });

  // Turning the phone to landscape shortens the list mid-rotation, so the remembered index
  // can point past its end. Without this `visibleSlides[index]` can be `undefined` and
  // `holdOf` crashes reading `.kind`.
  const safeIndex = index < visibleSlides.length ? index : 0;

  // setTimeout, not setInterval: the exposure time depends on the slide (the title card
  // stays up shorter), so the countdown has to be re-armed after every frame change.
  useEffect(() => {
    if (reduceMotion || visibleSlides.length < 2) return;
    const id = setTimeout(() => {
      const next = (safeIndex + 1) % visibleSlides.length;
      setRotation((current) => ({
        index: next,
        mountedThrough: Math.max(current.mountedThrough, next + 1),
      }));
    }, holdOf(visibleSlides[safeIndex], interval));
    return () => clearTimeout(id);
  }, [safeIndex, reduceMotion, visibleSlides, interval]);

  if (reduceMotion || visibleSlides.length < 2) {
    const only = visibleSlides[0];
    return (
      <>
        <Slide slide={only} eager active={false} still duration={0} />
        {only.kind !== "brand" && <PhotoVeil />}
      </>
    );
  }

  // The LCP is the first PHOTO, not the brand card (that one is pure SVG), so the first
  // real photo in the queue is loaded eagerly.
  const firstPhoto = visibleSlides.findIndex((slide) => slide.kind !== "brand");

  return (
    <>
      {visibleSlides.map((slide, i) => {
        if (i > mountedThrough) return null;
        const active = i === safeIndex;
        // Ken Burns (on the whole frame) only for photos — on the brand card it pushed the
        // logo under the menu bar, so that one moves differently: the mark itself grows,
        // around its own centre. See BRAND_MARK_SCALE.
        const zooms = slide.kind !== "brand";
        // The motion lasts slightly longer than exposure + crossfade, so it is continuous.
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
            {/* outside the Ken Burns wrapper — the veil must stand still, not zoom */}
            {slide.kind !== "brand" && <PhotoVeil />}
          </motion.div>
        );
      })}
    </>
  );
}
