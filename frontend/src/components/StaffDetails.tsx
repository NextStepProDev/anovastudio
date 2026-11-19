"use client";

import { useEffect, useRef, useState } from "react";
import { parseCourses } from "@/lib/strapi";

interface StaffDetailsProps {
  bio?: string | null;
  courses?: string | null;
  className?: string;
}

/**
 * Bio teaser + hidden course list behind a single toggle, so the team grid
 * stays scannable no matter how long an individual bio is. The toggle renders
 * only when there is something to reveal (overflowing bio or any course).
 */
export default function StaffDetails({
  bio,
  courses,
  className,
}: StaffDetailsProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const courseList = parseCourses(courses);

  // We measure ONLY in the collapsed state. An expanded paragraph is by definition not
  // clamped, so measuring after expanding returned `false` and — for a person with no
  // courses entered — took away the button's only reason to exist: "Zwiń" vanished and
  // the card stayed expanded for good. Skipping the measurement keeps the last result from
  // the collapsed measurement, i.e. exactly the information we need.
  useEffect(() => {
    const el = paragraphRef.current;
    if (!el || expanded) return;
    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded]);

  const hasMore = overflowing || courseList.length > 0;

  const toggle = () => {
    setExpanded((value) => {
      // Collapsing a long card would leave the viewport somewhere below the
      // card; pull its top back into view when it has scrolled past.
      if (value) {
        const top = rootRef.current?.getBoundingClientRect().top ?? 0;
        if (top < 0) {
          rootRef.current?.scrollIntoView({ block: "center" });
        }
      }
      return !value;
    });
  };

  return (
    <div ref={rootRef} className={className}>
      {/* pointer-events-none while clamped: Safari hit-tests the text that
          line-clamp hides, so the phantom lines would swallow button clicks. */}
      {bio && (
        <p
          ref={paragraphRef}
          className={`whitespace-pre-line text-sm leading-6 text-ink-soft ${expanded ? "" : "pointer-events-none line-clamp-3"}`}
        >
          {bio}
        </p>
      )}

      {expanded && courseList.length > 0 && (
        <div className="mt-4">
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Kursy i szkolenia
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-ink-soft">
            {/* key with the index: the list can be long (dozens of items) and is typed by
                hand in the CMS, so a repeated line is real; the order is stable, because
                it is plain text split into lines */}
            {courseList.map((course, index) => (
              <li
                key={`${index}-${course}`}
                className="relative pl-4 before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-accent"
              >
                {course}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasMore && (
        // Safari quirks around line-clamp relayout, all needed for the hit
        // area to match the label: z-10 beats the phantom clamped text in
        // hit-testing, translateZ keeps the button on its own compositing
        // layer, and hover uses color (not opacity) so no layer churn.
        <div className="mt-2">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={toggle}
            className="relative z-10 inline-block transform-[translateZ(0)] cursor-pointer py-1 font-display text-sm font-medium text-accent transition-colors hover:text-accent/70"
          >
            {expanded ? "Zwiń" : "Czytaj więcej"}
          </button>
        </div>
      )}
    </div>
  );
}
