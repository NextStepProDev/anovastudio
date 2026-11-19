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
  /** Courses and trainings — one per line; rendered as a list under the bio. */
  courses: string | null;
  order: number;
  photo: StrapiImage | null;
}

interface Gallery {
  id: number;
  documentId: string;
  photos: StrapiImage[] | null;
}

/** Strapi always wraps the response in `data` — a collection is an array, a single type an object or null. */
interface StrapiResponse<T> {
  data: T;
}

/**
 * The `courses` field is plain text from the CMS, one item per line. Splitting it into a
 * list lives here, not in the component, because it is shaping data from Strapi — and
 * because that way it can be tested without a browser. Empty lines and spaces from
 * copying out of Word go to the bin.
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
      // 404 is a normal situation: a single type without a published entry. The rest —
      // especially 5xx — means a FAILURE, not missing content, and although the handling is
      // the same (an empty page instead of a failed build), the log must keep a trace of a
      // different weight. Otherwise a dead Strapi looks in the logs exactly like an empty
      // CMS and nobody notices.
      const level = res.status >= 500 ? console.error : console.warn;
      level(`Strapi ${res.status} (${path}), rendering empty`);
      return fallback;
    }
    const json: StrapiResponse<T> = await res.json();
    return json.data;
  } catch (error) {
    // Deliberately `warn`, not `error`: no connection is an EXPECTED scenario — the CI
    // build runs without Strapi and must pass cleanly.
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
  // pageSize explicitly: without it `defaultLimit: 25` from backend/config/api.ts applies,
  // and past 25 people the list would be cut without a trace in the logs.
  return fetchStrapi<StaffMember[]>(
    "/api/staffs?populate=photo&sort=order:asc&pagination[pageSize]=100",
    [],
  );
}
