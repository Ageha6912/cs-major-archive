// 抓取 2013-2018 老 Major 决赛 HLTV 比赛页（jina HTML 模式）
import fs from 'node:fs'
import path from 'node:path'

const CACHE = path.join(process.env.TEMP || '/tmp', 'hltv-html-cache')

const MATCHES = {
  dhw2013: '2279438/ninjas-in-pyjamas-vs-fnatic-dreamhack-winter-2013',
  katowice2014: '2290762/ninjas-in-pyjamas-vs-virtuspro-ems-one-katowice-2014',
  cologne2014: '2292382/fnatic-vs-ninjas-in-pyjamas-esl-one-cologne-2014',
  dhw2014: '2293638/ninjas-in-pyjamas-vs-ldlc-dreamhack-winter-2014',
  katowice2015: '2294629/fnatic-vs-ninjas-in-pyjamas-esl-one-katowice-2015',
  cluj2015: '2298989/envy-vs-natus-vincere-dreamhack-open-cluj-napoca-2015',
  columbus2016: '2301885/natus-vincere-vs-luminosity-mlg-columbus-2016',
  cologne2016: '2303403/sk-vs-liquid-esl-one-cologne-2016',
  atlanta2017: '2307548/astralis-vs-virtuspro-eleague-major-2017',
  krakow2017: '2312399/gambit-vs-immortals-pgl-major-krakow-2017',
  boston2018: '2318632/faze-vs-cloud9-eleague-major-2018',
  london2018: '2326427/natus-vincere-vs-astralis-faceit-major-2018',
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
