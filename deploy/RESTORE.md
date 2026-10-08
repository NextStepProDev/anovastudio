# Kopie zapasowe i odtwarzanie

Kopie robi `deploy/anova-backup.sh` (cron roota, 03:00 UTC). Deploy instaluje go
na serwerze jako `/usr/local/bin/anova-backup.sh`; rclone i cron zakłada się ręcznie,
raz (sekcja „Pierwsza konfiguracja”).

| co | lokalnie | dni | na Dysku Google (zaszyfrowane) |
|---|---|---|---|
| zrzut bazy Strapi | `/backups/db/RRRR-MM-DD.sql.gz` | 7 | 90 |
| wgrane pliki (zdjęcia zespołu, galeria) | `/backups/files/RRRR-MM-DD.tar.gz` | 7 | 90 |

Zdalny dysk to `gdrive-crypt:` — remote typu `crypt`, czyli rclone szyfruje pliki
**przed** wysłaniem i Google nie widzi ani treści, ani nazw. Bez haseł tego remote'u
kopie są bezużyteczne — patrz „Czego pilnować”.

Oferta i teksty stron są w kodzie (`lib/offer.ts`), nie w bazie — kopia chroni to,
co klientka wpisała w panelu Strapi: zespół, zdjęcia, galerię, konta administratorów.

---

## Pierwsza konfiguracja (raz)

Wszystko z laptopa, przez `ssh anova`. Konsola Oracle nie jest potrzebna.

**1. rclone na serwerze**

```bash
ssh anova "sudo apt-get install -y rclone && rclone version | head -1"
```

**2. Dostęp do Dysku Google** — ten sam token, co w fire-academy i climbing
(konto `nextsteppro.team@gmail.com`); dzielenie tokenu między serwerami działa
od miesięcy. Kopiujemy sekcję `[gdrive]` z serwera fire-academy:

```bash
ssh -i ~/.ssh/fire-academy-oracle ubuntu@92.5.59.34 "sudo rclone config show gdrive" > /tmp/gdrive.conf
scp /tmp/gdrive.conf anova:/tmp/ && rm /tmp/gdrive.conf
ssh anova "sudo mkdir -p /root/.config/rclone && sudo sh -c 'cat /tmp/gdrive.conf >> /root/.config/rclone/rclone.conf' && rm /tmp/gdrive.conf && sudo chmod 600 /root/.config/rclone/rclone.conf"
```

**3. Szyfrowany remote** — **własna para haseł**, nie ta z rodzeństwa. Najpierw
wygeneruj je i **zapisz w menedżerze haseł**, dopiero potem użyj:

```bash
P1=$(openssl rand -base64 30); P2=$(openssl rand -base64 30); echo "$P1"; echo "$P2"
ssh anova "sudo rclone config create gdrive-crypt crypt remote=gdrive:anova-backups-enc password=$P1 password2=$P2"
```

(`config create` sam zaciemnia hasła w pliku konfiguracji.)

**4. Próba** — przebieg ręczny, potem sprawdzenie, że pliki są na Dysku:

```bash
ssh anova "sudo /usr/local/bin/anova-backup.sh; sudo tail -5 /var/log/anova-backup.log; sudo rclone ls gdrive-crypt:"
```

**5. Cron** — dopiero gdy krok 4 przeszedł. Obraz Ubuntu od Oracle **nie ma crona**
(`crontab: command not found`), więc najpierw instalacja. `timeout 1h`, żeby przebieg
zawieszony na wysyłce (patrz niżej) nie nałożył się na następny; powtórzenie komendy
nie zdubluje wpisu:

```bash
ssh anova "sudo apt-get install -y cron && systemctl is-active cron"
J="0 3 * * * timeout 1h /usr/local/bin/anova-backup.sh"
ssh anova "(sudo crontab -l 2>/dev/null | grep -v anova-backup; echo '$J') | sudo crontab -"
```

