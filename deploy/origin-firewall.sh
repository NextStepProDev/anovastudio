#!/usr/bin/env bash
#
# origin-firewall.sh — porty strony (80, 443) odpowiadają tylko Cloudflare.
#
# Bez tego każdy, kto zna adres serwera, rozmawia z nginx wprost i omija
# wszystko, co Cloudflare robi przed nim: własne reguły blokujące skanery
# (`.env`, `.php`, …), reguły zarządzane, ochronę przed DDoS.
#
# Reguły siedzą we własnym łańcuchu ANOVA-ORIGIN, do którego skacze
# DOCKER-USER. Docker wystawia porty przez NAT i ścieżkę FORWARD, więc
# łańcuch INPUT (tam stoi REJECT z obrazu Oracle) tego ruchu nie widzi —
# DOCKER-USER to miejsce, które Docker zostawia na takie reguły. Dopasowanie:
#   * `--ctstate DNAT` — tylko połączenia, które Docker przekierował DO
#     kontenera. Własne wyjścia aplikacji na 443 też przechodzą przez
#     DOCKER-USER; w climbing blokada po samym porcie wieszała każde
#     wywołanie na zewnątrz (504). Ruch wychodzący to SNAT, nigdy DNAT.
#   * `--ctorigsrc` / `--ctorigdstport` — adres i port sprzed NAT, czyli
#     odwiedzający i port wystawiony na serwerze, a nie port kontenera.
# Ruch z samego serwera (`curl localhost`, certbot łączący się z Let's
# Encrypt) idzie przez OUTPUT, nie FORWARD, więc go to nie dotyczy. SSH to
# nie port Dockera — też nie. Ale SPRAWDZENIE domeny przez Let's Encrypt
# (HTTP-01 na port 80) przychodzi z zewnątrz: przejdzie tylko przez
# Cloudflare, więc po zmianach — `sudo certbot renew --dry-run`.
#
# Zakresy Cloudflare bierze z /etc/anova-origin-firewall/cloudflare-v4.txt,
# który setup-origin-firewall.sh wycina z linii `set_real_ip_from` w
# nginx.conf — jedna lista dla obu. Brak zakresu = odwiedzający obsługiwani
# przez tę lokalizację Cloudflare dostają „522 Connection timed out”.
#
# Można uruchamiać wielokrotnie (łańcuch budowany od nowa). Przy liście,
# która wygląda na uszkodzoną, nie rusza niczego — strona zamknięta dla
# Cloudflare to strona martwa dla wszystkich.
#
# Użycie: sudo bash origin-firewall.sh           (przy starcie robi to usługa systemd)
#         sudo bash origin-firewall.sh --remove  (zdejmuje reguły w całości)

set -euo pipefail

RANGES_FILE="/etc/anova-origin-firewall/cloudflare-v4.txt"
CHAIN="ANOVA-ORIGIN"
PORTS="80 443"
# Cloudflare publikuje 15 zakresów IPv4 (10.2026). Mniej niż 10 = lista
# ucięta albo źle wycięta — lepiej brak filtra niż strona zamknięta dla
# wszystkich. Ten sam próg w setup-origin-firewall.sh.
MIN_RANGES=10

if [[ "${EUID}" -ne 0 ]]; then
  echo "Wymaga roota: sudo bash origin-firewall.sh" >&2
  exit 1
fi

if [[ "${1:-}" == "--remove" ]]; then
  while iptables -D DOCKER-USER -j "${CHAIN}" 2>/dev/null; do :; done
  iptables -F "${CHAIN}" 2>/dev/null || true
  iptables -X "${CHAIN}" 2>/dev/null || true
  echo "==> Zapora originu zdjęta: porty 80/443 znów otwarte dla wszystkich."
  exit 0
fi

RANGES=()
while read -r line; do
  [[ -z "${line}" ]] && continue
  if [[ ! "${line}" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}/[0-9]{1,2}$ ]]; then
    echo "BŁĄD: to nie zakres IPv4 w ${RANGES_FILE}: ${line} — nic nie zmieniono." >&2
    exit 1
  fi
  RANGES+=("${line}")
done < <(cat "${RANGES_FILE}" 2>/dev/null || true)

if (( ${#RANGES[@]} < MIN_RANGES )); then
  echo "BŁĄD: za mało zakresów Cloudflare w ${RANGES_FILE}: ${#RANGES[@]}, powinno być co najmniej ${MIN_RANGES} — nic nie zmieniono." >&2
  exit 1
fi

# Przy starcie serwera usługa rusza zaraz po docker.service, który zakłada
# DOCKER-USER chwilę później.
for _ in $(seq 1 30); do
  iptables -L DOCKER-USER -n >/dev/null 2>&1 && break
  sleep 2
done
if ! iptables -L DOCKER-USER -n >/dev/null 2>&1; then
  echo "BŁĄD: brak łańcucha DOCKER-USER — czy Docker działa? Nic nie zmieniono." >&2
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

echo "==> Zapora originu: porty ${PORTS// /, } tylko z ${#RANGES[@]} zakresów Cloudflare."
