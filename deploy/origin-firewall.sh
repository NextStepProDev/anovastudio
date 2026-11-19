#!/usr/bin/env bash
#
# origin-firewall.sh — the site's ports (80, 443) answer Cloudflare only.
#
# Without it anyone who knows the server's address talks to nginx directly and bypasses
# everything Cloudflare does in front of it: our own rules blocking scanners (`.env`,
# `.php`, …), managed rules, DDoS protection.
#
# The rules sit in their own ANOVA-ORIGIN chain, which DOCKER-USER jumps to. Docker
# publishes ports through NAT and the FORWARD path, so the INPUT chain (where the Oracle
# image's REJECT sits) does not see this traffic — DOCKER-USER is the place Docker leaves
# for such rules. Matching:
#   * `--ctstate DNAT` — only connections Docker redirected TO a container. The
#     application's own outgoing calls on 443 pass through DOCKER-USER too; in climbing a
#     block by port alone hung every outbound call (504). Outgoing traffic is SNAT,
#     never DNAT.
#   * `--ctorigsrc` / `--ctorigdstport` — the address and port before NAT, i.e. the
#     visitor and the port published on the server, not the container's port.
# Traffic from the server itself (`curl localhost`, certbot talking to Let's Encrypt)
# goes through OUTPUT, not FORWARD, so it is unaffected. SSH is not a Docker port —
# unaffected too. But Let's Encrypt's domain CHECK (HTTP-01 on port 80) comes from
# outside: it gets through only via Cloudflare, so after changes — `sudo certbot renew
# --dry-run`.
#
# The Cloudflare ranges come from /etc/anova-origin-firewall/cloudflare-v4.txt, which
# setup-origin-firewall.sh cuts out of the `set_real_ip_from` lines in nginx.conf — one
# list for both. A missing range = visitors served by that Cloudflare location get
# "522 Connection timed out".
#
# Can be run repeatedly (the chain is rebuilt from scratch). With a list that looks
# damaged it touches nothing — a site closed to Cloudflare is a site dead for everyone.
#
# Usage: sudo bash origin-firewall.sh           (the systemd service does this at boot)
#        sudo bash origin-firewall.sh --remove  (removes the rules entirely)

set -euo pipefail

RANGES_FILE="/etc/anova-origin-firewall/cloudflare-v4.txt"
CHAIN="ANOVA-ORIGIN"
PORTS="80 443"
# Cloudflare publishes 15 IPv4 ranges (10.2026). Fewer than 10 = the list is truncated
# or badly cut — better no filter than a site closed to everyone. The same threshold is
# in setup-origin-firewall.sh.
MIN_RANGES=10

if [[ "${EUID}" -ne 0 ]]; then
  echo "Wymaga roota: sudo bash origin-firewall.sh" >&2
  exit 1
fi

if [[ "${1:-}" == "--remove" ]]; then
  while iptables -D DOCKER-USER -j "${CHAIN}" 2>/dev/null; do :; done
  iptables -F "${CHAIN}" 2>/dev/null || true
  iptables -X "${CHAIN}" 2>/dev/null || true
  echo "==> Origin firewall removed: ports 80/443 open to everyone again."
  exit 0
fi

RANGES=()
while read -r line; do
  [[ -z "${line}" ]] && continue
  if [[ ! "${line}" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}/[0-9]{1,2}$ ]]; then
    echo "ERROR: not an IPv4 range in ${RANGES_FILE}: ${line} — nothing changed." >&2
    exit 1
  fi
  RANGES+=("${line}")
done < <(cat "${RANGES_FILE}" 2>/dev/null || true)

if (( ${#RANGES[@]} < MIN_RANGES )); then
  echo "ERROR: too few Cloudflare ranges in ${RANGES_FILE}: ${#RANGES[@]}, should be at least ${MIN_RANGES} — nothing changed." >&2
  exit 1
fi

# At server boot the service starts right after docker.service, which creates
# DOCKER-USER a moment later.
for _ in $(seq 1 30); do
  iptables -L DOCKER-USER -n >/dev/null 2>&1 && break
  sleep 2
done
if ! iptables -L DOCKER-USER -n >/dev/null 2>&1; then
  echo "ERROR: no DOCKER-USER chain — is Docker running? Nothing changed." >&2
  exit 1
fi

iptables -N "${CHAIN}" 2>/dev/null || true
iptables -F "${CHAIN}"
for port in ${PORTS}; do
  for range in "${RANGES[@]}"; do
    iptables -A "${CHAIN}" -p tcp -m conntrack --ctstate DNAT --ctdir ORIGINAL \
      --ctorigsrc "${range}" --ctorigdstport "${port}" -j RETURN
  done
  iptables -A "${CHAIN}" -p tcp -m conntrack --ctstate DNAT --ctdir ORIGINAL \
    --ctorigdstport "${port}" -j DROP
done

iptables -C DOCKER-USER -j "${CHAIN}" 2>/dev/null || iptables -I DOCKER-USER 1 -j "${CHAIN}"

echo "==> Origin firewall: ports ${PORTS// /, } only from ${#RANGES[@]} Cloudflare ranges."
