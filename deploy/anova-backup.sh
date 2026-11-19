#!/bin/bash
#
# Nightly backup: the whole Strapi database + the volume with uploaded photos,
# encrypted to Google Drive.
#
# The same scheme as in fire-academy and climbing (running there for months).
# The file lives in the repo and deploy.yml installs it on the server on every deploy,
# like nginx.conf and setup-swap.sh — a backup script that exists only on the
# server dies together with the server. Cron and the rclone configuration are set up
# by hand, once — see the note at the end of this file and RESTORE.md.
#
# Three rules, each carried over from the siblings:
#
#   1. NEVER `rclone sync`, always `copy`. Sync makes Drive a mirror of /backups,
#      deletions included — so the local cleanup after 7 days would also delete the
#      remote copies, and anything that destroys /backups on the server would go to
#      the cloud on the next run. The remote history is pruned by a separate, much
#      slower line.
#   2. NEVER publish an unfinished dump. A truncated pg_dump is still valid gzip, so
#      a compression test proves nothing. Work goes to a .part file, is checked for
#      pg_dump's end marker, and only then gets its real name.
#   3. NEVER count on anyone learning about a failure. Cron mails root, and root's
#      mail on this machine goes nowhere. Hence a ping to an external monitor
#      (HEALTHCHECK_URL): it raises the alarm when it hears no success for a day —
#      also when the machine is down or the cron entry has vanished.

# -E, so the ERR trap fires inside functions too.
set -Eeuo pipefail

DATE=$(date +%Y-%m-%d)
DB_DIR="/backups/db"
FILES_DIR="/backups/files"
DB_BACKUP="${DB_DIR}/${DATE}.sql.gz"
FILES_BACKUP="${FILES_DIR}/${DATE}.tar.gz"
LOG="/var/log/anova-backup.log"
REMOTE="gdrive-crypt:"

# Both values depend on the directory the project sits in on the server. The env file
# below is read AFTER them, so after a move it is enough to override them there
# (COMPOSE_DIR=..., UPLOADS_VOLUME=...), without editing the script.
COMPOSE_DIR="/home/ubuntu/anovastudio"
# A DOUBLE prefix: compose prepends the project directory name (`anovastudio`) to the
# name from the file (`anovastudio_uploads_prod`). A mistake in this name is not an
# error — `docker run -v <unknown>:/data` silently CREATES an empty volume and packs
# nothing, and an empty archive passes every test below. Hence the explicit check that
# the volume exists before packing.
UPLOADS_VOLUME="anovastudio_anovastudio_uploads_prod"

# Short locally: it is only a waiting room and shares the disk with the database.
# Longer remotely, because a backup is reached for when a problem surfaced late. 40,
# not 90 days: Drive (15 GB) shares the account with fire-academy and climbing, and at
# 90 days of daily photo archives of all three it would run out of space (counted
# 09.10.2026).
LOCAL_RETENTION_DAYS=7
REMOTE_RETENTION_DAYS=40

# The photo archive is made only when the photos changed — they change a few times a
# year, and each archive is complete (~35 MB), so a daily copy of the same thing ate
# Drive for no gain. Each archive is still FULL: a restore is the newest database dump +
# the newest photo archive before it, because the absence of a newer archive means
# exactly that the photos did not change.
#
# The fingerprints (path, size, modification time of every file) are kept in a state
# file. Without changes an archive is still made every FILES_REFRESH_DAYS days: that
# must be less than REMOTE_RETENTION_DAYS, or pruning Drive would delete the only
# archive. No state file (a new server) = an archive right away.
FILES_REFRESH_DAYS=30
FILES_STATE="/var/lib/anova-backup/files-state"

# Outside the repo on purpose: the ping URL is a secret — whoever knows it can report a
# success that never happened. A file on the server, root only (chmod 600). No file =
# the backup runs normally, just without the alarm.
ENV_FILE="/etc/anova-backup.env"
HEALTHCHECK_URL=""
# shellcheck source=/dev/null
[ -r "$ENV_FILE" ] && . "$ENV_FILE"

log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$LOG"; }

