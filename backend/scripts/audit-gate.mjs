/**
 * The blocking `npm audit` gate for the backend (CI, and `npm run audit` locally):
 * production dependencies, high and critical — minus the advisories listed below.
 *
 * Until 2026-11-19 the backend audit ran with `continue-on-error`, so it guarded
 * nothing: 30 high advisories in Strapi's tree sat there unnoticed. `npm audit` alone
 * knows only "all or nothing", hence this list. Every entry must say why it cannot be
 * reached in the running CMS and WHEN to remove it. An entry that no longer matches any
 * finding fails the gate too (STALE), so a fixed advisory cannot stay excused.
 *
 * Same script as in abcwspinania (web/scripts/audit-gate.mjs).
 */
import { execFileSync } from 'node:child_process'

const ACCEPTED = {
  // zod 3: memory exhaustion when validating oversized constrained collections.
  // Strapi's own zod 4 is patched through `overrides` (zod@4.4.3 → 4.6.7); zod 3 is
  // left only under koa-body 6 and koa-session 7, and both use it solely to validate
  // their OWN options, once, at startup (`KoaBodyMiddlewareOptionsSchema.parse(options)`,
  // `SessionOptions.parse(options)`) — never request data. The fix exists only in zod 4,
  // a major those packages do not accept. Remove when `npm ls zod` shows no 3.x.
  'GHSA-mrhx-c7xc-m3w5': 'zod 3 — only koa-body/koa-session options, never request data',
}

const BLOCKING = new Set(['high', 'critical'])

let report
try {
  report = execFileSync('npm', ['audit', '--omit=dev', '--json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
} catch (error) {
  // npm audit exits 1 whenever it finds anything; the JSON is still on stdout.
  report = error.stdout
}
const parsed = JSON.parse(report)
// Registry unreachable: npm prints `{ "error": … }` and no findings. Without this check
// every accepted entry would show as STALE — a red gate telling you to delete the
// exception instead of to retry.
if (parsed.error || !parsed.vulnerabilities) {
  console.error('npm audit did not run:', parsed.message || parsed.error?.summary || report)
  process.exit(1)
}

const advisories = new Map()
for (const entry of Object.values(parsed.vulnerabilities)) {
  for (const via of entry.via) {
    if (typeof via !== 'object') continue // "vulnerable through another package"
    const id = via.url?.split('/').pop() ?? `${via.name}#${via.source}`
    advisories.set(id, { name: via.name, severity: via.severity, title: via.title, url: via.url })
  }
}

const blocking = [...advisories].filter(([id, a]) => BLOCKING.has(a.severity) && !ACCEPTED[id])
const stale = Object.keys(ACCEPTED).filter((id) => !advisories.has(id))

for (const [id, reason] of Object.entries(ACCEPTED)) {
  if (advisories.has(id)) console.log(`accepted  ${id}  ${reason}`)
}
for (const [, a] of blocking) {
  console.error(`BLOCKING  ${a.severity}  ${a.name}: ${a.title}\n          ${a.url}`)
}
for (const id of stale) {
  console.error(`STALE     ${id} is no longer reported — remove it from ACCEPTED in scripts/audit-gate.mjs`)
}

if (blocking.length || stale.length) process.exit(1)
console.log(`npm audit gate passed (${advisories.size} advisories, none blocking)`)
