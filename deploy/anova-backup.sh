#!/bin/bash
#
# Nocna kopia zapasowa: cała baza Strapi + wolumen z wgranymi zdjęciami,
# zaszyfrowane na Dysk Google.
#
# Ten sam schemat co w fire-academy i climbing (tam działa od miesięcy).
# Plik żyje w repo i deploy.yml instaluje go na serwerze przy każdym deployu,
# tak jak nginx.conf i setup-swap.sh — skrypt kopii, który istnieje tylko na
# serwerze, ginie razem z serwerem. Cron i konfigurację rclone zakłada się
# ręcznie, raz — patrz notka na końcu pliku i RESTORE.md.
#
# Trzy zasady, każda wyniesiona z rodzeństwa:
#
#   1. NIGDY `rclone sync`, zawsze `copy`. Sync robi z Dysku lustro katalogu
#      /backups, łącznie z kasowaniem — więc lokalne sprzątanie po 7 dniach
#      skasowałoby też kopie zdalne, a wszystko, co zniszczy /backups na
#      serwerze, poszłoby do chmury przy następnym przebiegu. Zdalną historię
#      przycina osobna, dużo wolniejsza linijka.
#   2. NIGDY nie publikować niedokończonego zrzutu. Ucięty pg_dump to wciąż
#      poprawny gzip, więc test kompresji niczego nie dowodzi. Praca idzie do
#      pliku .part, jest sprawdzana na znacznik końca pg_dump i dopiero wtedy
#      dostaje prawdziwą nazwę.
#   3. NIGDY nie liczyć, że ktoś się dowie o awarii. Cron wysyła maila do
#      roota, a mail roota na tej maszynie nigdzie nie idzie. Dlatego ping do
#      zewnętrznego monitora (HEALTHCHECK_URL): to on podnosi alarm, gdy przez
#      dobę nie usłyszy sukcesu — także wtedy, gdy maszyna leży albo cron zniknął.

# -E, żeby pułapka ERR odpalała też wewnątrz funkcji.
set -Eeuo pipefail

DATE=$(date +%Y-%m-%d)
DB_DIR="/backups/db"
FILES_DIR="/backups/files"
DB_BACKUP="${DB_DIR}/${DATE}.sql.gz"
FILES_BACKUP="${FILES_DIR}/${DATE}.tar.gz"
LOG="/var/log/anova-backup.log"
REMOTE="gdrive-crypt:"

# Obie wartości zależą od katalogu, w którym stoi projekt na serwerze. Plik env
# niżej jest wczytywany PO nich, więc po przeprowadzce wystarczy nadpisać je
# tam (COMPOSE_DIR=..., UPLOADS_VOLUME=...), bez edycji skryptu.
COMPOSE_DIR="/home/ubuntu/anovastudio"
# PODWÓJNY przedrostek: compose dokleja nazwę katalogu projektu
# (`anovastudio`) do nazwy z pliku (`anovastudio_uploads_prod`). Pomyłka
# w tej nazwie nie jest błędem — `docker run -v <nieznana>:/data` po cichu
# ZAKŁADA pusty wolumen i pakuje nic, a puste archiwum przechodzi każdy test
# poniżej. Stąd jawne sprawdzenie istnienia wolumenu przed pakowaniem.
UPLOADS_VOLUME="anovastudio_anovastudio_uploads_prod"

# Lokalnie krótko: to tylko poczekalnia i dzieli dysk z bazą. Zdalnie dłużej,
# bo po kopię sięga się wtedy, gdy problem wyszedł późno. 40, nie 90 dni: Dysk
# (15 GB) dzieli konto z fire-academy i climbing, a przy 90 dniach codziennych
# archiwów zdjęć całej trójki zabrakłoby na nim miejsca (policzone 09.10.2026).
LOCAL_RETENTION_DAYS=7
REMOTE_RETENTION_DAYS=40

