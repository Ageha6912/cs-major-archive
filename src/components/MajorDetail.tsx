import { useEffect, useState } from 'react'
import {
  championTop20,
  finalMapsOf,
  formatPurse,
  majors,
  majorById,
  priorTitles,
  videosOf,
} from '../data'
import { useLockBody, useOnKey } from '../hooks'
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
