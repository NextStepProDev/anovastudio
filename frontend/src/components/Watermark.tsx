import type { CSSProperties } from "react";

/**
 * Dekoracyjny znak wodny — sam mark ANOVA (trójkąt „A" z sylwetką) WYTŁOCZONY
 * w powierzchni sekcji. Wrażenie 3D daje wyłącznie światłocień: jasny rant od
 * góry-lewej + ciepły cień od dołu-prawej. Jak tłoczenie w papierze / wytłoczenie
 * w tynku — spójne z hero Oferty. „Wypukłe" (raised), OSTRE krawędzie.
 *
 * Kształt wypełniany jest kolorem powierzchni (przez `currentColor`), aby zlał się
 * z tłem — ostra krawędź kształtu na wierzchu daje wyrazistość, a rozmyty rant
 * dokoła buduje relief. Ustaw `surface` na kolor pasa sekcji: "paper" (#f5f0e8,
 * domyślnie) lub "paperWarm" (#e8dfd2).
 *
 * Efekt realizuje filtr SVG z offsetami w jednostkach viewBox, więc rant skaluje się
 * proporcjonalnie do wielkości znaku (jednakowy charakter na każdej stronie).
 *
 * Czysta ozdoba: aria-hidden, pointer-events-none, `-z-10`, sam się przycina
 * (własny overflow-hidden) — sekcja-rodzic potrzebuje tylko `relative isolate`.
 * Pozycję i wysokość podaje się przez `className`, np.
 * `right-[-14%] top-1/2 h-[150%] -translate-y-1/2`.
 */
export default function Watermark({
  className = "",
  surface = "paper",
  id = "anova-emboss",
  style,
}: {
  className?: string;
  surface?: "paper" | "paperWarm";
  /** unikalny id filtra — nadpisz tylko gdy dwa znaki lądują w jednym dokumencie */
  id?: string;
  style?: CSSProperties;
}) {
  const surfaceClass = surface === "paperWarm" ? "text-[#e8dfd2]" : "text-paper";

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden"
    >
      <span
        className={`absolute aspect-[186/203] ${surfaceClass} ${className}`}
        style={style}
      >
        {/* viewBox = bbox marku + ~8j paddingu z każdej strony (żeby cień/rant nie
            były przycięte przez krawędź viewportu SVG). */}
        <svg
          viewBox="184.89 53.13 186.14 203.27"
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
        >
          <defs>
            <filter
              id={id}
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceAlpha" stdDeviation="2.8" result="b" />
              {/* jasny rant od góry-lewej */}
              <feOffset in="b" dx="-2.6" dy="-2.6" result="hl" />
              {/* cień od dołu-prawej */}
              <feOffset in="b" dx="2.6" dy="2.6" result="sh" />
              <feFlood floodColor="#ffffff" floodOpacity="0.6" />
              <feComposite in2="hl" operator="in" result="hlc" />
              <feFlood floodColor="#3a2f22" floodOpacity="0.32" />
              <feComposite in2="sh" operator="in" result="shc" />
              {/* SourceGraphic (ostry kształt w kolorze tła) na wierzchu = wyrazistość */}
              <feMerge>
                <feMergeNode in="shc" />
                <feMergeNode in="hlc" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g fill="currentColor" filter={`url(#${id})`}>
            <path d="M211.39,229.3c8.78-21.12,17.56-42.23,26.34-63.35h-3.22c-8.63,20.85-17.25,41.69-25.88,62.54-.16.35-.42.91-.78,1.59-1.44,2.72-3.17,5.96-6.44,7.45-.74.34-2,.79-3.78.82-1.57.03-3.13.07-4.7.1v1.26c4.88-.08,9.84-.12,14.86-.11,3.94,0,7.84.04,11.69.11,0-.42.02-.84.03-1.26-1.99-.08-3.98-.17-5.97-.25-2.01-.15-2.59-1.28-2.81-1.59-1.2-1.68-.48-4.08-.04-5.56.23-.77.5-1.37.69-1.76Z" />
            <path d="M319.37,159.74l-39.52-98.57h-1.97s-25.96,62.72-38.94,94.08c1.11-.08,2.22-.16,3.34-.24,10.63-25.58,21.27-51.16,31.9-76.74,2.92,7.1,18.55,45.76,33.37,82.53,1.89-.07,4.13.08,6.65-.2,1.83-.2,3.62-.5,5.17-.85Z" />
            <path d="M357.51,237.98c-.79-.13-1.63-.35-2.49-.7-3.46-1.41-6.53-5.8-7.65-8.11-1.52-3.14-10.27-25.03-24.06-59.55-1.5.61-2.94,1.37-4.98,1.96-1.7.5-3.93.82-5.94,1.26,12.45,30.9,23.19,57.67,23.65,59.09.49,1.51.13,2.83.13,2.83-.09.34-.41,1.38-1.36,2.14-.74.59-1.52.71-2,.82-1.51.33-3.65.72-6.38.92v1.26l36.55-.03v-1.26c-1.82-.21-3.64-.42-5.47-.63Z" />
            <path d="M342.5,152.5c-8.65,9.74-21.21,16.16-34.22,17.65-6.08.85-12.71.52-18.44,1.88-4.01.96-7.06,3.22-9.45,6.48-11.94,16.31,9.01,27.56,14.54,42.07,4.29,9.58,1.66,20.63-5.46,28,9.34-17.91,1.64-27.07-10.57-40.15-9.59-10.27-13.6-22.14-4.53-34.42,5.92-8.19,14.67-9.99,24.03-9.72,17.04.66,29.73-2.18,44.09-11.8h0Z" />
            <path d="M214.58,168.34c5.75-3.86,10.91-6,14.45-7.23,15.07-5.2,28.49-3.23,36.59-1.95,6.35,1.01,11.44,2.49,14.8,3.6-1.15.27-3.08.9-4.95,2.45-1.02.84-1.74,1.73-2.24,2.45-6.99-2.7-19.6-6.48-35.37-5.09-9.75.86-17.68,3.42-23.28,5.77Z" />
            <circle cx="274.13" cy="143.93" r="9.52" />
          </g>
        </svg>
      </span>
    </div>
  );
}
