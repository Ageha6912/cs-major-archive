// 解析本地缓存的 HLTV 新闻稿与比赛页，生成 src/data/matchStats.json
import fs from 'node:fs'
import path from 'node:path'

const NEWS_CACHE = path.join(process.env.TEMP || '/tmp', 'hltv-news-cache')
const MATCH_CACHE = path.join(process.env.TEMP || '/tmp', 'hltv-match-cache')
const HTML_CACHE = path.join(process.env.TEMP || '/tmp', 'hltv-html-cache')
const OUT = path.resolve('src/data/matchStats.json')

const NEWS_SOURCES = {
  dhw2013: 'https://www.hltv.org/news/11814/fnatic-win-dreamhack-winter-2013',
  katowice2014: 'https://www.hltv.org/news/12212/virtuspro-win-ems-one-katowice',
  cologne2014: 'https://www.hltv.org/news/13070/nip-win-esl-one-cologne-2014',
  dhw2014: 'https://www.hltv.org/news/13737/ldlc-beat-nip-to-win-dh-winter',
  katowice2015: 'https://www.hltv.org/news/14496/fnatic-beat-nip-to-win-katowice-major',
  cologne2015: 'https://www.hltv.org/news/15782/fnatic-won_cologne2015',
  cluj2015: 'https://www.hltv.org/news/16287/envyus-win-csgos-seventh-major',
  columbus2016: 'https://www.hltv.org/news/17479/luminosity-win-mlg-columbus-2016',
  cologne2016: 'https://www.hltv.org/news/18250/sk-beat-liquid-to-win-cologne-major',
  atlanta2017: 'https://www.hltv.org/news/19762/astralis-win-the-eleague-major',
  krakow2017: 'https://www.hltv.org/news/21128/gambit-defeat-immortals-to-win-pgl-major',
  boston2018: 'https://www.hltv.org/news/22637/cloud9-beat-faze-to-win-eleague-major-boston',
  london2018: 'https://www.hltv.org/news/24870/astralis-take-down-navi-2-0-to-win-faceit-major',
  katowice2019: 'https://www.hltv.org/news/26213/astralis-beat-ence-2-0-to-win-iem-katowice-and-secure-third-major-crown',
  berlin2019: 'https://www.hltv.org/news/27803/astralis-hammer-avangar-to-win-starladder-major',
  stockholm2021: 'https://www.hltv.org/news/32761/navi-win-pgl-major-stockholm-over-g2-make-history-by-going-undefeated',
  antwerp2022: 'https://www.hltv.org/news/33882/faze-defeat-navi-2-0-to-win-pgl-major-antwerp',
  rio2022: 'https://www.hltv.org/news/35069/outsiders-defeat-heroic-2-0-to-win-iem-rio-major',
  paris2023: 'https://www.hltv.org/news/36340/vitality-romp-to-victory-on-home-soil-in-last-ever-csgo-major',
  copenhagen2024: 'https://www.hltv.org/news/38666/navi-beat-faze-to-win-pgl-major-copenhagen',
  shanghai2024: 'https://www.hltv.org/news/40565/spirit-defeat-faze-2-1-to-win-shanghai-major',
  austin2025: 'https://www.hltv.org/news/42036/vitality-best-the-mongolz-to-win-the-austin-major',
  budapest2025: 'https://www.hltv.org/news/43449/vitality-beat-faze-3-1-to-become-back-to-back-major-champions-in-budapest',
  cologne2026: 'https://www.hltv.org/news/44972/falcons-sweep-furia-to-win-iem-cologne-major',
}

