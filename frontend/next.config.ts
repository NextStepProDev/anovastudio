import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Dev only: lets the dev server be reached through an ngrok tunnel
  // (Next blocks cross-origin requests to dev assets by default).
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.app", "*.ngrok.dev"],
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
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
