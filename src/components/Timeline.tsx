import { useState } from 'react'
import { finalMapsOf, formatPurse, videosOf } from '../data'
import type { Major } from '../data'
import TeamBadge from './TeamBadge'

function MapsSummary({ major }: { major: Major }) {
  const maps = finalMapsOf(major)
  if (maps.length === 0) return null
  return (
    <div className="tl__maps">
      {maps.map((mp) => (
        <span className="tl__map" key={mp.map + mp.scores.join('-')}>
          <i>{mp.map}</i>
          <b>
            {mp.scores[0]} : {mp.scores[1]}
          </b>
        </span>
      ))}
    </div>
  )
}

export default function Timeline({
  majors,
  onSelect,
}: {
  majors: Major[]
  onSelect: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const COLLAPSED_COUNT = 6
  const visible = expanded ? majors : majors.slice(0, COLLAPSED_COUNT)
  return (
    <section className="tl section" id="timeline">
      <div className="section-head" data-reveal>
        <p className="section-head__kicker">CHRONICLE · 编年史</p>
        <h2 className="section-head__title">历届征程</h2>
        <p className="section-head__desc">按下时间顺序，重温每一届的决赛、地图与主角。</p>
      </div>
      <div className="tl__line">
        {visible.map((m, i) => {
          const videos = videosOf(m)
          const thumb = videos[0]
          const fresh = expanded && i >= COLLAPSED_COUNT
          return (
            <article
              className={`tl__item era-${m.era === 'CS2' ? 'cs2' : 'csgo'}${fresh ? ' tl__item--fresh' : ''}`}
              key={m.id}
              {...(fresh ? {} : { 'data-reveal': '' })}
              style={{ ['--i' as string]: i }}
            >
              <div className="tl__node">
                <span className="tl__node-year">{m.year}</span>
              </div>
              <div className="tl__card" onClick={() => onSelect(m.id)}>
                <header className="tl__head">
                  <div>
                    <span className="tl__era">{m.era}</span>
                    <h3>{m.fullName}</h3>
                    <p className="tl__venue">
                      {m.venue} · {m.location} · {formatPurse(m.purse)}
                    </p>
                  </div>
                  <span className="tl__arrow">→</span>
                </header>
                <div className="tl__duel">
                  <div className="tl__team">
                    <TeamBadge team={m.champion.team} size={40} />
                    <div>
                      <b className="tl__champ">冠军</b>
                      <span>{m.champion.team}</span>
                    </div>
                  </div>
                  <div className="tl__score">
                    <b>{m.score}</b>
                    <span>MVP {m.mvp}</span>
                  </div>
                  <div className="tl__team tl__team--runner">
                    <TeamBadge team={m.runnerUp.team} size={40} />
                    <div>
                      <b>亚军</b>
                      <span>{m.runnerUp.team}</span>
                    </div>
                  </div>
                </div>
                <MapsSummary major={m} />
                {thumb ? (
                  <div className="tl__thumb" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`https://www.youtube.com/watch?v=${thumb.id}`}
                      target="_blank"
                      rel="noreferrer"
                      title={thumb.title}
                    >
                      <img
                        src={`https://i.ytimg.com/vi/${thumb.id}/hqdefault.jpg`}
                        alt={thumb.title}
                        loading="lazy"
                      />
                      <span className="tl__play" aria-hidden="true">
                        ▶
                      </span>
                      <span className="tl__thumb-label">{thumb.label}</span>
                    </a>
                  </div>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
      {!expanded ? (
        <div className="tl__toggle-wrap" data-reveal>
          <button className="tl__toggle" onClick={() => setExpanded(true)}>
            展开全部 {majors.length} 届
            <span>还有 {majors.length - COLLAPSED_COUNT} 届待展开</span>
            <i aria-hidden="true">▾</i>
          </button>
        </div>
      ) : (
        <div className="tl__toggle-wrap" data-reveal>
          <button className="tl__toggle tl__toggle--close" onClick={() => setExpanded(false)}>
            收起编年史 <i aria-hidden="true">▴</i>
          </button>
        </div>
      )}
    </section>
  )
}
