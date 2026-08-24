import majorsJson from './data/majors.json'
import finalMapsJson from './data/final_maps.json'
import top20Json from './data/top20.json'
import videosJson from './data/videos.json'
import matchStatsJson from './data/matchStats.json'

export interface TeamEntry {
  team: string
  roster: string[]
}

export interface Major {
  id: string
  name: string
  fullName: string
  era: 'CS:GO' | 'CS2'
  year: number
  dates: string
  venue: string
  location: string
  purse: number
  teams: number
  champion: TeamEntry
  runnerUp: TeamEntry
  score: string
  mvp: string
  semifinalists: string[]
  quarterfinalists: string[]
  participants: string[]
}

export interface Top20Entry {
  rank: number
  player: string
  country: string
  team: string
}

export interface VideoEntry {
  id: string
  label: string
  title: string
  author: string
}

export interface PlayerMatchStat {
  player: string
  real: string
  img?: string
  k: number
  d: number
  diff: number
  swing: string | null
  adr: number | null
  kast: number | null
  rating: number | null
}

export interface MatchStatsEntry {
  source: string | null
  matchUrl?: string
  stats: Record<string, PlayerMatchStat[]>
  maps: { map: string; teams: Record<string, PlayerMatchStat[]> }[]
  h2h?: { wins: number[]; overtimes: number }
}

export const majors = majorsJson as Major[]
export const finalMaps = finalMapsJson as Record<string, { map: string; scores: number[] }[]>
export const top20 = top20Json as Record<string, Top20Entry[]>
export const videos = videosJson as Record<string, VideoEntry[]>
export const matchStats = matchStatsJson as Record<string, MatchStatsEntry>

export const majorById = new Map(majors.map((m) => [m.id, m]))

/** Real team logos bundled in /public/logos; teams without one fall back to monograms. */
export const TEAM_LOGOS: Record<string, string> = {
  Astralis: '/logos/astralis.svg',
  Cloud9: '/logos/cloud9.svg',
  'FaZe Clan': '/logos/fazeclan.svg',
  Fnatic: '/logos/fnatic.svg',
  'Gambit Esports': '/logos/gambitesports.svg',
  'Luminosity Gaming': '/logos/luminositygaming.svg',
  'Natus Vincere': '/logos/natusvincere.svg',
  'Ninjas in Pyjamas': '/logos/ninjasinpyjamas.svg',
  Outsiders: '/logos/outsiders.png',
  'SK Gaming': '/logos/skgaming.svg',
  'Team EnVyUs': '/logos/teamenvyus.svg',
  'Team Falcons': '/logos/teamfalcons.svg',
  'Team LDLC.com': '/logos/teamldlccom.svg',
  'Team Spirit': '/logos/teamspirit.svg',
  'Team Vitality': '/logos/teamvitality.svg',
  'Virtus.pro': '/logos/virtuspro.png',
  'AVANGAR': '/logos/avangar.png',
  'Apeks': '/logos/apeks.jpg',
  'Aurora Gaming': '/logos/auroragaming.svg',
  'Copenhagen Wolves': '/logos/copenhagenwolves.png',
  'Counter Logic Gaming': '/logos/counterlogicgaming.svg',
  'ENCE': '/logos/ence.svg',
  'FURIA Esports': '/logos/furiaesports.svg',
  'FlipSid3 Tactics': '/logos/flipsid3tactics.png',
  'G2 Esports': '/logos/g2esports.svg',
  'Gambit Gaming': '/logos/gambitgaming.svg',
  'GamerLegion': '/logos/gamerlegion.png',
  'HellRaisers': '/logos/hellraisers.png',
  'Heroic': '/logos/heroic.png',
  'MIBR': '/logos/mibr.png',
  'MOUZ': '/logos/mouz.svg',
  'mousesports': '/logos/mousesports.svg',
  'PENTA Sports': '/logos/pentasports.png',
  'Renegades': '/logos/renegades.svg',
  'Team Dignitas': '/logos/teamdignitas.svg',
  'Team Liquid': '/logos/teamliquid.svg',
  'Team SoloMid': '/logos/teamsolomid.svg',
  'The MongolZ': '/logos/themongolz.svg',
  'paiN Gaming': '/logos/paingaming.svg',
  'compLexity Gaming': '/logos/complexitygaming.png',
  'VeryGames': '/logos/verygames.png',
  'Astana Dragons': '/logos/astanadragons.png',
  'Epsilon eSports': '/logos/epsilonesports.png',
  'Copenhagen Flames': '/logos/copenhagenflames.png',
  'North': '/logos/north.png',
  'NRG Esports': '/logos/nrgesports.png',
  'BIG': '/logos/big.png',
  'Immortals': '/logos/immortals.png',
  'Into the Breach': '/logos/intothebreach.png',
  '9z Team': '/logos/9zteam.png',
  'BetBoom Team': '/logos/betboomteam.png',
}

