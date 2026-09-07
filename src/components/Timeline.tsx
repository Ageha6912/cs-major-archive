import { useEffect, useRef, useState } from 'react'
import { finalMapsOf, formatPurse, videosOf, visualPeriod } from '../data'
import type { Major } from '../data'
import TeamBadge from './TeamBadge'

function MapsDial() {
  return (
    <span className="tl__dial" aria-hidden="true">
      <svg viewBox="0 0 52 30" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M4 25a22 22 0 0 1 44 0" />
        <path d="M26 25V3" />
        <circle cx="26" cy="25" r="3" fill="currentColor" stroke="none" />
        <path d="M12 19c5-6 12-8 28-7" />
      </svg>
    </span>
  )
}

function MapsSummary({ major }: { major: Major }) {
  const maps = finalMapsOf(major)
  if (maps.length === 0) return null

  return (
    <div className="tl__maps">
      <MapsDial />
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
  const lineRef = useRef<HTMLDivElement>(null)
  const spineRef = useRef<HTMLSpanElement>(null)
  const COLLAPSED_COUNT = 6
  const visible = expanded ? majors : majors.slice(0, COLLAPSED_COUNT)

  // 流光脊线：scaleY 直接写 DOM，随阅读进度生长
  useEffect(() => {
    const line = lineRef.current
    const spine = spineRef.current
    if (!line || !spine) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const rect = line.getBoundingClientRect()
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.72 - rect.top) / rect.height))
      spine.style.transform = `scaleY(${p})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [expanded])

  // 已读过的年份节点点亮
  useEffect(() => {
    const nodes = lineRef.current?.querySelectorAll('.tl__node')
    if (!nodes) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-lit')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -55% 0px' },
    )
    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [expanded])

  return (
    <section className="tl section" id="timeline">
      <div className="section-head" data-reveal>
        <p className="section-head__kicker">CHRONICLE · 编年史</p>
        <h2 className="section-head__title">历届征程</h2>
        <p className="section-head__desc">按下时间顺序，重温每一届的决赛、地图与主角。</p>
      </div>
      <div className="tl__line" ref={lineRef}>
        <span className="tl__spine" ref={spineRef} aria-hidden="true" />
        {visible.map((m, i) => {
          const videos = videosOf(m)
          const thumb = videos[0]
          const fresh = expanded && i >= COLLAPSED_COUNT
          return (
            <article
              className={`tl__item period-${visualPeriod(m.year)} era-${m.era === 'CS2' ? 'cs2' : 'csgo'}${fresh ? ' tl__item--fresh' : ''}`}
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
                    <TeamBadge team={m.champion.team} size={34} />
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
                    <TeamBadge team={m.runnerUp.team} size={34} />
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
