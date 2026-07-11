<div align="center">

# Anova Studio

**A boutique-wellness home for a physiotherapy clinic in Libiąż.**

Orthopedic and sports physiotherapy, corrective gymnastics, medical training, kinesiotaping and massage — presented the way a premium studio deserves.

[**anovastudio.pl**](https://anovastudio.pl) · Polish-language site

</div>

---

## What this is

A business-card website for a physiotherapy clinic, built as a small but complete production system: a public site the owner never has to touch, and a CMS panel where she manages every service, team member and gallery photo herself.

- **Public site** — offer & price list, team, gallery, cooperation offer for sports clubs and companies, contact with a live map. Server-rendered, fast on a phone, refreshed within a minute of any content change.
- **Admin panel** — Strapi CMS with Polish UI, role-separated accounts (developer keeps Super Admin, the owner works as Editor) and a media library tuned for photo-heavy content.

### Design

The visual language follows the studio's interior moodboard: warm beige plaster surfaces, dark "evening studio" espresso sections, and **light as the signature ornament** — glowing kicker rules, radial halos, an amber LED line bracketing the header and footer, and a subtle plaster-grain texture on dark sections. Display typography is the Fraunces serif; all theme tokens live in `frontend/src/app/globals.css`.

## Architecture

```
Strapi admin (browser)
        │
        ▼
Strapi 5 (Node) ──── PostgreSQL 16
        │
        ▼  REST API
Next.js 16 (server components, ISR 60 s)
        │
        ▼
nginx (TLS, reverse proxy) ──► https://anovastudio.pl
                              ├─ www.anovastudio.pl
                              └─ api.anovastudio.pl (Strapi API + admin)
```

The frontend fetches exclusively through `frontend/src/lib/strapi.ts`, which degrades to empty states when the CMS is unreachable — so CI builds and production cold starts never fail on missing content.

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16 (App Router, TypeScript, Turbopack), Tailwind CSS v4, Motion |
| CMS | Strapi 5 (TypeScript) |
| Database | PostgreSQL 16 |
| Proxy / TLS | nginx, Let's Encrypt (auto-renewal via webroot) |
| CI/CD | GitHub Actions → GHCR images → SSH deploy via Docker Compose |
| Hosting | Oracle Cloud Always Free (1 GB RAM — memory limits calibrated, 2 GB swap) |
| DNS | Cloudflare |

## Local development

```bash
docker compose up -d              # dev PostgreSQL
cd backend && npm run develop     # Strapi + admin → http://localhost:1337/admin
cd frontend && npm run dev        # Next.js → http://localhost:3000
```

Environment files: `backend/.env` (see `backend/.env.example`) and `frontend/.env.local` with `NEXT_PUBLIC_STRAPI_URL=http://localhost:1337`.

### Checks

```bash
cd frontend && npm run lint && npx tsc --noEmit && npm run build
cd backend && npm run build

# simulate CI (Strapi down — pages must build with empty states):
cd frontend && NEXT_PUBLIC_STRAPI_URL=http://localhost:9999 npm run build
```

## Releases & deployment

1. Merge to `main` with a bumped root `VERSION` file — path-filtered workflows lint, typecheck, build and push `ania-fizjo-frontend` / `ania-fizjo-backend` images to GHCR, tagged with that version.
2. Run the **Deploy** workflow (Actions → Deploy → Run workflow) — it ships the compose file and nginx config over SSH, ensures swap, pulls the pinned images, waits for container health checks and smoke-tests the public endpoints.

The production host is a 1 GB Oracle VM: container memory limits sum to ~830 MB by design (`deploy/docker-compose.prod.yml`), image variants and proxy timeouts are tuned so CMS photo uploads survive a single-OCPU CPU budget.

## Repository layout

```
frontend/   Next.js site (src/app — pages, src/components, src/lib)
backend/    Strapi CMS (content types under src/api/*)
deploy/     production compose, nginx.conf, swap setup
.github/    CI (per-app) + Deploy workflows
VERSION     single source of truth for image tags
```