const MONOGRAM: Record<string, string> = {
  Fnatic: 'FN',
  'Ninjas in Pyjamas': 'NiP',
  'compLexity Gaming': 'coL',
  VeryGames: 'VG',
  'LGB eSports': 'LGB',
  'Astana Dragons': 'AD',
  'Recursive eSports': 'RE',
  'Copenhagen Wolves': 'CW',
  'Clan-Mystik': 'CM',
  'Natus Vincere': 'NaVi',
  'Universal Soldiers': 'US',
  'n!faculty': 'NF',
  Xapso: 'XA',
  'Reason Gaming': 'RG',
  'Team iBUYPOWER': 'iBP',
  'Virtus.pro': 'VP',
  'Team LDLC.com': 'LDLC',
  'Team Dignitas': 'DG',
  'Team SoloMid': 'TSM',
  'Team EnVyUs': 'nV',
  Titan: 'TT',
  'Team Liquid': 'TL',
  'Luminosity Gaming': 'LG',
  'SK Gaming': 'SK',
  'G2 Esports': 'G2',
  'Astralis': 'AS',
  'Gambit Esports': 'GMB',
  Immortals: 'IMT',
  Cloud9: 'C9',
  'FaZe Clan': 'FaZe',
  'MIBR': 'MIBR',
  ENCE: 'ENCE',
  AVANGAR: 'AVG',
  'Team Vitality': 'VIT',
  'GamerLegion': 'GL',
  'PENTA Sports': 'PENTA',
  'Flipsid3 Tactics': 'F3',
  'HellRaisers': 'HR',
  'Mousesports': 'MOUZ',
  'MOUZ': 'MOUZ',
  'Outsiders': 'OUT',
  Heroic: 'HER',
  'Team Spirit': 'SPIRIT',
  'The MongolZ': 'MGLZ',
  'Team Falcons': 'FLC',
  'FURIA Esports': 'FUR',
  'Eternal Fire': 'EF',
  'Aurora Gaming': 'AUR',
  'BIG': 'BIG',
  'Complexity Gaming': 'coL',
  'Evil Geniuses': 'EG',
  '100 Thieves': '100T',
  'North': 'NOR',
  'FunPlus Phoenix': 'FPX',
  'Worst Players': 'WP',
  'GODSENT': 'GOD',
  'SY_b': 'SYB',
  'Epsilon eSports': 'EPS',
  'über G33KZ': 'uG3',
  'AGAiN': 'AGN',
  'ESC Gaming': 'ESC',
  'Western Wolves': 'WW',
  'myDGB.net': 'DGB',
  '3DMAX': '3D',
  'dAT Team': 'dAT',
  'Renegades': 'RNG',
  'NRG Esports': 'NRG',
  'Team One': 'T1',
  'Spirit': 'SPR',
  'Players': 'PLR',
  'FURIA': 'FUR',
  'Aurora': 'AUR',
  'M80': 'M80',
}

