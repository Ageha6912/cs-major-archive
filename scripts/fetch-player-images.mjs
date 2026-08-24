// 为 matchStats.json 中有 HLTV 选手 ID 的选手抓取定妆照并保存到 public/players/{id}.png
import fs from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.resolve('public/players')
const CACHE = path.join(process.env.TEMP || '/tmp', 'hltv-player-cache')
const MATCH_STATS = path.resolve('src/data/matchStats.json')

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

async function fetchPlayerPage(id, slug) {
  const file = path.join(CACHE, `${id}.html`)
  if (fs.existsSync(file) && fs.statSync(file).size > 20000) return fs.readFileSync(file, 'utf8')
  const url = `https://r.jina.ai/https://www.hltv.org/player/${id}/${slug}`
  const res = await fetch(url, {
    headers: { 'x-respond-with': 'html' },
    signal: AbortSignal.timeout(120000),
  })
  if (!res.ok) throw new Error(`player ${id}: HTTP ${res.status}`)
  const text = await res.text()
  fs.writeFileSync(file, text)
  return text
}

function extractOgImage(html) {
  const m = html.match(/<meta property="og:image" content="([^"]+)"/)
  if (!m) return null
  return m[1].replace(/&amp;/g, '&')
}

async function downloadAvatar(id, ogImage) {
  const out = path.join(OUT_DIR, `${id}.png`)
  if (fs.existsSync(out) && fs.statSync(out).size > 2000) return true
  const src = `https://wsrv.nl/?url=${encodeURIComponent(ogImage)}&w=160&h=160&fit=cover`
  const res = await fetch(src, { signal: AbortSignal.timeout(60000) })
  if (!res.ok) throw new Error(`img ${id}: HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 2000) throw new Error(`img ${id}: too small (${buf.length})`)
  fs.writeFileSync(out, buf)
  return true
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.mkdirSync(CACHE, { recursive: true })
  const stats = readJson(MATCH_STATS)
  const seen = new Map()
  for (const entry of Object.values(stats)) {
    const rows = Object.values(entry.stats ?? {}).flat()
    for (const p of rows) {
      if (p.hltvId && !seen.has(p.hltvId)) {
        seen.set(p.hltvId, p.hltvSlug || p.player.toLowerCase().replace(/[^a-z0-9-]/g, ''))
      }
    }
  }
  const ids = [...seen.keys()]
  console.log(`unique players: ${ids.length}`)
  const imgBy = new Map()
  for (const id of ids) {
    const slug = seen.get(id)
    for (let attempt = 1; ; attempt++) {
      try {
        const html = await fetchPlayerPage(id, slug)
        const og = extractOgImage(html)
        if (!og) {
          console.log(`[no-og] ${id} ${slug}`)
          break
        }
        await downloadAvatar(id, og)
        imgBy.set(id, `/players/${id}.png`)
        console.log(`[ok] ${id} ${slug} ${og.slice(0, 70)}`)
        break
      } catch (err) {
        console.error(`[fail] ${id}: ${err.message}`)
        if (attempt >= 3) break
        await new Promise((r) => setTimeout(r, 5000 * attempt))
      }
    }
  }

  // 回写 img 字段
  let updated = 0
  for (const entry of Object.values(stats)) {
    const rows = Object.values(entry.stats ?? {}).flat()
    for (const p of rows) {
      if (p.hltvId && imgBy.has(p.hltvId) && !p.img) {
        p.img = imgBy.get(p.hltvId)
        updated++
      }
    }
    for (const map of entry.maps ?? []) {
      for (const rows of Object.values(map.teams ?? {})) {
        for (const p of rows) {
          if (p.hltvId && imgBy.has(p.hltvId) && !p.img) {
            p.img = imgBy.get(p.hltvId)
            updated++
          }
        }
      }
    }
  }
  fs.writeFileSync(MATCH_STATS, JSON.stringify(stats, null, 1) + '\n')
  console.log(`updated rows: ${updated}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
