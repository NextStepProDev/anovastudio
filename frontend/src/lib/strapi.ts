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
  order: number;
  photo: StrapiImage | null;
}

interface StrapiListResponse<T> {
  data: T[];
}

/** Prefix a Strapi-relative upload path (e.g. /uploads/x.jpg) with the backend URL. */
export function strapiMediaUrl(path: string): string {
  return `${STRAPI_URL}${path}`;
}

export async function getStaff(): Promise<StaffMember[]> {
  const res = await fetch(
    `${STRAPI_URL}/api/staffs?populate=photo&sort=order:asc`,
    { next: { revalidate: 60 } },
  );
  if (!res.ok) {
    throw new Error(`Strapi request failed: ${res.status}`);
  }
  const json: StrapiListResponse<StaffMember> = await res.json();
  return json.data;
}