**6. Alarm (zalecane)** — check na [healthchecks.io](https://healthchecks.io)
z okresem 1 dzień; URL **tylko** na serwer, nigdy do repo:

```bash
ssh anova "echo 'HEALTHCHECK_URL=https://hc-ping.com/TWOJ-UUID' | sudo tee /etc/anova-backup.env >/dev/null && sudo chmod 600 /etc/anova-backup.env"
```

---

**Znany problem: wysyłka na Dysk się zacina.** Sekcja `[gdrive]` skopiowana z fire-academy
nie ma własnego `client_id`, więc rclone używa wbudowanego klucza, który dzielą wszyscy
jego użytkownicy. Google limituje go wspólnie (`Error 403: Quota exceeded … Requests per
minute`, `project_number:202264815644`, widać dopiero przy `-vv`). Mały zrzut bazy zwykle
przechodzi, archiwum zdjęć potrafi utknąć na długie minuty. Nic nie przepada: kopie zostają
w `/backups`, a następny udany przebieg dośle brakujące. Naprawa: własny klucz OAuth
w Google Cloud (Drive API, aplikacja **opublikowana** — w trybie testowym token wygasa po
7 dniach) i ponowna autoryzacja remote'u `gdrive` — to samo dotyczy fire-academy i climbing.

---

## 1. Skąd wziąć kopię

Jeśli pliki są jeszcze w `/backups` na serwerze, pomiń ten krok. Jeśli nie:

```bash
sudo rclone ls gdrive-crypt:db | sort -k2 | tail      # co jest dostępne
sudo rclone copy gdrive-crypt:db/2026-10-08.sql.gz /tmp/restore/
sudo rclone copy gdrive-crypt:files/2026-10-08.tar.gz /tmp/restore/
```

Sprawdź, czy zrzut jest kompletny, **zanim** cokolwiek skasujesz:

```bash
gunzip -c /tmp/restore/2026-10-08.sql.gz | tail -20 | grep "PostgreSQL database dump complete"
```

Brak tej linijki = plik ucięty. Weź starszy i nie ruszaj produkcji.

---

## 2. Odtworzenie bazy

> ⚠️ Kasuje bieżącą zawartość bazy. Upewnij się, że odtwarzasz właściwy dzień.

```bash
cd /home/ubuntu/anovastudio
docker compose -f docker-compose.prod.yml stop strapi

docker compose -f docker-compose.prod.yml exec -T postgres \
  sh -c 'dropdb --force -U "$POSTGRES_USER" "$POSTGRES_DB" && createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'

gunzip -c /tmp/restore/2026-10-08.sql.gz | docker compose -f docker-compose.prod.yml exec -T postgres \
  sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'

docker compose -f docker-compose.prod.yml start strapi
```

Strapi stoi w trakcie, bo przy starcie sam zakłada i poprawia tabele — odtwarzanie
do bazy, w której ktoś pisze, kończy się konfliktami w połowie. Baza jest zakładana
od nowa, a nie czyszczona: zrzut tworzy tabele od zera i na istniejących by się
wywrócił, a świeża baza to dokładnie te warunki, w których przechodzi „Ćwiczenie”
niżej — co przećwiczone, to zadziała.

Strona publiczna przez ten czas działa — bez zespołu i galerii (puste stany
z `lib/strapi.ts`), a po starcie Strapi odświeża się w ciągu minuty.

---

## 3. Odtworzenie plików

```bash
docker run --rm \
  -v anovastudio_anovastudio_uploads_prod:/data \
  -v /tmp/restore:/backup:ro \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/2026-10-08.tar.gz -C /data"
```

**Sprawdź nazwę wolumenu przed użyciem:** `docker volume ls | grep uploads`. Przedrostek
jest PODWÓJNY (`anovastudio_anovastudio_…`), a nieistniejąca nazwa w `docker run -v`
nie jest błędem — Docker zakłada pusty wolumen i rozpakowujesz kopię w próżnię.

---

## 4. Sprawdzenie

```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
  sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT (SELECT count(*) FROM staffs) AS zespol, (SELECT count(*) FROM files) AS pliki, (SELECT count(*) FROM admin_users) AS admini;"'

curl -s https://api.anovastudio.pl/api/staffs | head -c 200; echo
```

Zero osób w zespole albo zero plików po odtworzeniu = zrzut był pusty. Wróć do kroku 1
i weź starszy. Na koniec otwórz Zespół i Galerię w przeglądarce — zdjęcia muszą się
wczytać, bo baza i pliki muszą pochodzić z tego samego dnia.

---

## Ćwiczenie (raz, na spokojnie, bez dotykania produkcji)

Na laptopie z Dockerem, na zrzucie pobranym z Dysku (`rclone` z hasłami z menedżera
albo `scp anova:/backups/db/…`):

```bash
docker run -d --name restore-test -e POSTGRES_PASSWORD=test -e POSTGRES_USER=anovastudio -e POSTGRES_DB=anovastudio postgres:17-alpine
sleep 5
gunzip -c 2026-10-08.sql.gz | docker exec -i restore-test psql -v ON_ERROR_STOP=1 -U anovastudio -d anovastudio
docker exec restore-test psql -U anovastudio -d anovastudio -c "SELECT count(*) FROM staffs;"
docker rm -f restore-test
```

> ⚠️ **Wersja obrazu musi zgadzać się z produkcją** (dziś `17-alpine`). Przy zmianie
> majora Postgresa popraw tę linijkę razem z `docker-compose.prod.yml`.

---

## Czego pilnować

- **Hasła remote'u `crypt` są równie ważne jak same kopie.** Bez nich pliki na Dysku
  to szum. Trzymaj je w menedżerze haseł, poza serwerem — utrata serwera razem
  z konfiguracją rclone bez kopii haseł = utrata wszystkich kopii.
- **Cisza to awaria.** Bez `HEALTHCHECK_URL` nikt się nie dowie, że kopie przestały
  powstawać. Log mówi tylko tyle, ile ktoś do niego zajrzy.
- **Sprawdzaj ćwiczeniem, nie logiem.** Log mówi, że plik powstał; tylko odtworzenie
  mówi, że da się z niego wrócić.