const MATCH_SOURCES = {
  dhw2013: 'https://www.hltv.org/matches/2279438/ninjas-in-pyjamas-vs-fnatic-dreamhack-winter-2013',
  katowice2014: 'https://www.hltv.org/matches/2290762/ninjas-in-pyjamas-vs-virtuspro-ems-one-katowice-2014',
  cologne2014: 'https://www.hltv.org/matches/2292382/fnatic-vs-ninjas-in-pyjamas-esl-one-cologne-2014',
  dhw2014: 'https://www.hltv.org/matches/2293638/ninjas-in-pyjamas-vs-ldlc-dreamhack-winter-2014',
  katowice2015: 'https://www.hltv.org/matches/2294629/fnatic-vs-ninjas-in-pyjamas-esl-one-katowice-2015',
  cluj2015: 'https://www.hltv.org/matches/2298989/envy-vs-natus-vincere-dreamhack-open-cluj-napoca-2015',
  columbus2016: 'https://www.hltv.org/matches/2301885/natus-vincere-vs-luminosity-mlg-columbus-2016',
  cologne2016: 'https://www.hltv.org/matches/2303403/sk-vs-liquid-esl-one-cologne-2016',
  atlanta2017: 'https://www.hltv.org/matches/2307548/astralis-vs-virtuspro-eleague-major-2017',
  krakow2017: 'https://www.hltv.org/matches/2312399/gambit-vs-immortals-pgl-major-krakow-2017',
  boston2018: 'https://www.hltv.org/matches/2318632/faze-vs-cloud9-eleague-major-2018',
  london2018: 'https://www.hltv.org/matches/2326427/natus-vincere-vs-astralis-faceit-major-2018',
  cologne2015: 'https://www.hltv.org/matches/2297514/envy-vs-fnatic-esl-one-cologne-2015',
  katowice2019: 'https://www.hltv.org/matches/2331081/ence-vs-astralis-iem-katowice-2019',
  berlin2019: 'https://www.hltv.org/matches/2335653/avangar-vs-astralis-starladder-major-berlin-2019',
  stockholm2021: 'https://www.hltv.org/matches/2352514/g2-vs-natus-vincere-pgl-major-stockholm-2021',
  antwerp2022: 'https://www.hltv.org/matches/2356169/faze-vs-natus-vincere-pgl-major-antwerp-2022',
  rio2022: 'https://www.hltv.org/matches/2359846/outsiders-vs-heroic-iem-rio-major-2022',
  paris2023: 'https://www.hltv.org/matches/2364292/gamerlegion-vs-vitality-blasttv-paris-major-2023',
  copenhagen2024: 'https://www.hltv.org/matches/2370727/faze-vs-natus-vincere-pgl-cs2-major-copenhagen-2024',
  shanghai2024: 'https://www.hltv.org/matches/2377735/spirit-vs-faze-perfect-world-shanghai-major-2024',
  austin2025: 'https://www.hltv.org/matches/2382619/vitality-vs-the-mongolz-blasttv-austin-major-2025',
  budapest2025: 'https://www.hltv.org/matches/2388130/faze-vs-vitality-starladder-budapest-major-2025',
  cologne2026: 'https://www.hltv.org/matches/2395002/falcons-vs-furia-iem-cologne-major-2026',
}

function read(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
}

function nickOf(real) {
  const m = real.match(/'([^']+)'/)
  return m ? m[1] : real.trim()
}

