import { useEffect, useState } from 'react'
import {
  championTop20,
  finalMapsOf,
  formatPurse,
  majors,
  majorById,
  matchStats,
  priorTitles,
  videosOf,
} from '../data'
import type { Major, PlayerMatchStat } from '../data'
import { useLockBody, useOnKey } from '../hooks'
import PlayerAvatar from './PlayerAvatar'
import TeamBadge from './TeamBadge'

function ScoreBar({ label, score, max, side }: { label: string; score: number; max: number; side: 'c' | 'r' }) {
  return (
    <div className="maprow__side">
      <span className="maprow__name">{label}</span>
      <div className="maprow__bar">
        <span
          className={`maprow__fill maprow__fill--${side}`}
          style={{ width: `${(score / max) * 100}%` }}
        />
      </div>
      <b className="maprow__score">{score}</b>
    </div>
  )
}

function VideoBlock({ id, label, title }: { id: string; label: string; title: string }) {
  const [playing, setPlaying] = useState(false)
  if (playing) {
    return (
      <div className="video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }
  return (
    <button className="video video--cover" onClick={() => setPlaying(true)}>
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt={title} loading="lazy" />
      <span className="video__play" aria-hidden="true">
        ▶
      </span>
      <span className="video__label">{label}</span>
    </button>
  )
}

const TEAM_ALIAS: Record<string, string> = {
  fnatic: 'Fnatic',
  Envy: 'Team EnVyUs',
  Luminosity: 'Luminosity Gaming',
  SK: 'SK Gaming',
  Liquid: 'Team Liquid',
  Gambit: 'Gambit Esports',
  FaZe: 'FaZe Clan',
  G2: 'G2 Esports',
  HEROIC: 'Heroic',
  Vitality: 'Team Vitality',
  Spirit: 'Team Spirit',
  FURIA: 'FURIA Esports',
  Falcons: 'Team Falcons',
  LDLC: 'Team LDLC.com',
}

function alias(team: string): string {
  return TEAM_ALIAS[team] ?? team
}

function fmtNum(n: number | null, digits = 1): string {
  return n == null ? '–' : n.toFixed(digits)
}

function fmtRating(r: number | null): string {
  if (r == null) return '–'
  return r.toFixed(2)
}

function fmtDiff(p: PlayerMatchStat): string {
  if (p.swing) return p.swing
  const v = p.k - p.d
  return v > 0 ? `+${v}` : String(v)
}

function realName(p: PlayerMatchStat): string {
  if (!p.player) return p.real
  const suffix = ` ${p.player}`
  return p.real.endsWith(suffix) ? p.real.slice(0, -suffix.length) : p.real
}

function Portrait({ p }: { p: PlayerMatchStat }) {
  const [failed, setFailed] = useState(false)
  if (p.img && !failed) {
    return (
      <span className="mstats__avatar">
        <img src={p.img} alt={p.player} loading="lazy" onError={() => setFailed(true)} />
      </span>
    )
  }
  return <span className="mstats__avatar mstats__avatar--fallback">{p.player.slice(0, 2).toUpperCase()}</span>
}

function StatTable({
  team,
  rows,
  mvp,
}: {
  team: string
  rows: PlayerMatchStat[]
  mvp: string
}) {
  return (
    <div className="mstats__team">
      <div className="mstats__team-name">
        <TeamBadge team={alias(team)} size={22} />
        <span>{alias(team)}</span>
      </div>
      <div className="mstats__scroll">
        <table className="mstats__table">
          <thead>
            <tr>
              <th>选手</th>
              <th>K-D</th>
              <th>+/-</th>
              <th>ADR</th>
              <th>KAST</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const isMvp = p.player.toLowerCase() === mvp.toLowerCase()
              const diff = fmtDiff(p)
              const diffNum = Number(String(diff).replace('%', ''))
              return (
                <tr key={p.player} className={isMvp ? 'mstats__row--mvp' : ''}>
                  <td className="mstats__player">
                    <Portrait p={p} />
                    <span className="mstats__pname">
                      <b>{p.player}</b>
                      <i>{realName(p)}</i>
                    </span>
                    {isMvp ? <em>MVP</em> : null}
                  </td>
                  <td>
                    {p.k} – {p.d}
                  </td>
                  <td className={diffNum > 0 ? 'pos' : diffNum < 0 ? 'neg' : ''}>{diff}</td>
                  <td>{fmtNum(p.adr)}</td>
                  <td>{p.kast == null ? '–' : `${p.kast.toFixed(1)}%`}</td>
                  <td
                    className={`mstats__rating ${p.rating == null ? '' : p.rating >= 1 ? 'pos' : p.rating >= 0.9 ? '' : 'neg'}`}
                  >
                    {fmtRating(p.rating)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MatchStats({ major }: { major: Major }) {
  const [tab, setTab] = useState(0)
  const entry = matchStats[major.id]
  if (!entry || !entry.stats || Object.keys(entry.stats).length < 2) return null
  const maps = entry.maps ?? []
  const mapScores = finalMapsOf(major)
  const teamNames = Object.keys(entry.stats)
  const isMap = tab > 0 && maps[tab - 1]
  const tables = isMap ? Object.entries(isMap.teams) : Object.entries(entry.stats)

  return (
    <section className="detail__section">
      <h4>
        决赛选手数据 <small>全场 · HLTV 官方统计</small>
      </h4>
      <div className="mstats__tabs" role="tablist">
        <button
          className={tab === 0 ? 'mstats__tab is-active' : 'mstats__tab'}
          onClick={() => setTab(0)}
          role="tab"
        >
          全场数据
        </button>
        {maps.map((m, i) => {
          const score = mapScores.find((s) => s.map === m.map)
          return (
            <button
              key={m.map}
              className={tab === i + 1 ? 'mstats__tab is-active' : 'mstats__tab'}
              onClick={() => setTab(i + 1)}
              role="tab"
            >
              {m.map}
              {score ? (
                <small>
                  {score.scores[0]} : {score.scores[1]}
                </small>
              ) : null}
            </button>
          )
        })}
      </div>
      <div className="mstats__teams">
        {tables.map(([team, rows]) => (
          <StatTable key={team + (isMap ? isMap.map : 'all')} team={team} rows={rows} mvp={major.mvp} />
        ))}
      </div>
      {entry.h2h && teamNames.length === 2 ? (
        <div className="mstats__h2h">
          <span className="mstats__h2h-label">历史交锋</span>
          <b>{alias(teamNames[0])}</b>
          <span className="mstats__h2h-score">
            {entry.h2h.wins[0]} : {entry.h2h.wins[1]}
            <small>含 {entry.h2h.overtimes} 次加时</small>
          </span>
          <b>{alias(teamNames[1])}</b>
        </div>
      ) : null}
      <p className="mstats__source">
        数据来源：
        {entry.matchUrl ? (
          <a href={entry.matchUrl} target="_blank" rel="noreferrer">
            HLTV 比赛页
          </a>
        ) : entry.source ? (
          <a href={entry.source} target="_blank" rel="noreferrer">
            HLTV 赛事报告
          </a>
        ) : (
          'HLTV'
        )}
      </p>
    </section>
  )
}

export default function MajorDetail({
  id,
  onClose,
  onSelect,
}: {
  id: string
  onClose: () => void
  onSelect: (id: string) => void
}) {
  const major = majorById.get(id)
  useLockBody(!!major)
  useOnKey(['Escape'], onClose, !!major)
  useOnKey(
    ['ArrowLeft'],
    () => {
      const idx = majors.findIndex((m) => m.id === id)
      if (idx > 0) onSelect(majors[idx - 1].id)
    },
    !!major,
  )
  useOnKey(
    ['ArrowRight'],
    () => {
      const idx = majors.findIndex((m) => m.id === id)
      if (idx >= 0 && idx < majors.length - 1) onSelect(majors[idx + 1].id)
    },
    !!major,
  )

  useEffect(() => {
    if (major) window.scrollTo({ top: 0 })
  }, [id, major])

  if (!major) return null
  const idx = majors.findIndex((m) => m.id === id)
  const prev = idx > 0 ? majors[idx - 1] : null
  const next = idx < majors.length - 1 ? majors[idx + 1] : null
  const maps = finalMapsOf(major)
  const videos = videosOf(major)
  const inTop20 = championTop20(major)
  const maxScore = Math.max(19, ...maps.flatMap((mp) => mp.scores))

  return (
    <div className={`detail era-${major.era === 'CS2' ? 'cs2' : 'csgo'}`} role="dialog" aria-modal="true">
      <div className="detail__bar">
        <button className="detail__back" onClick={onClose}>
          ← 返回目录
        </button>
        <span className="detail__pos">
          {idx + 1} / {majors.length}
        </span>
      </div>

      <article className="detail__body">
        <header className="detail__hero">
          <p className="detail__kicker">
            {major.era} · {major.dates}
          </p>
          <h2 className="detail__title">{major.fullName}</h2>
          <p className="detail__venue">
            {major.venue} · {major.location} · 奖金 {formatPurse(major.purse)} · {major.teams} 支队伍
          </p>
          <div className="detail__duel">
            <div className="detail__team">
              <TeamBadge team={major.champion.team} size={92} />
              <div>
                <span className="detail__tag">CHAMPION · 第 {priorTitles(major) + 1} 冠</span>
                <h3>{major.champion.team}</h3>
                <p className="detail__roster">{major.champion.roster.join(' · ')}</p>
              </div>
            </div>
            <div className="detail__vs">
              <b>{major.score}</b>
              <span>MVP</span>
              <em>{major.mvp}</em>
            </div>
            <div className="detail__team detail__team--runner">
              <TeamBadge team={major.runnerUp.team} size={92} />
              <div>
                <span className="detail__tag">RUNNER-UP · 亚军</span>
                <h3>{major.runnerUp.team}</h3>
                <p className="detail__roster">{major.runnerUp.roster.join(' · ')}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="detail__section">
          <h4>决赛地图</h4>
          <div className="maprows">
            {maps.map((mp) => (
              <div className="maprow" key={mp.map}>
                <ScoreBar label={mp.map} score={mp.scores[0]} max={maxScore} side="c" />
                <ScoreBar label={mp.map} score={mp.scores[1]} max={maxScore} side="r" />
              </div>
            ))}
          </div>
        </section>

        <MatchStats major={major} />

        <section className="detail__section">
          <h4>淘汰赛四强</h4>
          <div className="detail__bracket">
            <div className="detail__slot detail__slot--champ">
              <span>冠军</span>
              <b>{major.champion.team}</b>
            </div>
            <div className="detail__slot detail__slot--runner">
              <span>亚军</span>
              <b>{major.runnerUp.team}</b>
            </div>
            <div className="detail__slot">
              <span>四强</span>
              <b>{major.semifinalists.join(' / ')}</b>
            </div>
            <div className="detail__slot">
              <span>八强</span>
              <b>{major.quarterfinalists.join(' / ')}</b>
            </div>
          </div>
        </section>

        <section className="detail__section">
          <h4>参赛队伍（{major.participants.length}）</h4>
          <div className="detail__chips">
            {major.participants.map((team) => (
              <span className="chip" key={team}>
                <TeamBadge team={team} size={24} />
                {team}
              </span>
            ))}
          </div>
        </section>

        {inTop20.length > 0 ? (
          <section className="detail__section">
            <h4>
              当年 HLTV TOP20 中的冠军成员 <small>({major.year})</small>
            </h4>
            <div className="detail__top20">
              {inTop20.map((e) => (
                <span className="chip chip--gold" key={e.player}>
                  <b>#{e.rank}</b>
                  <PlayerAvatar name={e.player} size={22} />
                  {e.player}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {videos.length > 0 ? (
          <section className="detail__section">
            <h4>名场面 · 决赛视频</h4>
            <div className="detail__videos">
              {videos.map((v) => (
                <VideoBlock key={v.id} id={v.id} label={v.label} title={v.title} />
              ))}
            </div>
          </section>
        ) : null}

        <nav className="detail__nav">
          {prev ? (
            <button onClick={() => onSelect(prev.id)}>
              <span>← {prev.year}</span>
              <b>{prev.fullName}</b>
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button className="detail__nav-next" onClick={() => onSelect(next.id)}>
              <span>{next.year} →</span>
              <b>{next.fullName}</b>
            </button>
          ) : (
            <span />
          )}
        </nav>
      </article>
    </div>
  )
}