# A monitor that cannot be reached has no right to kill the backup — the backup is the
# goal, the ping is only a report about it.
ping_healthcheck() {
    [ -n "$HEALTHCHECK_URL" ] || return 0
    curl -fsS -m 10 --retry 3 -o /dev/null "${HEALTHCHECK_URL}${1:-}" \
        || log "WARN: could not send the ping '${1:-<success>}' — the backup itself is unaffected"
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

trap 'fail "unexpected error at line ${LINENO} (code $?)"' ERR
# Cron runs the script through `timeout 1h`, which after the limit sends TERM to the
# whole process group. Without this trap a run killed halfway through the upload left
# nothing in the log but the last "Copy to …" and did not ping /fail — exactly what the
# hung upload of 08.10.2026 looked like (a Google limit, see RESTORE.md).
trap 'fail "killed by a signal (e.g. the cron time limit) — the last step is on the line above"' TERM INT

mkdir -p "$DB_DIR" "$FILES_DIR" "$(dirname "$FILES_STATE")"
log "=== Backup start ==="

[ "$FILES_REFRESH_DAYS" -lt "$REMOTE_RETENTION_DAYS" ] \
    || fail "FILES_REFRESH_DAYS (${FILES_REFRESH_DAYS}) must be smaller than REMOTE_RETENTION_DAYS (${REMOTE_RETENTION_DAYS}) — otherwise Drive would be left without a photo archive"

# --- preconditions ----------------------------------------------------------

# Checked at the START, not at upload: without rclone and the remote drive everything
# else only fills the disk with backups that will never leave the server.
command -v rclone >/dev/null 2>&1 || fail "no rclone on the server — see RESTORE.md, section \"Pierwsza konfiguracja\""
REMOTES=$(rclone listremotes)
grep -qxF "$REMOTE" <<<"$REMOTES" || fail "rclone does not know the remote ${REMOTE} — see RESTORE.md, section \"Pierwsza konfiguracja\""

if ! docker volume inspect "$UPLOADS_VOLUME" >/dev/null 2>&1; then
    log "        available: $(docker volume ls --format '{{.Name}}' | grep -i uploads | tr '\n' ' ' || true)"
    fail "volume '${UPLOADS_VOLUME}' does not exist — not packing anything that pretends to be a backup"
fi

# --- baza --------------------------------------------------------------------

log "DB dump -> ${DB_BACKUP}.part"
# The database user and name from the container's env, not from this file — one source
# of truth (.env next to compose), zero passwords in the repo.
docker compose -f "${COMPOSE_DIR}/docker-compose.prod.yml" exec -T postgres \
    sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' | gzip > "${DB_BACKUP}.part"

# pg_dump's end marker is the only cheap proof that the dump reached its end.
# A window of 20 lines, not 5: since the August 2025 fixes (incl. 17.6) `\unrestrict
# <token>` follows the marker, so in fire-academy the marker sat exactly on the 5th line
# from the end — the test passed with zero margin. A truncated dump has no marker
# anywhere, so the wider window costs nothing.
#
# Into a variable first, then grep — here and above at listremotes. grep at the end of a
# pipe exits on the first hit (with -q, but also without it when writing to /dev/null),
# and if the producer is still writing it gets SIGPIPE, and with pipefail the whole pipe
# reports an error: a good dump would be judged truncated. Checked 08.10.2026 — both
# variants with grep in the pipe gave code 141.
DUMP_TAIL=$(gunzip -c "${DB_BACKUP}.part" | tail -20)
if ! grep -qF "PostgreSQL database dump complete" <<<"$DUMP_TAIL"; then
    rm -f "${DB_BACKUP}.part"
    fail "database dump without the end marker — truncated, not publishing"
fi
mv "${DB_BACKUP}.part" "$DB_BACKUP"
log "DB OK: $(du -sh "$DB_BACKUP" | cut -f1)"

# --- uploaded files ------------------------------------------------------------

# A fingerprint of the volume's contents: path|size|modification time of every file,
# sorted and hashed. Adding, deleting or replacing a photo changes it.
# Computed BEFORE packing: if something arrives in the meantime, it goes into the
# archive and tomorrow's fingerprint differs — so at most one archive too many, never
# one too few.
FILES_FP=$(docker run --rm -v "${UPLOADS_VOLUME}:/data:ro" alpine \
    sh -c 'cd /data && find . -type f -exec stat -c "%n|%s|%Y" {} + | sort' \
    | sha256sum | cut -d' ' -f1)

PREV_FP=""
PREV_AT=0
if [ -r "$FILES_STATE" ]; then
    read -r PREV_FP PREV_AT < "$FILES_STATE" || true
fi
# A corrupt state (e.g. a write cut off on a full disk) must not overturn the backup
# every night: junk instead of a number = treat it as no state, i.e. make an archive —
# and the write after it repairs the file.
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

    # Reading the whole archive is the difference between "tar exited with 0" and "the
    # archive can be opened" — it catches both a damaged stream and truncation on a full
    # disk.
    if ! tar tzf "${FILES_BACKUP}.part" >/dev/null 2>&1; then
        rm -f "${FILES_BACKUP}.part"
        fail "the files archive cannot be read — not publishing"
    fi
    mv "${FILES_BACKUP}.part" "$FILES_BACKUP"
    # The state is written only after the archive is published: a failed run leaves the
    # old fingerprint, so tomorrow the archive is made again.
    printf '%s %s\n' "$FILES_FP" "$(date +%s)" > "$FILES_STATE"
    log "Files OK: $(du -sh "$FILES_BACKUP" | cut -f1)"
else
    log "Files: photos unchanged since $(date -d "@${PREV_AT}" +%F 2>/dev/null || echo "${FILES_AGE_DAYS} days") — the newest archive is still current, not making a new one"
fi

# --- off the server -------------------------------------------------------------

# `copy`, never `sync` — rule 1 at the top. .part files have no right to leave the
# server: they are files that failed verification.
#
# The most likely failure of the whole script: the Drive token is shared with
# fire-academy and climbing, so revoking it anywhere stops the upload here. Hence an
# explicit message instead of "error at line N". Today's backups are already published
# locally, and the local cleanup below will not run — nothing is lost, and `copy` on
# the next successful run sends everything Drive is missing.
log "Copy to ${REMOTE}"
rclone copy /backups "$REMOTE" --exclude "*.part" --log-file="$LOG" --log-level NOTICE \
    || fail "upload to Drive (${REMOTE}) failed — the backups stayed locally in /backups; rclone details above in the log"

# Separately and slowly. --min-age is a filter, so nothing fresher can be caught.
# --drive-use-trash=false: delete permanently, skipping Drive's bin. The bin counts
# toward the account's 15 GB, and Google empties it only after 30 days — so each backup
# took space for 70 days instead of 40. In the worst case (daily photo archives of all
# three projects) that is 13.2 GB of 15 (counted 12.10.2026). There is no point
# recovering an expired backup.
log "Prune remote older than ${REMOTE_RETENTION_DAYS}d"
rclone delete "$REMOTE" --min-age "${REMOTE_RETENTION_DAYS}d" --drive-use-trash=false --log-file="$LOG" --log-level NOTICE \
    || fail "pruning old backups on Drive failed — today's backup is uploaded and local"

# --- local cleanup ----------------------------------------------------------

find "$DB_DIR" -name "*.sql.gz" -mtime "+${LOCAL_RETENTION_DAYS}" -delete
# The newest photo archive always stays, even if older than 7 days: with unchanged
# photos it is the current copy, and a restore from the server alone (without Drive)
# must still have something to come back from. The names are dates, so sorting by name
# = by age.
NEWEST_FILES=$(find "$FILES_DIR" -maxdepth 1 -name "*.tar.gz" | sort | tail -1)
find "$FILES_DIR" -name "*.tar.gz" -mtime "+${LOCAL_RETENTION_DAYS}" ! -path "${NEWEST_FILES:-/nic}" -delete
# Leftovers of a run that failed halfway.
find "$DB_DIR" "$FILES_DIR" -name "*.part" -mtime +1 -delete

log "=== Backup done ==="
ping_healthcheck ""

# --- installation on the server ----------------------------------------------
#
# deploy.yml installs the script and the log rotation. What stays by hand, once:
#   1. rclone + the `gdrive-crypt:` remote — RESTORE.md, section "Pierwsza konfiguracja"
#   2. a first trial run:  sudo /usr/local/bin/anova-backup.sh
#   3. cron (only once step 2 has passed; the Oracle image has no cron — first
#      `sudo apt-get install -y cron`):
#        (sudo crontab -l 2>/dev/null | grep -v anova-backup; echo "0 3 * * * timeout 1h /usr/local/bin/anova-backup.sh") | sudo crontab -
#   4. alarm (recommended): a check on healthchecks.io with a daily period, the URL into
#        /etc/anova-backup.env as HEALTHCHECK_URL=..., chmod 600.
