const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

interface StrapiImageFormat {
  url: string;
  width: number;
  height: number;
}

export interface StrapiImage {
  url: string;
  width: number;
  height: number;
  alternativeText: string | null;
  formats: Partial<
    Record<"thumbnail" | "small" | "medium" | "large", StrapiImageFormat>
  > | null;
}

export interface StaffMember {
  id: number;
  documentId: string;
  fullName: string;
  position: string;
  bio: string | null;
  /** Kursy i szkolenia — jeden na linię; renderowane jako lista pod bio. */
  courses: string | null;
  order: number;
  photo: StrapiImage | null;
}

interface Gallery {
  id: number;
  documentId: string;
  photos: StrapiImage[] | null;
}

/** Strapi zawsze pakuje odpowiedź w `data` — kolekcja to tablica, single type obiekt lub null. */
interface StrapiResponse<T> {
  data: T;
}

/**
 * Pole `courses` to zwykły tekst z CMS-a, jedna pozycja na linię. Rozbicie na listę
 * mieszka tutaj, a nie w komponencie, bo to kształtowanie danych ze Strapi — i bo
 * tak da się je przetestować bez przeglądarki. Puste linie i spacje z kopiowania
 * z Worda lecą do kosza.
 */
export function parseCourses(courses: string | null | undefined): string[] {
  return (courses ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Prefix a Strapi-relative upload path (e.g. /uploads/x.jpg) with the backend URL. */
export function strapiMediaUrl(path: string): string {
  return `${STRAPI_URL}${path}`;
}

/**
 * Fetch from Strapi; falls back to `fallback` when the backend is unreachable
 * (e.g. during CI builds) or the entry hasn't been created/published yet, so
 * pages render their empty states instead of failing the build.
 */
async function fetchStrapi<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${STRAPI_URL}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      // 404 to normalna sytuacja: single type bez opublikowanego wpisu. Reszta —
      // zwłaszcza 5xx — oznacza AWARIĘ, a nie brak treści, i choć obsługa jest
      // ta sama (pusta strona zamiast wywalonego builda), w logu musi zostać
      // ślad o innej wadze. Inaczej padnięty Strapi wygląda w logach dokładnie
      // tak samo jak pusty CMS i nikt się nie zorientuje.
      const level = res.status >= 500 ? console.error : console.warn;
      level(`Strapi ${res.status} (${path}), rendering empty`);
      return fallback;
    }
    const json: StrapiResponse<T> = await res.json();
    return json.data;
  } catch (error) {
    // Celowo `warn`, nie `error`: brak połączenia to scenariusz PRZEWIDZIANY —
    // build w CI leci bez uruchomionego Strapi i musi przejść na czysto.
    console.warn(`Strapi unreachable (${path}), rendering empty:`, error);
    return fallback;
  }
}

export async function getGalleryPhotos(): Promise<StrapiImage[]> {
  const gallery = await fetchStrapi<Gallery | null>(
    "/api/gallery?populate=photos",
    null,
  );
  return gallery?.photos ?? [];
}

export function getStaff(): Promise<StaffMember[]> {
  // pageSize jawnie: bez niego obowiązuje `defaultLimit: 25` z backend/config/api.ts
  // i po przekroczeniu 25 osób lista ucięłaby się bez śladu w logach.
  return fetchStrapi<StaffMember[]>(
    "/api/staffs?populate=photo&sort=order:asc&pagination[pageSize]=100",
    [],
  );
}
