// 抓取已知的 Major 决赛 HLTV 比赛页（经 r.jina.ai 渲染）到本地缓存，供解析脚本使用。
import fs from 'node:fs'
import path from 'node:path'

const CACHE = path.join(process.env.TEMP || '/tmp', 'hltv-match-cache')

const MATCHES = {
  cologne2015: '2297514/envy-vs-fnatic-esl-one-cologne-2015',
  katowice2019: '2331081/ence-vs-astralis-iem-katowice-2019',
  berlin2019: '2335653/avangar-vs-astralis-starladder-major-berlin-2019',
  stockholm2021: '2352514/g2-vs-natus-vincere-pgl-major-stockholm-2021',
  antwerp2022: '2356169/faze-vs-natus-vincere-pgl-major-antwerp-2022',
  rio2022: '2359846/outsiders-vs-heroic-iem-rio-major-2022',
  paris2023: '2364292/gamerlegion-vs-vitality-blasttv-paris-major-2023',
  copenhagen2024: '2370727/faze-vs-natus-vincere-pgl-cs2-major-copenhagen-2024',
  shanghai2024: '2377735/spirit-vs-faze-perfect-world-shanghai-major-2024',
  austin2025: '2382619/vitality-vs-the-mongolz-blasttv-austin-major-2025',
  budapest2025: '2388130/faze-vs-vitality-starladder-budapest-major-2025',
  cologne2026: '2395002/falcons-vs-furia-iem-cologne-major-2026',
}

async function fetchOnce(id, slug) {
  const file = path.join(CACHE, `${id}.md`)
  if (fs.existsSync(file) && fs.statSync(file).size > 2000) {
    console.log(`[cache] ${id}`)
    return
  }
  const url = `https://r.jina.ai/https://www.hltv.org/matches/${slug}`
  const res = await fetch(url, { signal: AbortSignal.timeout(120000) })
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`)
  const text = await res.text()
  if (text.length < 2000) throw new Error(`${id}: too short (${text.length})`)
  fs.writeFileSync(file, text)
  console.log(`[ok] ${id} (${text.length} bytes)`)
}

async function main() {
  fs.mkdirSync(CACHE, { recursive: true })
  for (const [id, slug] of Object.entries(MATCHES)) {
    for (let attempt = 1; ; attempt++) {
      try {
        await fetchOnce(id, slug)
        break
      } catch (err) {
        console.error(`[fail] ${id}: ${err.message}`)
        if (attempt >= 3) break
        await new Promise((r) => setTimeout(r, 4000 * attempt))
      }
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
