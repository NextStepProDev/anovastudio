import Image from "next/image";
import { BRAND, CONTACT } from "@/lib/contact";

export default function Footer() {
  return (
    <footer className="grain relative overflow-hidden bg-espresso-deep text-paper">
      <div
        aria-hidden
        className="h-0.5 bg-gradient-to-r from-transparent via-glow to-transparent shadow-[0_0_14px_1px_color-mix(in_srgb,var(--color-glow)_75%,transparent)]"
      />
      <div aria-hidden className="halo absolute inset-0" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 md:flex-row md:items-start md:justify-between">
        <div>
          <Image
            src="/logo/logo-white.png"
            alt={BRAND}
            width={170}
            height={62}
          />
          <p className="mt-4 max-w-xs text-sm leading-6 text-paper/60">
            Gabinet fizjoterapii ortopedycznej i sportowej. Dbamy o zdrowie
            każdego pacjenta.
          </p>
        </div>

        <div className="text-sm leading-7">
          <h3 className="font-display font-semibold tracking-wide">Kontakt</h3>
          <p className="mt-3 text-paper/70">
            {CONTACT.addressStreet}, {CONTACT.addressCity}
            <br />
            <a href={CONTACT.phoneHref} className="hover:text-glow">
              {CONTACT.phoneDisplay}
            </a>
            <br />
            <a href={`mailto:${CONTACT.email}`} className="hover:text-glow">
              {CONTACT.email}
            </a>
          </p>
        </div>
      </div>

      <div className="relative border-t border-paper/10">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-paper/40">
          © {new Date().getFullYear()} {BRAND}. Wszelkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  );
}
