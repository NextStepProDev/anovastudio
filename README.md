<div align="center">

# Anova Studio

**A boutique-wellness home for a physiotherapy clinic in Libiąż.**

Orthopedic, sports and dental physiotherapy, massage, medical training and kinesiotaping — presented the way a premium studio deserves.

[**anovastudio.pl**](https://anovastudio.pl) · Polish-language site

</div>

---

## What this is

The complete online presence of a physiotherapy clinic: a fast, elegant public website paired with a content panel the owner manages entirely on her own — the team and the photo gallery — with every change appearing on the site within a minute. No developer needed for day-to-day content work.

This is a real production system, not a static landing page: the site renders from a headless CMS, serves over HTTPS on its own infrastructure, and keeps working gracefully even while content is still being filled in.

## Who it's for

| Audience | What they get |
|----------|---------------|
| **Patient** | A clear picture of the offer and prices, the people behind the studio, and one-tap contact — phone, e-mail, directions on a live map. |
| **Owner** | A friendly admin panel (in Polish) to manage team bios and photo galleries — safely separated from technical settings. |
| **The clinic** | A professional, trustworthy presence in search results and a brand experience consistent with the studio's interior. |

## The offer

Four services, each with its own price, session length, and the conditions it actually addresses — laid out as an editorial "treatment menu" rather than a price table:

| Service | Price | Session | Covers |
|---------|-------|---------|--------|
| **Physiotherapy** | 200 zł | 55 min | Orthopedic (spine, shoulder, knee, post-operative rehab), sports (injuries, return to sport, ACL), and **dental** — TMJ pain, bruxism, tension headaches |
| **Massage** | 180 zł | 55 min | Therapeutic deep-tissue, relaxation, lymphatic drainage, sports, and lifting massage |
| **Training** | 180 zł | 55 min | Medical, functional and personal training, plus corrective gymnastics — always preceded by a functional assessment |
| **Kinesiotaping** | 50 zł | 10 min | Muscle and joint pain, swelling, sports injuries, rehabilitation support |

Every service belongs to a location: the whole offer runs in **Libiąż** today, and a **Katowice** tab is already in place, marked *coming soon*. A dedicated cooperation page addresses sports clubs, companies and organized groups.

## The look

The design translates the studio's interior moodboard into the web: warm beige plaster surfaces layered from three shades of the same sand, and **light as the signature ornament** — a glowing amber line bracketing the page, soft halos behind headlines and photography, a sunlit wall raking across page headers, the studio's mark embossed into the surface, and a delicate grain that reads like decorative plaster. Headlines are set in a serif with boutique-spa character; the whole palette avoids clinical white in favor of warmth and calm.

## Under the hood

A modern, self-hosted stack — a headless CMS feeding a server-rendered site behind its own TLS-terminating reverse proxy, shipped through an automated build-and-deploy pipeline and running comfortably on a single free-tier cloud machine.

Two design decisions worth naming:

- **A CMS outage costs a section, not the site.** The content layer falls back to empty state by design, so every page still renders — which is also why the production build succeeds with no backend running at all.
- **Search engines see the whole page.** Content tucked behind expandable panels stays in the served HTML instead of appearing on click, and every page ships its own canonical URL, social card, and local-business structured data.

Built and operated by [NextStepProDev](https://github.com/NextStepProDev).