export function monogram(team: string): string {
  const key = MONOGRAM[team]
  if (key) return key
  const words = team.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean)
  if (words.length === 0) return team.slice(0, 3).toUpperCase()
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase()
  return words
    .filter((w) => w.length > 2 || words.length === 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export function formatPurse(purse: number): string {
  if (purse >= 1_000_000) return `$${(purse / 1_000_000).toFixed(purse % 1_000_000 === 0 ? 0 : 1)}M`
  return `$${purse / 1000}K`
}

/** Number of times this team had won a major before this one. */
export function priorTitles(major: Major): number {
  let count = 0
  for (const m of majors) {
    if (m.year < major.year || (m.year === major.year && majors.indexOf(m) < majors.indexOf(major))) {
      if (m.champion.team === major.champion.team) count++
    }
  }
  return count
}

export function championTop20(major: Major): Top20Entry[] {
  const year = top20[String(major.year)]
  if (!year) return []
  const roster = new Set(major.champion.roster)
  return year.filter((e) => roster.has(e.player))
}

export function finalMapsOf(major: Major) {
  return finalMaps[major.id] ?? []
}

export function videosOf(major: Major): VideoEntry[] {
  return videos[major.id] ?? []
}

export interface HoFYear {
  year: number
  rank: number
  team: string
}

export interface HoFEntry {
  player: string
  appearances: number
  top10s: number
  numberOnes: number
  best: number
  teams: string[]
  years: HoFYear[]
}

/** Aggregate the 13 yearly TOP20 lists into an all-time leaderboard. */
export function hallOfFame(): HoFEntry[] {
  const map = new Map<string, HoFEntry>()
  for (const [year, entries] of Object.entries(top20)) {
    for (const e of entries) {
      const rec = map.get(e.player) ?? {
        player: e.player,
        appearances: 0,
        top10s: 0,
        numberOnes: 0,
        best: 21,
        teams: [],
        years: [],
      }
      rec.appearances += 1
      if (e.rank <= 10) rec.top10s += 1
      if (e.rank === 1) rec.numberOnes += 1
      rec.best = Math.min(rec.best, e.rank)
      if (!rec.teams.includes(e.team)) rec.teams.push(e.team)
      rec.years.push({ year: Number(year), rank: e.rank, team: e.team })
      map.set(e.player, rec)
    }
  }
  const list = [...map.values()]
  for (const rec of list) rec.years.sort((a, b) => a.year - b.year)
  return list
}

/** 赛事中文短名（城市），如「2026年科隆」 */
export const CITY_ZH: Record<string, string> = {
  dhw2013: '延雪平',
  katowice2014: '卡托维兹',
  cologne2014: '科隆',
  dhw2014: '延雪平',
  katowice2015: '卡托维兹',
  cologne2015: '科隆',
  cluj2015: '克卢日-纳波卡',
  columbus2016: '哥伦布',
  cologne2016: '科隆',
  atlanta2017: '亚特兰大',
  krakow2017: '克拉科夫',
  boston2018: '波士顿',
  london2018: '伦敦',
  katowice2019: '卡托维兹',
  berlin2019: '柏林',
  stockholm2021: '斯德哥尔摩',
  antwerp2022: '安特卫普',
  rio2022: '里约热内卢',
  paris2023: '巴黎',
  copenhagen2024: '哥本哈根',
  shanghai2024: '上海',
  austin2025: '奥斯汀',
  budapest2025: '布达佩斯',
  cologne2026: '科隆',
}

/** 赛事主办方：有 Logo 用图片，否则用文字徽标 */
export const ORGANIZERS: Record<string, { label: string; logo?: string }> = {
  dhw2013: { label: 'DreamHack' },
  katowice2014: { label: 'ESL' },
  cologne2014: { label: 'ESL' },
  dhw2014: { label: 'DreamHack' },
  katowice2015: { label: 'ESL' },
  cologne2015: { label: 'ESL' },
  cluj2015: { label: 'DreamHack' },
  columbus2016: { label: 'MLG', logo: '/organizers/mlg.svg' },
  cologne2016: { label: 'ESL' },
  atlanta2017: { label: 'ELEAGUE', logo: '/organizers/eleague.png' },
  krakow2017: { label: 'PGL' },
  boston2018: { label: 'ELEAGUE', logo: '/organizers/eleague.png' },
  london2018: { label: 'FACEIT' },
  katowice2019: { label: 'IEM', logo: '/organizers/iem.svg' },
  berlin2019: { label: 'StarLadder' },
  stockholm2021: { label: 'PGL' },
  antwerp2022: { label: 'PGL' },
  rio2022: { label: 'IEM', logo: '/organizers/iem.svg' },
  paris2023: { label: 'BLAST', logo: '/organizers/blast.svg' },
  copenhagen2024: { label: 'PGL' },
  shanghai2024: { label: 'Perfect World', logo: '/organizers/perfectworld.png' },
  austin2025: { label: 'BLAST', logo: '/organizers/blast.svg' },
  budapest2025: { label: 'StarLadder' },
  cologne2026: { label: 'IEM', logo: '/organizers/iem.svg' },
}

/** 各战队主题色（卡片光晕 / Logo 发光），无记录时回退灰色 */
export const TEAM_COLORS: Record<string, string> = {
  Astralis: '#e23b2e',
  Cloud9: '#5b7cfa',
  'FaZe Clan': '#f15a22',
  Fnatic: '#ff7900',
  'Gambit Esports': '#e5484d',
  'Gambit Gaming': '#e5484d',
  'Luminosity Gaming': '#3b82f6',
  'Natus Vincere': '#ffe600',
  'Ninjas in Pyjamas': '#f2c72d',
  Outsiders: '#a855f7',
  'SK Gaming': '#e8c15a',
  'Team EnVyUs': '#58a6ff',
  'Team Falcons': '#00d68f',
  'Team LDLC.com': '#2f9dff',
  'Team Spirit': '#38bdf8',
  'Team Vitality': '#facc15',
  'Virtus.pro': '#f2c14e',
  AVANGAR: '#e879f9',
  Apeks: '#94a3b8',
  'Astana Dragons': '#fb923c',
  'Aurora Gaming': '#f43f5e',
  BIG: '#eab308',
  'BetBoom Team': '#22c55e',
  'Copenhagen Flames': '#fb7185',
  'Copenhagen Wolves': '#a78bfa',
  'Counter Logic Gaming': '#ffd166',
  ENCE: '#00b4d8',
  'Epsilon eSports': '#8b5cf6',
  'Eternal Fire': '#f97316',
  'FURIA Esports': '#fbbf24',
  'FlipSid3 Tactics': '#f472b6',
  'G2 Esports': '#e9c46a',
  GamerLegion: '#60a5fa',
  HellRaisers: '#ef4444',
  Heroic: '#fb4d6d',
  Immortals: '#fbbf24',
  'Into the Breach': '#c084fc',
  'Keyd Stars': '#22d3ee',
  'LGB eSports': '#94a3b8',
  MIBR: '#f87171',
  MOUZ: '#d4af37',
  mousesports: '#d4af37',
  Monte: '#8b5cf6',
  'NRG Esports': '#facc15',
  North: '#3b82f6',
  'PENTA Sports': '#cbd5e1',
  'Quantum Bellator Fire': '#f97316',
  'Recursive eSports': '#64748b',
  Renegades: '#fb923c',
  'Team Dignitas': '#f59e0b',
  'Team Kinguin': '#a3e635',
  'Team Liquid': '#00a7e1',
  'Team SoloMid': '#ef4444',
  'The MongolZ': '#60a5fa',
  VeryGames: '#2dd4bf',
  'compLexity Gaming': '#f97316',
  'paiN Gaming': '#e11d48',
  '9z Team': '#84cc16',
}

export function teamColor(team: string): string {
  return TEAM_COLORS[team] ?? '#94a3b8'
}
