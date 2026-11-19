/**
 * Comments are written in English — everywhere in the repo: code, workflow step names, log
 * messages in scripts, deploy/ (nginx, compose, systemd, logrotate) and SVG files. Polish stays
 * only in what visitors and the owner read (site copy, panel labels) and in RESTORE.md.
 *
 * Until 2026-11-19 nothing said so, and about 700 lines of Polish comments sat next to
 * English ones, in the same files. A rule in CLAUDE.md alone has to be remembered on every
 * edit; this gate fails the PR instead. Run: `node .github/scripts/comment-language.mjs`.
 *
 * Detection is a heuristic on each comment line: quoted text ("…", „…", backticks) is
 * removed first, because English comments legitimately quote Polish UI strings. A line is
 * flagged when what remains has no common English word and either contains a Polish letter
 * or at least two common Polish words (with and without diacritics — some comments here
 * were written without them). A false alarm: reword the comment or quote the Polish text,
 * do not add an exception. The same rule guards next-step-pro-climbing (CommentLanguageTest).
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const POLISH = new Set(
  (
    'w z na do i się sie że ze jest nie dla przy oraz po od jako ten tego już juz też tez lub albo bez ' +
    'przez gdzie kiedy tak tylko gdy więc wiec bo ale czy jak żeby zeby musi być byc można mozna będzie ' +
    'bedzie który ktory która ktora które ktore jeśli jesli tutaj tym tej są sa brak'
  ).split(' '),
)
const ENGLISH = new Set(
  'the an and or of in on at by for with from as is are was be it this that not than but when if has have'.split(' '),
)
const POLISH_LETTER = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/
const QUOTED = /"[^"]*"|„[^”"]*[”"]|“[^”]*”|`[^`]*`|«[^»]*»/g

function looksPolish(text) {
  const unquoted = text.replace(QUOTED, ' ')
  const words = unquoted.toLowerCase().match(/(?<![\p{L}\d_-])[a-ząćęłńóśźż]+(?![\p{L}\d_-])/gu) ?? []
  if (words.some((w) => ENGLISH.has(w))) return false
  return words.filter((w) => POLISH.has(w)).length >= 2 || POLISH_LETTER.test(unquoted)
}

function syntaxOf(path) {
  const name = path.split('/').pop()
  if (/\.(ts|tsx|js|mjs|cjs|jsx|css)$/.test(name)) return ['c']
  if (name.endsWith('.svg')) return ['c', 'html'] // CSS comments inside <style>, plus <!-- -->
  if (name.endsWith('.html')) return ['html']
  if (
    /\.(ya?ml|conf|sh|service|toml)$/.test(name) ||
    name.startsWith('Dockerfile') ||
    name.startsWith('logrotate-') ||
    ['.env.example', '.gitignore', '.dockerignore'].includes(name)
  ) {
    return ['hash']
  }
  return []
}

function comments(source, syntax) {
  const lines = source.split('\n')
  const out = []
  if (syntax === 'html') {
    for (const m of source.matchAll(/<!--([\s\S]*?)-->/g)) {
      const first = source.slice(0, m.index).split('\n').length
      m[1].split('\n').forEach((part, i) => out.push([first + i, part]))
    }
    return out
  }
  let inBlock = false
  lines.forEach((line, i) => {
    const n = i + 1
    if (syntax === 'hash') {
      const m = line.match(/(^\s*#|\s#(?=\s|$))(.*)$/)
      if (m) out.push([n, m[2]])
      return
    }
    if (inBlock) {
      const end = line.indexOf('*/')
      out.push([n, end < 0 ? line : line.slice(0, end)])
      inBlock = end < 0
      return
    }
    const open = line.match(/(^|[\s{(])\/\*/)
    if (open) {
      const rest = line.slice(open.index + open[0].length)
      const end = rest.indexOf('*/')
      out.push([n, end < 0 ? rest : rest.slice(0, end)])
      inBlock = end < 0
      return
    }
    const lc = line.match(/(^|\s)\/\/(.*)$/)
    if (lc) out.push([n, lc[2]])
  })
  return out
}

const self = new URL(import.meta.url).pathname
if (process.argv.includes('--self-test')) {
  const cases = [
    [' Wgraj wynik do zakładki Security', true],
    [' Ustawiam swap, jesli nie jest aktywny', true],
    [' The heading says "Odzyskaj swobodę" on the page', false],
    [' Strapi — API + admin panel', false],
  ]
  const wrong = cases.filter(([text, want]) => looksPolish(text) !== want)
  for (const [text, want] of wrong) console.error(`self-test: expected ${want} for: ${text}`)
  process.exit(wrong.length ? 1 : 0)
}

const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean)
const offenders = []
for (const path of files) {
  if (self.endsWith(path)) continue // this file quotes Polish on purpose
  for (const syntax of syntaxOf(path)) {
    for (const [line, text] of comments(readFileSync(path, 'utf8'), syntax)) {
      if (looksPolish(text)) offenders.push(`${path}:${line}: ${text.trim()}`)
    }
  }
}
if (offenders.length) {
  console.error('Comments must be in English (rule: .github/scripts/comment-language.mjs). Polish found in:')
  for (const o of offenders) console.error(`  ${o}`)
  process.exit(1)
}
console.log(`comment language: ${files.length} tracked files checked, all comments in English`)
