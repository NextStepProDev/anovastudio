import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-start px-5 py-24 md:py-36">
      <p className="kicker">Błąd 404</p>
      <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink">
        Nie znaleziono strony
      </h1>
      <p className="mt-4 max-w-md text-lg leading-7 text-ink-soft">
        Strona, której szukasz, nie istnieje lub została przeniesiona.
      </p>
      <Link href="/" className="btn btn-primary mt-10">
        Wróć na stronę główną
      </Link>
    </section>
  );
}
