import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { CONTACT } from "@/lib/contact";
import { OG_IMAGE_SIZE } from "@/lib/seo";

// Obrazek karty pokazywany przy udostępnianiu linku (Facebook, Messenger,
// WhatsApp, X) — jeden dla całego serwisu, adres i telefon brane z lib/contact.
// Bez własnego fontu: typografia marki siedzi w logu (krzywe), a dwie linijki
// podpisu jadą domyślnym krojem generatora.
//
// Celowo zwykła trasa `/og`, a nie konwencja pliku `opengraph-image.tsx`:
// przy tamtej, na podstronach z własnym `openGraph` (a takie mamy — każda ma
// swój tytuł i opis karty), Next gubił znaczniki og:image w gotowym HTML-u
// części stron. Zwykły URL podawany jawnie przez `ogImage()` jest przewidywalny.
// force-static = obrazek powstaje raz, przy buildzie.
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
          // Krem (--color-paper) z ciepłą poświatą w prawym górnym rogu —
          // ten sam gest światła, co na stronie.
          backgroundColor: "#f5f0e8",
          backgroundImage:
            "radial-gradient(circle at 78% 18%, rgba(233,199,149,0.55), rgba(245,240,232,0) 55%)",
        }}
      >
        {/* next/image tu nie działa — generator (satori) rozumie tylko <img>. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={353} height={300} alt="" />
        {/* Logo niesie już „fizjoterapia / masaż / trening", więc podpis dokłada
            to, czego w nim nie ma: profil gabinetu, adres i telefon. */}
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
