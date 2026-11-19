import type { NextConfig } from "next";
import path from "path";

// Next serves photos and logos from public/ with `Cache-Control: max-age=0` by default,
// so the browser asked the server for every hero file on every visit. These file names
// carry no hash, so we do NOT give a year of `immutable` — a week plus serving the stale
// version in the background while revalidating. NOTE: when replacing a photo with another,
// change the file name, or returning visitors will see the old one for up to a week.
const STATIC_MEDIA_CACHE =
  "public, max-age=604800, stale-while-revalidate=86400";

const nextConfig: NextConfig = {
  output: "standalone",
  // Do not announce what the site runs on — consistent with the removed `strapi::poweredBy`
  // on the backend.
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
    // Media Library photos have a hash in the name given by Strapi, so the content under
    // an address never changes — the default 4 hours of browser cache were too low here.
    // 30 days cuts repeated requests and, more importantly on a single-core server, saves
    // processing with sharp.
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