function norm(name) {
  return name
    .trim()
    .replace(/\u00a0/g, ' ')
    .replace(/`/g, '')
}

// ---------- 旧式纯文本表 ----------
// 表头: Team\tK-D\t+/-（或 Swing）\tADR\tKAST\tRating
// 选手: 姓名行 + 数据行（制表符开头）
function parsePlain(text) {
  const lines = text.split(/\r?\n/)
  const teams = []
  let current = null
  let pendingName = null
  let prevText = null
  const headerRe =
    /^(?:\t+\s*)?(?:([^\t]+?)\s*\t\s*)?K\s*-\s*D\s*\t\s*(?:Swing|\+\/\-|\+\/-)\s*\t\s*(?:ADR\s*\t\s*KAST\s*\t\s*)?Rating/i
  const statRe =
    /^\t\s*(\d+)\s*-\s*(\d+)\s*([+-]?[\d.]+%?)\s*(?:([-\d.]+)\s*([-\d.]+%?)\s*)?([\d.]+)\s*$/
  const nameRe = /^([A-Za-zÀ-ž][^'\r\n]*?'[^'\r\n]*?'[^'\r\n]*?)\s*$/

  for (const raw of lines) {
    const line = raw.replace(/\r/g, '')
    const h = line.match(headerRe)
    if (h) {
      const team = h[1] !== undefined && h[1] !== '' ? h[1] : prevText
      if (team) {
        current = { team: norm(team), players: [] }
        teams.push(current)
      }
      prevText = null
      pendingName = null
      continue
    }
    const trimmed = line.trim()
    if (trimmed) prevText = trimmed
    if (!current) continue
    if (line !== trimmed && pendingName) {
      const s = line.match(statRe)
      if (s) {
        const [, k, d, diff, adr, kast, rating] = s
        current.players.push({
          player: nickOf(pendingName),
          real: pendingName,
          k: Number(k),
          d: Number(d),
          diff: Number(diff.replace('%', '')),
          swing: diff.includes('%') ? diff : null,
          adr: adr === undefined || adr === '-' ? null : Number(adr),
          kast: kast === undefined || kast === '-' ? null : Number(kast.replace('%', '')),
          rating: Number(rating),
        })
        pendingName = null
        continue
      }
    }
    const n = line.match(nameRe)
    if (n) pendingName = norm(n[1])
  }
  return teams.filter((t) => t.players.length > 0)
}

// ---------- 行内大表格（2019 后的比赛页） ----------
// 表头: ![logo][Team](team-url)K-D eK-eD Swing ADR eADR KAST eKAST Rating
// 数据: ![flag][Real 'nick' nick](player-url)43-39 45-38+3.61%85.1 88.6 71.7%73.7%1.32
function parseInline(text) {
  const lines = text.split(/\r?\n/)
  const tables = []
  let current = null
  const headerRe = /\[([^\]]+)\]\(https:\/\/www\.hltv\.org\/team\/\d+[^)]*\)K-D/
  const rowRe =
    /\[([^\]]+)\]\(https:\/\/www\.hltv\.org\/player\/\d+[^)]*\)(\d+)-(\d+)\s+(?:(?:(\d+)-(\d+))|null-null)\s*([+-]?[\d.]+%?)\s*([\d.]+)\s+([\d.]+)\s+([\d.]+%)\s*([\d.]+%)([\d.]+)\s*$/

  for (const raw of lines) {
    const line = raw.trimEnd()
    const h = line.match(headerRe)
    if (h) {
      current = { team: norm(h[1]), rows: [] }
      tables.push(current)
      continue
    }
    if (!current) continue
    const r = line.match(rowRe)
    if (r) {
      const [, real, k, d, ek, ed, swing, adr, eadr, kast, ekast, rating] = r
      const idMatch = line.match(/player\/(\d+)\/([a-z0-9-]+)/)
      current.rows.push({
        player: nickOf(real),
        real,
        hltvId: idMatch ? Number(idMatch[1]) : null,
        hltvSlug: idMatch ? idMatch[2] : null,
        k: Number(k),
        d: Number(d),
        ek: ek ? Number(ek) : null,
        ed: ed ? Number(ed) : null,
        diff: Number(swing.replace('%', '')),
        swing: swing.includes('%') ? swing : null,
        adr: adr === '0.0' && !ek ? null : Number(adr),
        eadr: eadr === '0.0' && !ek ? null : Number(eadr),
        kast: Number(kast.replace('%', '')),
        ekast: ek ? Number(ekast.replace('%', '')) : null,
        rating: Number(rating),
      })
    }
  }
  return tables.filter((t) => t.rows.length === 5)
}

function parseH2H(text) {
  const idx = text.indexOf('Head to head')
  if (idx < 0) return null
  const section = text.slice(idx, idx + 4000)
  const m = section.match(/(\d+)\s*\n\s*Wins\s*\n\s*(\d+)\s*\n\s*Overtimes\s*\n\s*(\d+)\s*\n\s*Wins/)
  if (!m) return null
  return { wins: [Number(m[1]), Number(m[3])], overtimes: Number(m[2]) }
}

const MAPS_ALIAS = {
  Dust2: 'Dust II',
  DustII: 'Dust II',
  de_dust2: 'Dust II',
}

function normMap(name) {
  return MAPS_ALIAS[name.trim()] || name.trim()
}

// 按比赛页表格顺序分组：每组 6 张表 = 队伍A(Both,T,CT) + 队伍B(Both,T,CT)
function buildFromMatch(majorId) {
  const file = path.join(MATCH_CACHE, `${majorId}.md`)
  const text = read(file)
  if (!text) return null
  const tables = parseInline(text)
  const plain = parsePlain(text)
  const h2h = parseH2H(text)
  if (process.env.DEBUG) {
    console.log(`  [${majorId}] inline tables=${tables.length} plain teams=${plain.length} h2h=${h2h ? 'y' : 'n'}`)
    if (tables.length)
      console.log('    teams:', tables.map((t) => `${t.team}(${t.rows.length})[${t.rows[0]?.player}]`).join(', '))
    if (plain.length) console.log('    plain:', plain.map((t) => `${t.team}(${t.players.length})`).join(', '))
  }

  if (tables.length > 0) {
    const chunkSize = 6
    const chunks = []
    for (let i = 0; i + chunkSize <= tables.length; i += chunkSize) chunks.push(tables.slice(i, i + chunkSize))
    if (chunks.length === 0) return null
    const validChunks = chunks.filter(
      (chunk) =>
        chunk[0] &&
        chunk[0].team === chunk[1].team &&
        chunk[0].team === chunk[2].team &&
        chunk[3].team === chunk[4].team &&
        chunk[3].team === chunk[5].team &&
        chunk[0].team !== chunk[3].team,
    )
    chunks.length = 0
    chunks.push(...validChunks)
    if (chunks.length === 0) return null
    const allChunk = chunks[0]
    const teamA = allChunk[0].team
    const teamB = allChunk[3].team
    const stats = {
      [teamA]: allChunk[0].rows.map(stripInline),
      [teamB]: allChunk[3].rows.map(stripInline),
    }
    const maps = chunks.slice(1).map((chunk, i) => ({
      map: `map${i + 1}`,
      teams: {
        [chunk[0].team]: chunk[0].rows.map(stripInline),
        [chunk[3].team]: chunk[3].rows.map(stripInline),
      },
    }))
    return { stats, maps, h2h }
  }

  if (plain.length > 0) {
    const stats = {}
    for (const t of plain) stats[t.team] = t.players.map(stripPlain)
    return { stats, maps: [], h2h }
  }
  return h2h ? { h2h } : null
}

// ---------- 完整 HTML 比赛页（jina HTML 模式） ----------
// 每个 stats-content 区块含两支队伍的 totalstats（Both）表；2015-2022 为 +/- 列，2024+ 为 Swing 列
function parseMatchHtml(text) {
  const parts = text.split(/<div class="stats-content" id="([^"]+)-content">/)
  const sections = []
  for (let i = 1; i < parts.length; i += 2) {
    const id = parts[i]
    const content = parts[i + 1]
    const tables = []
    for (const m of content.matchAll(/<table class="table totalstats">([\s\S]*?)<\/table>/g)) {
      const table = m[1]
      const teamM = table.match(/class="teamName team">([^<]+)</)
      const rows = []
      for (const rm of table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)) {
        const row = rm[1]
        if (row.includes('header-row')) continue
        const player = row.match(/\/player\/(\d+)\/([a-z0-9-]+)[^>]*>[\s\S]*?<span class="player-nick">([^<]+)<\/span>/)
        const realM = row.match(/statsPlayerName text-ellipsis">([\s\S]*?)<\/div>/)
        const kd = row.match(/class="kd text-center traditional-data">(\d+)-(\d+)/)
        const swing = row.match(/class="roundSwing[^"]*">\s*(?:<span[^>]*>)?([+-]?[\d.]+%)/)
        const pm = row.match(/class="plus-minus[^"]*">\s*(?:<span[^>]*>)?([+-]?\d+)/)
        const adr = row.match(/class="adr text-center traditional-data">([\d.]+)/)
        const kast = row.match(/class="kast text-center traditional-data">([\d.]+)%/)
        const rating = row.match(/class="rating[^"]*">([\d.]+)/)
        if (!player || !kd) continue
        const swingVal = swing ? swing[1] : null
        rows.push({
          player: player[3],
          real: realM ? realM[1].replace(/<[^>]+>/g, '').trim() : player[3],
          hltvId: Number(player[1]),
          hltvSlug: player[2],
          k: Number(kd[1]),
          d: Number(kd[2]),
          diff: swingVal ? Number(swingVal.replace('%', '')) : pm ? Number(pm[1]) : 0,
          swing: swingVal,
          adr: adr ? Number(adr[1]) : null,
          kast: kast ? Number(kast[1]) : null,
          rating: rating ? Number(rating[1]) : null,
        })
      }
      if (teamM && rows.length === 5) tables.push({ team: norm(teamM[1]), rows })
    }
    sections.push({ id, tables })
  }
  return sections
}

function buildFromMatchHtml(majorId) {
  const file = path.join(HTML_CACHE, `${majorId}.html`)
  const text = read(file)
  if (!text) return null
  const sections = parseMatchHtml(text)
  const all = sections.find((s) => s.id === 'all')
  if (!all || all.tables.length < 2) return null
  const [teamA, teamB] = all.tables
  if (teamA.team === teamB.team) return null
  const maps = sections
    .filter((s) => s.id !== 'all' && s.tables.length === 2)
    .map((s) => ({
      map: s.id,
      teams: {
        [s.tables[0].team]: s.tables[0].rows.map(stripInline),
        [s.tables[1].team]: s.tables[1].rows.map(stripInline),
      },
    }))
  if (maps.length === 0) return null
  const h2hIdx = text.indexOf('Head to head')
  let h2h = null
  if (h2hIdx >= 0) {
    const seg = text.slice(h2hIdx, h2hIdx + 1600).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    const m = seg.match(/(\d+)\s+Wins\s+(\d+)\s+Overtimes\s+(\d+)\s+Wins/)
    if (m) h2h = { wins: [Number(m[1]), Number(m[3])], overtimes: Number(m[2]) }
  }
  return {
    stats: {
      [teamA.team]: teamA.rows.map(stripInline),
      [teamB.team]: teamB.rows.map(stripInline),
    },
    maps,
    h2h,
  }
}

function stripInline(p) {
  return {
    player: p.player,
    real: p.real,
    hltvId: p.hltvId ?? null,
    hltvSlug: p.hltvSlug ?? null,
    k: p.k,
    d: p.d,
    diff: p.diff,
    swing: p.swing,
    adr: p.adr,
    kast: p.kast,
    rating: p.rating,
  }
}

function stripPlain(p) {
  return {
    player: p.player,
    real: p.real,
    hltvId: p.hltvId ?? null,
    hltvSlug: p.hltvSlug ?? null,
    k: p.k,
    d: p.d,
    diff: p.diff,
    swing: p.swing,
    adr: p.adr,
    kast: p.kast,
    rating: p.rating,
  }
}

function buildFromNews(majorId) {
  const file = path.join(NEWS_CACHE, `${majorId}.md`)
  const text = read(file)
  if (!text) return null
  // 新闻稿优先解析 markdown 管道表
  const pipeTables = parseNewsPipe(text)
  if (pipeTables.length > 0) {
    const stats = {}
    for (const t of pipeTables) stats[t.team] = t.rows
    return { stats, maps: [], h2h: null }
  }
  const plain = parsePlain(text)
  if (plain.length > 0) {
    const stats = {}
    for (const t of plain) stats[t.team] = t.players.map(stripPlain)
    return { stats, maps: [], h2h: null }
  }
  return null
}

function parseNewsPipe(text) {
  const lines = text.split(/\r?\n/)
  const tables = []
  let current = null
  const headerRe =
    /^\|\s*(?:!\[[^\]]*\]\([^)]*\)\s*)*\[([^\]]+)\]\(https:\/\/www\.hltv\.org\/team\/\d+[^)]*\)\s*\|\s*K\s*-\s*D\s*\|/
  const rowRe =
    /^\|\s*!\[[^\]]*\]\([^)]*\)\[([^\]]+)\]\(https:\/\/www\.hltv\.org\/player\/\d+[^)]*\)\[[^\]]*\]\([^)]*\)\s*\|\s*(\d+)\s*-\s*(\d+)\s*\|\s*([+-][\d.]+%?)\s*\|\s*([-\d.]+)\s*\|\s*([-\d.]+%?)\s*\|\s*([\d.]+)\s*\|/

  for (const raw of lines) {
    const line = raw.trim()
    const h = line.match(headerRe)
    if (h) {
      current = { team: norm(h[1]), rows: [] }
      tables.push(current)
      continue
    }
    if (!current) continue
    const r = line.match(rowRe)
    if (r) {
      const [, real, k, d, diff, adr, kast, rating] = r
      const idMatch = line.match(/player\/(\d+)\/([a-z0-9-]+)/)
      current.rows.push({
        player: nickOf(real),
        real,
        hltvId: idMatch ? Number(idMatch[1]) : null,
        hltvSlug: idMatch ? idMatch[2] : null,
        k: Number(k),
        d: Number(d),
        diff: Number(diff.replace('%', '')),
        swing: diff.includes('%') ? diff : null,
        adr: adr === '-' ? null : Number(adr),
        kast: kast === '-' ? null : Number(kast.replace('%', '')),
        rating: Number(rating),
      })
    }
  }
  return tables.filter((t) => t.rows.length === 5)
}

// 从任一解析结果按选手 ID（昵称）合并 hltvId/hltvSlug 到最终统计行
function mergeIds(entry, sources) {
  if (!entry || !entry.stats) return
  const idByNick = new Map()
  for (const rows of sources) {
    for (const p of rows) {
      if (p.hltvId && !idByNick.has(p.player.toLowerCase())) {
        idByNick.set(p.player.toLowerCase(), { hltvId: p.hltvId, hltvSlug: p.hltvSlug })
      }
    }
  }
  for (const rows of Object.values(entry.stats)) {
    for (const p of rows) {
      const hit = idByNick.get(p.player.toLowerCase())
      if (hit && !p.hltvId) {
        p.hltvId = hit.hltvId
        p.hltvSlug = hit.hltvSlug
      }
    }
  }
}

function main() {
  const majors = JSON.parse(fs.readFileSync('src/data/majors.json', 'utf8'))
  const finalMaps = JSON.parse(fs.readFileSync('src/data/final_maps.json', 'utf8'))
  const out = {}

  for (const major of majors) {
    const id = major.id
    const entry = { source: NEWS_SOURCES[id] || null }
    let fromMatch = null
    let fromHtml = null
    let fromNews = buildFromNews(id)

    if (MATCH_SOURCES[id]) {
      fromMatch = buildFromMatch(id)
      fromHtml = buildFromMatchHtml(id)
      if (fromMatch || fromHtml) entry.matchUrl = MATCH_SOURCES[id]
    }

    if (fromMatch && fromMatch.stats) {
      entry.stats = fromMatch.stats
    } else if (fromHtml && fromHtml.stats) {
      entry.stats = fromHtml.stats
    } else if (fromNews && fromNews.stats) {
      entry.stats = fromNews.stats
    }

    if (fromMatch && fromMatch.maps && fromMatch.maps.length > 0) {
      const names = (finalMaps[id] || []).map((m) => m.map)
      entry.maps = fromMatch.maps.map((m, i) => ({
        map: normMap(names[i] || m.map),
        teams: m.teams,
      }))
    } else if (fromHtml && fromHtml.maps.length > 0) {
      const names = (finalMaps[id] || []).map((m) => m.map)
      entry.maps = fromHtml.maps.map((m, i) => ({
        map: normMap(names[i] || m.map),
        teams: m.teams,
      }))
    } else {
      entry.maps = []
    }

    if (fromMatch && fromMatch.h2h) entry.h2h = fromMatch.h2h
    else if (fromHtml && fromHtml.h2h) entry.h2h = fromHtml.h2h

    const idSources = []
    if (fromNews) idSources.push(...Object.values(fromNews.stats ?? {}))
    if (fromMatch) idSources.push(...Object.values(fromMatch.stats ?? {}))
    if (fromHtml) {
      idSources.push(...Object.values(fromHtml.stats ?? {}))
      for (const map of fromHtml.maps ?? []) idSources.push(...Object.values(map.teams ?? {}))
    }
    if (fromMatch) {
      for (const map of fromMatch.maps ?? []) idSources.push(...Object.values(map.teams ?? {}))
    }
    mergeIds(entry, idSources)

    const teamCount = entry.stats ? Object.keys(entry.stats).length : 0
    const playerCount = entry.stats
      ? Object.values(entry.stats).reduce((n, arr) => n + arr.length, 0)
      : 0
    console.log(
      `${id.padEnd(15)} teams=${teamCount} players=${playerCount} maps=${entry.maps.length} h2h=${entry.h2h ? 'y' : 'n'}`,
    )
    out[id] = entry
  }

  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n')
  console.log('written:', OUT)
}

main()