# Archiwum zdjęć powstaje tylko, gdy zdjęcia się zmieniły — zmieniają się kilka
# razy w roku, a każde archiwum to komplet (~35 MB), więc codzienna kopia tego
# samego zjadała Dysk bez żadnego zysku. Każde archiwum nadal jest PEŁNE:
# odtworzenie to najnowszy zrzut bazy + najnowsze archiwum zdjęć sprzed niego,
# bo brak nowszego archiwum znaczy właśnie, że zdjęcia się nie zmieniły.
#
# Odciski (ścieżka, rozmiar, data modyfikacji każdego pliku) trzyma plik stanu.
# Bez zmian archiwum i tak powstaje co FILES_REFRESH_DAYS dni: musi to być mniej
# niż REMOTE_RETENTION_DAYS, inaczej przycinanie Dysku skasowałoby jedyne
# archiwum. Brak pliku stanu (nowy serwer) = archiwum od razu.
FILES_REFRESH_DAYS=30
FILES_STATE="/var/lib/anova-backup/files-state"

# Poza repo celowo: URL pingu jest sekretem — kto go zna, może zgłosić sukces,
# którego nie było. Plik na serwerze, tylko dla roota (chmod 600). Brak pliku =
# kopia robi się normalnie, tylko bez alarmu.
ENV_FILE="/etc/anova-backup.env"
HEALTHCHECK_URL=""
# shellcheck source=/dev/null
[ -r "$ENV_FILE" ] && . "$ENV_FILE"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$LOG"; }

# Monitor, do którego nie da się dobić, nie ma prawa ubić kopii — kopia jest
# celem, ping tylko raportem o niej.
ping_healthcheck() {
    [ -n "$HEALTHCHECK_URL" ] || return 0
    curl -fsS -m 10 --retry 3 -o /dev/null "${HEALTHCHECK_URL}${1:-}" \
        || log "WARN: nie udało się wysłać pingu '${1:-<sukces>}' — sama kopia bez zmian"
}

PINGED_FAIL=0
fail() {
    log "FAILED: $*"
    if [ "$PINGED_FAIL" -eq 0 ]; then
        PINGED_FAIL=1
        ping_healthcheck "/fail"
    fi
    exit 1
}

trap 'fail "nieoczekiwany błąd w linii ${LINENO} (kod $?)"' ERR
# Cron uruchamia skrypt przez `timeout 1h`, który po czasie wysyła TERM całej
# grupie procesów. Bez tej pułapki przebieg ubity w połowie wysyłki nie zostawiał
# w logu nic poza ostatnim „Copy to …” i nie pingował /fail — dokładnie tak
# wyglądał zawieszony upload z 08.10.2026 (limit Google, patrz RESTORE.md).
trap 'fail "przerwany sygnałem (np. limit czasu z crona) — ostatni krok w linii wyżej"' TERM INT

mkdir -p "$DB_DIR" "$FILES_DIR" "$(dirname "$FILES_STATE")"
log "=== Backup start ==="

[ "$FILES_REFRESH_DAYS" -lt "$REMOTE_RETENTION_DAYS" ] \
    || fail "FILES_REFRESH_DAYS (${FILES_REFRESH_DAYS}) musi być mniejsze niż REMOTE_RETENTION_DAYS (${REMOTE_RETENTION_DAYS}) — inaczej Dysk zostałby bez archiwum zdjęć"

# --- warunki wstępne ---------------------------------------------------------

# Sprawdzane NA POCZĄTKU, nie przy wysyłce: bez rclone i zdalnego dysku cała
# reszta tylko zapycha dysk kopiami, które nigdy nie wyjdą poza serwer.
command -v rclone >/dev/null 2>&1 || fail "brak rclone na serwerze — patrz RESTORE.md, „Pierwsza konfiguracja”"
REMOTES=$(rclone listremotes)
grep -qxF "$REMOTE" <<<"$REMOTES" || fail "rclone nie zna remote'u ${REMOTE} — patrz RESTORE.md, „Pierwsza konfiguracja”"

if ! docker volume inspect "$UPLOADS_VOLUME" >/dev/null 2>&1; then
    log "        dostępne: $(docker volume ls --format '{{.Name}}' | grep -i uploads | tr '\n' ' ' || true)"
    fail "wolumen '${UPLOADS_VOLUME}' nie istnieje — nie pakuję niczego udającego kopię"
fi

# --- baza --------------------------------------------------------------------

