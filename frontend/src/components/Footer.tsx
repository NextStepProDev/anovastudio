import Image from "next/image";
import { CONTACT } from "@/lib/contact";

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 md:flex-row md:items-start md:justify-between">
        <div>
          <Image
            src="/logo/logo-white.png"
            alt="fizjo4life"
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
            <a href={CONTACT.phoneHref} className="hover:text-accent">
              {CONTACT.phoneDisplay}
            </a>
            <br />
            <a href={`mailto:${CONTACT.email}`} className="hover:text-accent">
              {CONTACT.email}
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-paper/10">
        <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-paper/40">
          © {new Date().getFullYear()} fizjo4life. Wszelkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  );
}
