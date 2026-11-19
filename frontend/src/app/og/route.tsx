import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { CONTACT } from "@/lib/contact";
import { OG_IMAGE_SIZE } from "@/lib/seo";

// The card image shown when a link is shared (Facebook, Messenger, WhatsApp, X) — one
// for the whole site, address and phone taken from lib/contact. No custom font: the
// brand typography lives in the logo (curves), and the two lines of caption use the
// generator's default face.
//
// Deliberately a plain `/og` route, not the `opengraph-image.tsx` file convention: with
// that one, on subpages with their own `openGraph` (and we have those — each has its own
// card title and description), Next lost the og:image tags in the finished HTML of some
// pages. A plain URL given explicitly through `ogImage()` is predictable.
// force-static = the image is made once, at build time.
export const dynamic = "force-static";

export async function GET() {
  const logo = await readFile(
    join(process.cwd(), "public/logo/logo-black.svg"),
  );
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          // Cream (--color-paper) with a warm glow in the top right corner —
          // the same gesture of light as on the site.
          backgroundColor: "#f5f0e8",
          backgroundImage:
            "radial-gradient(circle at 78% 18%, rgba(233,199,149,0.55), rgba(245,240,232,0) 55%)",
        }}
      >
        {/* next/image does not work here — the generator (satori) understands only <img>. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={353} height={300} alt="" />
        {/* The logo already carries "fizjoterapia / masaż / trening", so the caption adds
            what it lacks: the clinic's profile, address and phone. */}
        <div style={{ marginTop: 40, fontSize: 32, color: "#5c5246" }}>
          Rehabilitacja ortopedyczna i sportowa
        </div>
        <div style={{ marginTop: 18, fontSize: 26, color: "#94897a" }}>
          {`Libiąż, ${CONTACT.addressStreet} · ${CONTACT.phoneDisplay}`}
        </div>
      </div>
    ),
    OG_IMAGE_SIZE,
  );
}
