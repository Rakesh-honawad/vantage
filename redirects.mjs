import fs from 'node:fs'

/**
 * Reads data/redirects.csv and returns Next.js permanent redirects.
 * Plain paths become normal redirects. A path with ?key=value becomes a query-matched redirect.
 * Anything it cannot use safely is skipped with a warning, so one bad line never breaks the build.
 */
export function loadRedirects(file = new URL('./data/redirects.csv', import.meta.url)) {
  if (!fs.existsSync(file)) return []
  const out = []
  const seen = new Set()
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const [from, to] = line.split(',').map((s) => s.trim())
    const okDest = to && (to.startsWith('/') || to.startsWith('https://'))
    if (!from || !from.startsWith('/') || !okDest || /[:()*{}]/.test(from)) {
      console.warn(`redirects.csv: skipped "${line}"`)
      continue
    }
    const [path, query] = from.split('?')
    if (seen.has(from) || path === to) continue
    seen.add(from)
    if (query) {
      const has = [...new URLSearchParams(query)].map(([key, value]) => ({ type: 'query', key, value }))
      out.push({ source: path, has, destination: to, permanent: true })
    } else out.push({ source: path, destination: to, permanent: true })
  }
  const sources = new Set(out.map((r) => r.source))
  for (const r of out) if (sources.has(r.destination)) console.warn(`redirects.csv: chain ${r.source} -> ${r.destination}, which redirects again. Point it at the final page.`)
  return out
}
