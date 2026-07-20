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

export type ServiceLocation = "libiaz" | "katowice";

export interface Service {
  id: number;
  documentId: string;
  name: string;
  description: string | null;
  price: string;
  order: number;
  /** Brak wartości (starsze rekordy) traktujemy jak "libiaz". */
  location: ServiceLocation | null;
}

interface Gallery {
  id: number;
  documentId: string;
  photos: StrapiImage[] | null;
}

interface StrapiListResponse<T> {
  data: T[];
}

interface StrapiSingleResponse<T> {
  data: T | null;
}

/** Prefix a Strapi-relative upload path (e.g. /uploads/x.jpg) with the backend URL. */
export function strapiMediaUrl(path: string): string {
  return `${STRAPI_URL}${path}`;
}

/**
 * Fetch a Strapi collection; returns [] when the backend is unreachable
 * (e.g. during CI builds) so pages render their empty states instead of failing.
 */
async function fetchCollection<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${STRAPI_URL}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`Strapi request failed: ${res.status}`);
    }
    const json: StrapiListResponse<T> = await res.json();
    return json.data;
  } catch (error) {
    console.warn(`Strapi unreachable (${path}), rendering empty:`, error);
    return [];
  }
}

/**
 * Fetch a Strapi single type; returns null when the backend is unreachable
 * or the entry hasn't been created/published yet.
 */
async function fetchSingle<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${STRAPI_URL}${path}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`Strapi request failed: ${res.status}`);
    }
    const json: StrapiSingleResponse<T> = await res.json();
    return json.data;
  } catch (error) {
    console.warn(`Strapi unreachable (${path}), rendering empty:`, error);
    return null;
  }
}

export async function getGalleryPhotos(): Promise<StrapiImage[]> {
  const gallery = await fetchSingle<Gallery>("/api/gallery?populate=photos");
  return gallery?.photos ?? [];
}

export function getStaff(): Promise<StaffMember[]> {
  return fetchCollection<StaffMember>("/api/staffs?populate=photo&sort=order:asc");
}

export function getServices(): Promise<Service[]> {
  return fetchCollection<Service>("/api/services?sort=order:asc");
}
