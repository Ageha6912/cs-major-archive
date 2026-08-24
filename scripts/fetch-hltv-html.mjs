// 用 r.jina.ai HTML 模式抓取决赛比赛页完整 HTML（含逐图统计表），缓存到 TEMP/hltv-html-cache
import fs from 'node:fs'
import path from 'node:path'

const CACHE = path.join(process.env.TEMP || '/tmp', 'hltv-html-cache')

const MATCHES = {
  cologne2015: '2297514/envy-vs-fnatic-esl-one-cologne-2015',
  katowice2019: '2331081/ence-vs-astralis-iem-katowice-2019',
  stockholm2021: '2352514/g2-vs-natus-vincere-pgl-major-stockholm-2021',
  antwerp2022: '2356169/faze-vs-natus-vincere-pgl-major-antwerp-2022',
  paris2023: '2364292/gamerlegion-vs-vitality-blasttv-paris-major-2023',
  austin2025: '2382619/vitality-vs-the-mongolz-blasttv-austin-major-2025',
  cologne2026: '2395002/furia-vs-falcons-iem-cologne-major-2026',
}

async function fetchOnce(id, slug) {
  const file = path.join(CACHE, `${id}.html`)
  if (fs.existsSync(file) && fs.statSync(file).size > 100000) {
    console.log(`[cache] ${id}`)
    return
  }
  const url = `https://r.jina.ai/https://www.hltv.org/matches/${slug}`
  const res = await fetch(url, {
    headers: { 'x-respond-with': 'html', 'x-no-cache': 'true' },
    signal: AbortSignal.timeout(180000),
  })
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`)
  const text = await res.text()
  if (text.length < 100000) throw new Error(`${id}: too short (${text.length})`)
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
        if (attempt >= 4) break
        await new Promise((r) => setTimeout(r, 8000 * attempt))
      }
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
