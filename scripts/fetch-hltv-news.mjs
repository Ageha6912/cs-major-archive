// 抓取 24 届 Major 决赛 HLTV 赛报（经 r.jina.ai 渲染）到本地缓存，供解析脚本使用。
import fs from 'node:fs'
import path from 'node:path'

const CACHE = path.join(process.env.TEMP || '/tmp', 'hltv-news-cache')

const NEWS = {
  dhw2013: '11814/fnatic-win-dreamhack-winter-2013',
  katowice2014: '12212/virtuspro-win-ems-one-katowice',
  cologne2014: '13070/nip-win-esl-one-cologne-2014',
  dhw2014: '13737/ldlc-beat-nip-to-win-dh-winter',
  katowice2015: '14496/fnatic-beat-nip-to-win-katowice-major',
  cologne2015: '15782/fnatic-won_cologne2015',
  cluj2015: '16287/envyus-win-csgos-seventh-major',
  columbus2016: '17479/luminosity-win-mlg-columbus-2016',
  cologne2016: '18250/sk-beat-liquid-to-win-cologne-major',
  atlanta2017: '19762/astralis-win-the-eleague-major',
  krakow2017: '21128/gambit-defeat-immortals-to-win-pgl-major',
  boston2018: '22637/cloud9-beat-faze-to-win-eleague-major-boston',
  london2018: '24870/astralis-take-down-navi-2-0-to-win-faceit-major',
  katowice2019: '26213/astralis-beat-ence-2-0-to-win-iem-katowice-and-secure-third-major-crown',
  berlin2019: '27803/astralis-hammer-avangar-to-win-starladder-major',
  stockholm2021: '32761/live-navi-g2-set-to-clash-in-pgl-major-stockholm-grand-final',
  antwerp2022: '33882/faze-defeat-navi-2-0-to-win-pgl-major-antwerp',
  rio2022: '35069/outsiders-defeat-heroic-2-0-to-win-iem-rio-major',
  paris2023: '36340/vitality-romp-to-victory-on-home-soil-in-last-ever-csgo-major',
  copenhagen2024: '38666/navi-beat-faze-to-win-pgl-major-copenhagen',
  shanghai2024: '40565/spirit-defeat-faze-2-1-to-win-shanghai-major',
  austin2025: '42036/vitality-best-the-mongolz-to-win-the-austin-major',
  budapest2025: '43449/vitality-beat-faze-3-1-to-become-back-to-back-major-champions-in-budapest',
  cologne2026: '44972/falcons-sweep-furia-to-win-iem-cologne-major',
}

async function fetchOnce(id, slug) {
  const file = path.join(CACHE, `${id}.md`)
  if (fs.existsSync(file) && fs.statSync(file).size > 2000) {
    console.log(`[cache] ${id}`)
    return
  }
  const url = `https://r.jina.ai/https://www.hltv.org/news/${slug}`
  const res = await fetch(url, {
    headers: { 'x-respond-with': 'markdown' },
    signal: AbortSignal.timeout(90000),
  })
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`)
  const text = await res.text()
  if (text.length < 2000) throw new Error(`${id}: too short (${text.length})`)
  fs.writeFileSync(file, text)
  console.log(`[ok] ${id} (${text.length} bytes)`)
}

async function main() {
  fs.mkdirSync(CACHE, { recursive: true })
  const entries = Object.entries(NEWS)
  for (let i = 0; i < entries.length; i++) {
    const [id, slug] = entries[i]
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
