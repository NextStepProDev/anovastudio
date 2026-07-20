import Image from "next/image";
import { BRAND, CONTACT } from "@/lib/contact";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-paper-warm text-ink">
      <div
        aria-hidden
        className="h-px bg-gradient-to-r from-transparent via-ink/25 to-transparent"
      />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-5 py-9 md:flex-row md:items-start md:justify-between">
        <div>
          <Image
            src="/logo/logo-black.png"
            alt={BRAND}
            width={170}
            height={62}
          />
          <p className="mt-4 max-w-xs text-sm leading-6 text-ink-soft">
            Gabinet fizjoterapii ortopedycznej i sportowej. Dbamy o zdrowie
            każdego pacjenta.
          </p>
        </div>

        <div className="text-sm leading-7">
          <h3 className="font-display font-semibold tracking-wide">Kontakt</h3>
          <p className="mt-3 text-ink-soft">
            {CONTACT.addressStreet}, {CONTACT.addressCity}
            <br />
            <a href={CONTACT.phoneHref} className="hover:text-accent">
              {CONTACT.phoneDisplay}
            </a>
            <br />
            <a href={`mailto:${CONTACT.email}`} className="hover:text-accent">
              {CONTACT.email}
            </a>
          </p>
          {(CONTACT.facebook || CONTACT.instagram) && (
            <ul className="mt-3 flex gap-4 text-ink-soft">
              {CONTACT.facebook && (
                <li>
                  <a
                    href={CONTACT.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent"
                  >
                    Facebook
                  </a>
                </li>
              )}
              {CONTACT.instagram && (
                <li>
                  <a
                    href={CONTACT.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent"
                  >
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="relative border-t border-line">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-ink-muted">
          © {new Date().getFullYear()} {BRAND}. Wszelkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  );
}
