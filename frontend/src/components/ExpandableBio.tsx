"use client";

import { useEffect, useRef, useState } from "react";

interface ExpandableBioProps {
  text: string;
  className?: string;
}

/**
 * Bio clamped to a few lines so team cards stay even in the grid.
 * The "Czytaj więcej" toggle renders only when the text actually overflows,
 * so short bios get no extra UI.
 */
export default function ExpandableBio({ text, className }: ExpandableBioProps) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = paragraphRef.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={className}>
      {/* pointer-events-none while clamped: Safari hit-tests the text that
          line-clamp hides, so the phantom lines would swallow button clicks. */}
      <p
        ref={paragraphRef}
        className={`whitespace-pre-line text-sm leading-6 text-ink-soft ${expanded ? "" : "pointer-events-none line-clamp-5"}`}
      >
        {text}
      </p>
      {(overflowing || expanded) && (
        // Safari quirks around line-clamp relayout, all needed for the hit
        // area to match the label: z-10 beats the phantom clamped text in
        // hit-testing, translateZ keeps the button on its own compositing
        // layer, and hover uses color (not opacity) so no layer churn.
        <div className="mt-2">
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
            className="relative z-10 inline-block transform-[translateZ(0)] cursor-pointer py-1 font-display text-sm font-medium text-accent transition-colors hover:text-accent/70"
          >
            {expanded ? "Zwiń" : "Czytaj więcej"}
          </button>
        </div>
      )}
    </div>
  );
}
