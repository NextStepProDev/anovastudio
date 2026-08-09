import type { NextConfig } from "next";
import path from "path";

// Zdjęcia i logotypy z public/ Next domyślnie oddaje z `Cache-Control: max-age=0`,
// więc przeglądarka przy każdym wejściu pytała serwer o każdy plik hero. Nazwy tych
// plików nie mają w sobie hasha, więc NIE dajemy `immutable` na rok — tydzień plus
// serwowanie starej wersji w tle na czas odświeżenia. UWAGA: przy podmianie zdjęcia
// na inne warto zmienić nazwę pliku, inaczej stali goście zobaczą stare do tygodnia.
const STATIC_MEDIA_CACHE =
  "public, max-age=604800, stale-while-revalidate=86400";

const nextConfig: NextConfig = {
  output: "standalone",
  // Nie ogłaszaj, na czym stoi serwis — spójnie z usuniętym `strapi::poweredBy`
  // po stronie backendu.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: STATIC_MEDIA_CACHE }],
      },
      {
        source: "/logo/:path*",
        headers: [{ key: "Cache-Control", value: STATIC_MEDIA_CACHE }],
      },
    ];
  },
  // Dev only: lets the dev server be reached through an ngrok tunnel
  // (Next blocks cross-origin requests to dev assets by default).
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.app", "*.ngrok.dev"],
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    // Zdjęcia z Media Library mają w nazwie hash nadany przez Strapi, więc dana
    // treść pod danym adresem nigdy się nie zmienia — domyślne 4 godziny cache
    // w przeglądarce były tu zaniżone. 30 dni ucina powtarzane zapytania i, co
    // ważniejsze na serwerze z jednym rdzeniem, oszczędza przetwarzanie sharpem.
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // The optimizer blocks private-IP upstreams by default (SSRF protection).
    // Dev: Strapi on localhost. Docker: Strapi is only reachable inside the
    // private compose network, so the flag is safe there too (remotePatterns
    // still restricts upstreams to the two hosts below). NEXT_IMAGE_ALLOW_INTERNAL
    // is baked at build time by the frontend Dockerfile.
    dangerouslyAllowLocalIP:
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_IMAGE_ALLOW_INTERNAL === "1",
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      // Production: Strapi under its docker compose service name
      {
        protocol: "http",
        hostname: "strapi",
        port: "1337",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
