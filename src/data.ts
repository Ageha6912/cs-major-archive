import majorsJson from './data/majors.json'
import finalMapsJson from './data/final_maps.json'
import top20Json from './data/top20.json'
import videosJson from './data/videos.json'

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

export const majors = majorsJson as Major[]
export const finalMaps = finalMapsJson as Record<string, { map: string; scores: number[] }[]>
export const top20 = top20Json as Record<string, Top20Entry[]>
export const videos = videosJson as Record<string, VideoEntry[]>

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
