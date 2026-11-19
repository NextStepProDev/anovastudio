#!/usr/bin/env bash
#
# setup-origin-firewall.sh — installs origin-firewall.sh on the server and applies it
# right away.
#
# deploy.yml runs it on every deployment, next to setup-swap.sh, so a change to the rules
# or to the Cloudflare list in nginx.conf reaches the server with the next deploy. Can be
# run repeatedly.
#
# Installs: /usr/local/sbin/anova-origin-firewall.sh,
#           /etc/systemd/system/anova-origin-firewall.service (enabled),
#           /etc/anova-origin-firewall/cloudflare-v4.txt (from nginx.conf).
#
# Usage: sudo bash setup-origin-firewall.sh <directory with origin-firewall.*> <nginx.conf>

set -euo pipefail

SRC="${1:?usage: setup-origin-firewall.sh <directory> <nginx.conf>}"
NGINX_CONF="${2:?usage: setup-origin-firewall.sh <directory> <nginx.conf>}"
RANGES_DIR="/etc/anova-origin-firewall"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Wymaga roota: sudo bash setup-origin-firewall.sh <katalog> <nginx.conf>" >&2
  exit 1
fi

echo "==> Zapora originu: instalacja z ${SRC}"

# 1. Cloudflare's IPv4 ranges — the same list nginx trusts when working out the
#    visitor's real address. IPv6 skipped: the ports are published on IPv4 only
#    (docker-compose.prod.yml).
#    A list that is too short leaves the previous file: the firewall would reject it
#    anyway, but after a server restart it would have nothing to apply.
RANGES=$(sed -nE 's/^[[:space:]]*set_real_ip_from[[:space:]]+([0-9.]+\/[0-9]+);.*/\1/p' "${NGINX_CONF}")
COUNT=$(grep -c . <<<"${RANGES}" || true)
if (( COUNT < 10 )); then
  echo "ERROR: too few Cloudflare IPv4 ranges in ${NGINX_CONF}: ${COUNT} — firewall unchanged." >&2
  exit 1
fi
mkdir -p "${RANGES_DIR}"
printf '%s\n' "${RANGES}" > "${RANGES_DIR}/cloudflare-v4.txt.new"
mv "${RANGES_DIR}/cloudflare-v4.txt.new" "${RANGES_DIR}/cloudflare-v4.txt"

# 2. The script and the service that applies it on every server boot.
install -m 0755 "${SRC}/origin-firewall.sh" /usr/local/sbin/anova-origin-firewall.sh
install -m 0644 "${SRC}/origin-firewall.service" /etc/systemd/system/anova-origin-firewall.service
systemctl daemon-reload
systemctl enable anova-origin-firewall.service >/dev/null 2>&1

# 3. Apply right away. The script rejects a damaged list by itself and changes nothing;
#    the reason goes to the journal, so we show it here, in the deploy log.
if ! systemctl restart anova-origin-firewall.service; then
  journalctl -u anova-origin-firewall.service -n 5 --no-pager -o cat || true
  exit 1
fi
journalctl -u anova-origin-firewall.service -n 1 --no-pager -o cat || true