log "DB dump -> ${DB_BACKUP}.part"
# Użytkownik i nazwa bazy z env kontenera, nie z tego pliku — jedno źródło
# prawdy (.env obok compose), zero haseł w repo.
docker compose -f "${COMPOSE_DIR}/docker-compose.prod.yml" exec -T postgres \
    sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "${DB_BACKUP}.part"

# Znacznik końca pg_dump to jedyny tani dowód, że zrzut doszedł do końca.
# Okno 20 linii, nie 5: od poprawek z sierpnia 2025 (m.in. 17.6) po znaczniku
# idzie jeszcze `\unrestrict <token>`, przez co w fire-academy znacznik siedział dokładnie
# na 5. linii od końca — test przechodził z zerowym zapasem. Ucięty zrzut nie
# ma znacznika nigdzie, więc szersze okno nic nie kosztuje.
#
# Najpierw do zmiennej, potem grep — tu i wyżej przy listremotes. grep na końcu
# potoku wychodzi po pierwszym trafieniu (z -q, ale też bez niego, gdy pisze do
# /dev/null), a jeśli poprzednik jeszcze pisze, dostaje SIGPIPE i przy pipefail
# cały potok zgłasza błąd: dobry zrzut zostałby uznany za ucięty. Sprawdzone
# 08.10.2026 — oba warianty z grepem w potoku dały kod 141.
DUMP_TAIL=$(gunzip -c "${DB_BACKUP}.part" | tail -20)
if ! grep -qF "PostgreSQL database dump complete" <<<"$DUMP_TAIL"; then
    rm -f "${DB_BACKUP}.part"
    fail "zrzut bazy bez znacznika końca — ucięty, nie publikuję"
fi
mv "${DB_BACKUP}.part" "$DB_BACKUP"
log "DB OK: $(du -sh "$DB_BACKUP" | cut -f1)"

# --- wgrane pliki ------------------------------------------------------------

# Odcisk zawartości wolumenu: ścieżka|rozmiar|data modyfikacji każdego pliku,
# posortowane i zhaszowane. Dodanie, usunięcie i podmiana zdjęcia go zmieniają.
# Liczony PRZED pakowaniem: jeśli coś dojdzie w międzyczasie, trafi do archiwum,
# a jutrzejszy odcisk będzie inny — czyli najwyżej jedno archiwum za dużo,
# nigdy za mało.
FILES_FP=$(docker run --rm -v "${UPLOADS_VOLUME}:/data:ro" alpine \
    sh -c 'cd /data && find . -type f -exec stat -c "%n|%s|%Y" {} + | sort' \
    | sha256sum | cut -d' ' -f1)

PREV_FP=""
PREV_AT=0
if [ -r "$FILES_STATE" ]; then
    read -r PREV_FP PREV_AT < "$FILES_STATE" || true
fi
# Uszkodzony stan (np. zapis ucięty przy pełnym dysku) nie może wywracać kopii
# co noc: śmieci zamiast liczby = traktuj jak brak stanu, czyli zrób archiwum —
# a zapis po nim naprawi plik.
case "$PREV_AT" in
    ''|*[!0-9]*) PREV_FP=""; PREV_AT=0 ;;
esac
FILES_AGE_DAYS=$(( ( $(date +%s) - PREV_AT ) / 86400 ))

if [ "$FILES_FP" != "$PREV_FP" ] || [ "$FILES_AGE_DAYS" -ge "$FILES_REFRESH_DAYS" ]; then
    log "Files archive -> ${FILES_BACKUP}.part"
    docker run --rm \
        -v "${UPLOADS_VOLUME}:/data:ro" \
        -v "${FILES_DIR}:/backup" \
        alpine tar czf "/backup/${DATE}.tar.gz.part" -C /data .

    # Odczyt całego archiwum to różnica między „tar skończył z kodem 0”
    # a „archiwum da się otworzyć” — łapie i uszkodzony strumień, i ucięcie
    # przy zapchanym dysku.
    if ! tar tzf "${FILES_BACKUP}.part" >/dev/null 2>&1; then
        rm -f "${FILES_BACKUP}.part"
        fail "archiwum plików nie daje się odczytać — nie publikuję"
    fi
    mv "${FILES_BACKUP}.part" "$FILES_BACKUP"
    # Stan zapisywany dopiero po opublikowaniu archiwum: padnięty przebieg
    # zostawia stary odcisk, więc jutro archiwum powstanie jeszcze raz.
    printf '%s %s\n' "$FILES_FP" "$(date +%s)" > "$FILES_STATE"
    log "Files OK: $(du -sh "$FILES_BACKUP" | cut -f1)"
