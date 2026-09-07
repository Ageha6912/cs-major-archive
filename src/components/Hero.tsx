import { useEffect, useRef, useState } from 'react'
import { majors, top20 } from '../data'
import { useCountUp } from '../hooks'
import TeamBadge from './TeamBadge'

function Stat({ end, label, active }: { end: number; label: string; active: boolean }) {
  const value = useCountUp(end, active)
  return (
    <div className="hero-stat">
      <span className="hero-stat__num">{value}</span>
      <span className="hero-stat__label">{label}</span>
    </div>
  )
}

export default function Hero({ onBrowse }: { onBrowse: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          io.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])

  // 主内容随滚动缓慢下沉 + 轻微淡出：离场时制造纵深
  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const update = () => {
      raf = 0
      const y = Math.min(window.scrollY, window.innerHeight)
      el.style.transform = `translate3d(0, ${y * 0.16}px, 0)`
      el.style.opacity = String(1 - (y / window.innerHeight) * 0.45)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const goCount = new Set(majors.map((m) => m.champion.team)).size
  const cityCount = new Set(majors.map((m) => m.location)).size
  const top20Years = Object.keys(top20).length
  const titleCount = new Map<string, number>()
  for (const m of majors) titleCount.set(m.champion.team, (titleCount.get(m.champion.team) ?? 0) + 1)
  const clubs = [...titleCount.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])

  return (
    <header className="hero" ref={ref}>
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__glow hero__glow--gold" aria-hidden="true" />
      <div className="hero__glow hero__glow--cyan" aria-hidden="true" />
      <div className="hero__inner">
        <div className="hero__main" ref={mainRef}>
          <p className="hero__kicker">
            COUNTER-STRIKE MAJOR CHAMPIONSHIP ARCHIVE
          </p>
          <h1 className="hero__title">
            <span className="hero__title-mask">
              <span className="hero__title-line">CS MAJOR</span>
            </span>
            <span className="hero__title-mask">
              <span className="hero__title-line hero__title-line--accent">ARCHIVE</span>
            </span>
          </h1>
          <p className="hero__sub">
            2013-2026 · 二十四届冠军之路 · CS:GO 与 CS2 的全部历史
          </p>
          <div className="hero__stats">
            <Stat end={majors.length} label="届 Major" active={active} />
            <Stat end={goCount} label="支冠军战队" active={active} />
            <Stat end={top20Years} label="年 HLTV TOP20" active={active} />
            <Stat end={cityCount} label="座不同主办城市" active={active} />
          </div>
          <div className="hero__actions">
            <button className="btn btn--gold" onClick={onBrowse}>
              浏览全部 24 届
            </button>
            <a className="btn btn--ghost" href="#top20">
              查看 HLTV 年度 TOP20
            </a>
          </div>
        </div>
        <aside className="hero__side">
          <p className="hero__side-kicker">CHAMPION CLUB</p>
          <h3 className="hero__side-title">冠军俱乐部</h3>
          <div className="hero__club">
            {clubs.map(([team, n]) => (
              <div className="hero__club-row" key={team}>
                <TeamBadge team={team} size={32} />
                <span className="hero__club-name">{team}</span>
                <span className="hero__club-count">×{n}</span>
              </div>
            ))}
          </div>
          <div className="hero__side-divider" aria-hidden="true" />
          <p className="hero__side-kicker">ALL CHAMPIONS · 历届冠军</p>
          <div className="hero__champ-list">
            {majors.map((m) => (
              <div className="hero__champ-row" key={m.id}>
                <span className="hero__champ-year">{m.year}</span>
                <TeamBadge team={m.champion.team} size={26} />
                <span className="hero__champ-name">{m.champion.team}</span>
                <span className={`hero__champ-era ${m.era === 'CS2' ? 'is-cs2' : ''}`}>{m.era}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
      <div className="hero__ticker" aria-hidden="true">
        <div className="hero__ticker-track">
          {[0, 1].map((dup) => (
            <span className="hero__ticker-row" key={dup}>
              {majors.map((m) => (
                <span className="hero__ticker-item" key={m.id + dup}>
                  {m.fullName} <i>✦</i>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </header>
  )
}
