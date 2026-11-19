import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BRAND, CONTACT } from "@/lib/contact";
import { CONTROLLER } from "@/lib/legal";
import { pageMetadata } from "@/lib/seo";

/**
 * The privacy policy describes what the site actually does — and it is a short list: no
 * forms, no accounts, no analytics, no cookies of our own. Whatever changes that list
 * (a booking link, a form, a new embed, another processor) changes this page in the same
 * commit, with a new LAST_UPDATED.
 */
const LAST_UPDATED = "19 listopada 2026";

// A function, not a constant: Next's metadata resolver consumes the object passed in,
// and the page can be rendered several times in one process (the card image got lost).
export function generateMetadata(): Metadata {
  return pageMetadata({
    title: "Polityka prywatności",
    description: `Jak ${BRAND} w Libiążu przetwarza dane osobowe osób odwiedzających stronę i kontaktujących się z gabinetem.`,
    path: "/polityka-prywatnosci",
  });
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">{title}</h2>
      <div className="mt-4 space-y-4 leading-7 text-ink-soft">{children}</div>
    </section>
  );
}

function List({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-3 pl-5 marker:text-accent">{children}</ul>;
}

const linkClass = "text-accent underline underline-offset-4 hover:text-ink";

export default function PolitykaPrywatnosciPage() {
  const mail = (
    <a href={`mailto:${CONTACT.email}`} className={linkClass}>
      {CONTACT.email}
    </a>
  );

  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:py-24">
      <p className="kicker">Prywatność</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink">
        Polityka prywatności
      </h1>
      <p className="mt-6 text-lg leading-8 text-ink-soft">
        Ta strona wyjaśnia, jakie dane osobowe trafiają do nas, gdy odwiedzasz stronę {BRAND}{" "}
        albo się z nami kontaktujesz, po co je mamy i jakie masz prawa. Strona nie ma formularzy
        ani kont, nie używa narzędzi analitycznych i sama nie zapisuje ciasteczek.
      </p>
      <p className="mt-4 text-sm text-ink-muted">Ostatnia aktualizacja: {LAST_UPDATED}</p>

      <Section title="Kto jest administratorem danych">
        <p>
          Administratorem danych jest {CONTROLLER.name}, {CONTROLLER.street}, {CONTROLLER.city},
          wpisana do Krajowego Rejestru Sądowego pod numerem KRS {CONTROLLER.krs}, NIP{" "}
          {CONTROLLER.nip}, REGON {CONTROLLER.regon} — spółka prowadząca gabinet {BRAND}.
        </p>
        <p>
          We wszystkich sprawach dotyczących danych osobowych napisz na {mail} albo zadzwoń pod{" "}
          <a href={CONTACT.phoneHref} className={linkClass}>
            {CONTACT.phoneDisplay}
          </a>
          .
        </p>
        <p>
          Ta polityka dotyczy strony internetowej i kontaktu z gabinetem. Dokumentację medyczną
          i inne dane pacjentów zbierane podczas wizyt przetwarzamy na podstawie odrębnych
          przepisów o prawach pacjenta i dokumentacji medycznej.
        </p>
      </Section>

      <Section title="Jakie dane i po co">
        <List>
          <li>
            <strong>Kontakt telefoniczny i mailowy</strong> — gdy dzwonisz albo piszesz, mamy Twój
            numer telefonu lub adres e-mail, imię i treść wiadomości. Używamy ich, żeby
            odpowiedzieć i umówić wizytę. Podstawa: działania przed zawarciem umowy na Twoje
            żądanie oraz nasz prawnie uzasadniony interes, czyli odpowiedź na wiadomość (art. 6
            ust. 1 lit. b i f RODO). Prosimy, żeby nie opisywać w wiadomości szczegółów stanu
            zdrowia — omówimy je na wizycie.
          </li>
          <li>
            <strong>Dzienniki serwera</strong> — przy każdej wizycie serwer zapisuje techniczne
            informacje: adres IP, datę, odwiedzany adres i rodzaj przeglądarki. Po to, żeby
            chronić stronę przed nadużyciami i wykrywać awarie. Podstawa: nasz prawnie
            uzasadniony interes (art. 6 ust. 1 lit. f RODO).
          </li>
        </List>
        <p>
          Podanie danych jest dobrowolne, ale bez numeru telefonu albo adresu e-mail nie
          odpowiemy na wiadomość.
        </p>
      </Section>

      <Section title="Jak długo">
        <List>
          <li>
            <strong>Wiadomości</strong> — przez czas potrzebny do odpowiedzi i umówienia wizyty,
            a dłużej tylko wtedy, gdy wymaga tego prawo albo ochrona przed roszczeniami.
          </li>
          <li>
            <strong>Dzienniki serwera</strong> — mają ograniczoną objętość; najstarsze wpisy są
            automatycznie nadpisywane nowymi.
          </li>
        </List>
      </Section>

      <Section title="Komu przekazujemy dane">
        <p>Korzystamy z firm, które przetwarzają dane w naszym imieniu:</p>
        <List>
          <li>
            <strong>Dostawca serwera</strong> — serwer, na którym działa strona.
          </li>
          <li>
            <strong>Cloudflare</strong> (Cloudflare, Inc., USA) — pośredniczy w ruchu do strony i
            chroni ją przed atakami; widzi m.in. adres IP odwiedzającego. Przekazanie danych do
            USA odbywa się na podstawie unijnych standardowych klauzul umownych i programu EU-US
            Data Privacy Framework.
          </li>
          <li>
            <strong>Google</strong> (Google Ireland Ltd., UE) — skrzynka e-mail, na którą
            trafiają Twoje wiadomości.
          </li>
          <li>
            <strong>Obsługa techniczna strony</strong> — osoba, która utrzymuje stronę i serwer.
          </li>
        </List>
        <p>
          Na stronie{" "}
          <Link href="/kontakt" className={linkClass}>
            Kontakt
          </Link>{" "}
          pokazujemy mapę dojazdu z Map Google. Mapa wczytuje się z serwerów Google (Google
          Ireland Ltd.), które — jak przy każdym wyświetleniu strony — otrzymują przy tym
          standardowe informacje techniczne, np. adres IP. Google korzysta z nich na zasadach
          opisanych w swojej polityce prywatności (policies.google.com/privacy). Podstawą jest nasz
          uzasadniony interes: ułatwienie dojazdu do gabinetu (art. 6 ust. 1 lit. f RODO).
        </p>
        <p>
          Linki do naszych profili na Facebooku i Instagramie prowadzą na strony Meta — po
          kliknięciu obowiązują zasady prywatności tych serwisów.
        </p>
        <p>Dane możemy też przekazać organom publicznym, jeśli wymaga tego prawo.</p>
      </Section>

      <Section title="Twoje prawa">
        <p>Masz prawo do:</p>
        <List>
          <li>dostępu do swoich danych i otrzymania ich kopii,</li>
          <li>sprostowania danych, które są nieprawidłowe,</li>
          <li>usunięcia danych albo ograniczenia ich przetwarzania,</li>
          <li>przeniesienia danych,</li>
          <li>
            sprzeciwu wobec przetwarzania opartego na naszym uzasadnionym interesie (np. dzienniki
            serwera).
          </li>
        </List>
        <p>Najprościej: napisz na {mail}.</p>
        <p>
          Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2,
          00-193 Warszawa).
        </p>
      </Section>

      <Section title="Ciasteczka">
        <p>
          Strona sama nie zapisuje ciasteczek. Cloudflare może zapisać techniczne ciasteczko
          służące ochronie strony przed botami, a mapa Google na stronie Kontakt — ciasteczka
          Google, na zasadach Google.
        </p>
      </Section>

      <Section title="Bezpieczeństwo">
        <p>
          Połączenie ze stroną jest szyfrowane (HTTPS). Nie podejmujemy wobec Ciebie decyzji w
          sposób zautomatyzowany i nie profilujemy Cię.
        </p>
      </Section>

      <Section title="Zmiany">
        <p>
          Gdy zmieni się sposób, w jaki przetwarzamy dane, zaktualizujemy tę stronę i datę
          aktualizacji na jej początku.
        </p>
      </Section>
    </article>
  );
}