else
    log "Files: zdjęcia bez zmian od $(date -d "@${PREV_AT}" +%F 2>/dev/null || echo "${FILES_AGE_DAYS} dni") — najnowsze archiwum nadal aktualne, nowego nie robię"
fi

# --- poza serwer -------------------------------------------------------------

# `copy`, nigdy `sync` — zasada 1 na górze. .part nie mają prawa wyjść
# z serwera: to pliki, które nie przeszły weryfikacji.
#
# Najbardziej prawdopodobna awaria całego skryptu: token Dysku jest dzielony
# z fire-academy i climbing, więc jego unieważnienie gdziekolwiek zatrzymuje
# wysyłkę tutaj. Stąd jawny komunikat zamiast „błąd w linii N”. Kopie z dziś
# są już opublikowane lokalnie, a lokalne sprzątanie niżej się nie wykona —
# nic nie przepada, a `copy` przy następnym udanym przebiegu dośle wszystko,
# czego na Dysku brakuje.
log "Copy to ${REMOTE}"
rclone copy /backups "$REMOTE" --exclude "*.part" --log-file="$LOG" --log-level NOTICE \
    || fail "wysyłka na Drive (${REMOTE}) nie powiodła się — kopie zostały lokalnie w /backups; szczegóły rclone wyżej w logu"

# Osobno i wolno. --min-age to filtr, więc nic świeższego nie może się złapać.
log "Prune remote older than ${REMOTE_RETENTION_DAYS}d"
rclone delete "$REMOTE" --min-age "${REMOTE_RETENTION_DAYS}d" --log-file="$LOG" --log-level NOTICE \
    || fail "sprzątanie starych kopii na Drive nie powiodło się — dzisiejsza kopia jest wysłana i lokalnie"

# --- lokalne sprzątanie ------------------------------------------------------

find "$DB_DIR" -name "*.sql.gz" -mtime "+${LOCAL_RETENTION_DAYS}" -delete
# Najnowsze archiwum zdjęć zostaje zawsze, nawet starsze niż 7 dni: przy
# zdjęciach bez zmian to ono jest aktualną kopią, a odtworzenie z samego
# serwera (bez Dysku) ma dalej mieć z czego wrócić. Nazwy to daty, więc
# sortowanie po nazwie = po wieku.
NEWEST_FILES=$(find "$FILES_DIR" -maxdepth 1 -name "*.tar.gz" | sort | tail -1)
find "$FILES_DIR" -name "*.tar.gz" -mtime "+${LOCAL_RETENTION_DAYS}" ! -path "${NEWEST_FILES:-/nic}" -delete
# Resztki po przebiegu, który padł w połowie.
find "$DB_DIR" "$FILES_DIR" -name "*.part" -mtime +1 -delete

log "=== Backup done ==="
ping_healthcheck ""

# --- instalacja na serwerze --------------------------------------------------
#
# Skrypt i rotację logu instaluje deploy.yml. Ręcznie, raz, zostaje:
#   1. rclone + remote `gdrive-crypt:` — RESTORE.md, „Pierwsza konfiguracja”
#   2. pierwszy przebieg na próbę:  sudo /usr/local/bin/anova-backup.sh
#   3. cron (dopiero gdy krok 2 przeszedł; obraz Oracle nie ma crona — najpierw
#      `sudo apt-get install -y cron`):
#        (sudo crontab -l 2>/dev/null | grep -v anova-backup; echo "0 3 * * * timeout 1h /usr/local/bin/anova-backup.sh") | sudo crontab -
#   4. alarm (zalecane): check na healthchecks.io z dobowym okresem, URL do
#        /etc/anova-backup.env jako HEALTHCHECK_URL=..., chmod 600.
