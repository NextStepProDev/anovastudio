import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contact";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/oferta`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/zespol`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/galeria`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/wspolpraca`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/kontakt`, changeFrequency: "yearly", priority: 0.8 },
  ];
}
