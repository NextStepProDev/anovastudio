#!/usr/bin/env bash
#
# setup-origin-firewall.sh — instaluje origin-firewall.sh na serwerze
# i od razu go stosuje.
#
# Uruchamia go deploy.yml przy każdym wdrożeniu, obok setup-swap.sh, więc
# zmiana reguł albo listy Cloudflare w nginx.conf dociera na serwer
# z następnym deployem. Można uruchamiać wielokrotnie.
#
# Instaluje: /usr/local/sbin/anova-origin-firewall.sh,
#            /etc/systemd/system/anova-origin-firewall.service (włączona),
#            /etc/anova-origin-firewall/cloudflare-v4.txt (z nginx.conf).
#
# Użycie: sudo bash setup-origin-firewall.sh <katalog z origin-firewall.*> <nginx.conf>

set -euo pipefail

SRC="${1:?użycie: setup-origin-firewall.sh <katalog> <nginx.conf>}"
NGINX_CONF="${2:?użycie: setup-origin-firewall.sh <katalog> <nginx.conf>}"
RANGES_DIR="/etc/anova-origin-firewall"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Wymaga roota: sudo bash setup-origin-firewall.sh <katalog> <nginx.conf>" >&2
  exit 1
fi

echo "==> Zapora originu: instalacja z ${SRC}"

# 1. Zakresy IPv4 Cloudflare — ta sama lista, której nginx ufa przy
#    ustalaniu prawdziwego adresu odwiedzającego. IPv6 pominięte: porty są
#    wystawione tylko na IPv4 (docker-compose.prod.yml).
#    Za krótka lista zostawia poprzedni plik: zapora i tak by ją odrzuciła,
#    ale po restarcie serwera nie miałaby czego zastosować.
RANGES=$(sed -nE 's/^[[:space:]]*set_real_ip_from[[:space:]]+([0-9.]+\/[0-9]+);.*/\1/p' "${NGINX_CONF}")
COUNT=$(grep -c . <<<"${RANGES}" || true)
if (( COUNT < 10 )); then
  echo "BŁĄD: za mało zakresów IPv4 Cloudflare w ${NGINX_CONF}: ${COUNT} — zapora bez zmian." >&2
  exit 1
fi
mkdir -p "${RANGES_DIR}"
printf '%s\n' "${RANGES}" > "${RANGES_DIR}/cloudflare-v4.txt.new"
mv "${RANGES_DIR}/cloudflare-v4.txt.new" "${RANGES_DIR}/cloudflare-v4.txt"

# 2. Skrypt i usługa, która stosuje go przy każdym starcie serwera.
install -m 0755 "${SRC}/origin-firewall.sh" /usr/local/sbin/anova-origin-firewall.sh
install -m 0644 "${SRC}/origin-firewall.service" /etc/systemd/system/anova-origin-firewall.service
systemctl daemon-reload
systemctl enable anova-origin-firewall.service >/dev/null 2>&1

# 3. Zastosowanie od razu. Skrypt sam odrzuca uszkodzoną listę i niczego
#    nie zmienia; powód trafia do dziennika, więc pokazujemy go tu, w logu
#    deployu.
if ! systemctl restart anova-origin-firewall.service; then
  journalctl -u anova-origin-firewall.service -n 5 --no-pager -o cat || true
  exit 1
fi
journalctl -u anova-origin-firewall.service -n 1 --no-pager -o cat || true
