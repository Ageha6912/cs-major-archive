import { useEffect, useMemo, useRef, useState } from 'react'
import { hallOfFame, playerImage, top20 } from '../data'
import type { HoFEntry } from '../data'
import { useCountUp } from '../hooks'

type SortKey = 'appearances' | 'top10s' | 'numberOnes' | 'best'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'appearances', label: '上榜次数' },
  { key: 'top10s', label: '前十次数' },
  { key: 'numberOnes', label: '登顶次数' },
  { key: 'best', label: '最佳名次' },
]

function compare(a: HoFEntry, b: HoFEntry, key: SortKey): number {
  if (key === 'best') return a.best - b.best
  return b[key] - a[key]
}

function HoFStat({ end, label, active }: { end: number; label: string; active: boolean }) {
  const value = useCountUp(end, active)
  return (
    <div>
      <b>{value}</b>
      <span>{label}</span>
    </div>
  )
}

function LegendPhoto({ name }: { name: string }) {
  const image = playerImage(name)
  if (image) {
    return <img className="legend__photo" src={image} alt={name} loading="lazy" />
  }
  return (
    <span className="legend__photo legend__photo--fallback" aria-hidden="true">
      {name.slice(0, 2).toUpperCase()}
    </span>
  )
}

function RowAvatar({ name }: { name: string }) {
  const image = playerImage(name)
  if (image) {
    return <img className="player-avatar" src={image} alt="" width={28} height={28} loading="lazy" />
  }
  return (
    <span className="player-avatar player-avatar--fallback" style={{ width: 28, height: 28, fontSize: 10 }} aria-hidden="true">
      {name.slice(0, 2).toUpperCase()}
    </span>
  )
}

function HoFRow({ entry, index }: { entry: HoFEntry; index: number }) {
  const [open, setOpen] = useState(false)
  const tier = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''
  return (
    <li className={`hof-row ${tier ? `hof-row--${tier}` : ''}${open ? ' is-open' : ''}`}>
      <button className="hof-row__main" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="hof-row__no">{index + 1}</span>
        <RowAvatar name={entry.player} />
        <span className="hof-row__name">{entry.player}</span>
        <span className="hof-row__stat">
          <b>{entry.appearances}</b>次上榜
        </span>
        <span className="hof-row__stat hof-row__stat--tens">
          <b>{entry.top10s}</b>次前十
        </span>
        <span className="hof-row__stat hof-row__stat--ones">
          <b>{entry.numberOnes}</b>次第一
        </span>
        <span className="hof-row__best">最佳 #{entry.best}</span>
        <span className={`hof-row__caret ${open ? 'is-open' : ''}`} aria-hidden="true">
          ▾
        </span>
      </button>
      <div className="hof-row__detail">
        <div className="hof-row__detail-clip">
          <div className="hof-row__detail-inner">
            <div className="hof-row__teams">
              {entry.teams.map((t) => (
                <span className="chip" key={t}>
                  {t}
                </span>
              ))}
            </div>
            <ol className="hof-row__years">
              {entry.years.map((y) => (
                <li key={y.year} className={y.rank === 1 ? 'is-1' : ''}>
                  <b>{y.year}</b>
                  <span className="hof-year__rank">#{y.rank}</span>
                  <span className="hof-year__team">{y.team}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </li>
  )
}

export default function HallOfFame() {
  const all = useMemo(() => hallOfFame(), [])
  const [sortKey, setSortKey] = useState<SortKey>('appearances')
  const [query, setQuery] = useState('')
  const [legendIdx, setLegendIdx] = useState(0)
  const statsRef = useRef<HTMLDivElement>(null)
  const [statsActive, setStatsActive] = useState(false)

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsActive(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const legends = useMemo(
    () =>
      [...all]
        .sort((a, b) => compare(a, b, 'appearances') || compare(a, b, 'numberOnes') || a.best - b.best)
        .slice(0, 3),
    [all],
  )
  const years = Object.keys(top20).map(Number).sort((a, b) => a - b)
  const activeLegend = legends[legendIdx]
  const rankByYear = new Map(activeLegend?.years.map((y) => [y.year, y.rank]) ?? [])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q ? all.filter((e) => e.player.toLowerCase().includes(q)) : all
    return [...filtered].sort((a, b) => compare(a, b, sortKey))
  }, [all, query, sortKey])

  const entries = Object.values(top20).reduce((n, year) => n + year.length, 0)
  const tenPlus = all.filter((e) => e.appearances >= 10).length

  return (
    <section id="hof" className="panel panel__pad hof" data-reveal>
      <div className="hof__head">
        <div className="hof__head-titles">
          <h2 className="hof__title">HALL OF FAME</h2>
          <p className="hof__sub">THE EVERLASTING LEGENDS</p>
        </div>
        <div className="hof__search">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search player..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="搜索选手"
          />
        </div>
        <a className="sec-head__view" href="#hof-list">
          View All
          <i className="fa-solid fa-arrow-right-long" aria-hidden="true" />
        </a>
      </div>

      <div className="legends">
        {legends.map((entry, i) => (
          <button
            key={entry.player}
            className={`legend-card${i === legendIdx ? ' is-active' : ''}`}
            onClick={() => setLegendIdx(i)}
            aria-pressed={i === legendIdx}
          >
            <span className="legend__badge">{String(i + 1).padStart(2, '0')}</span>
            <LegendPhoto name={entry.player} />
            <span className="legend__meta">
              <span className="legend__name">{entry.player}</span>
              <span className="legend__apps">{entry.appearances} APPEARANCES</span>
              <span className="legend__stats">
                <b>{entry.top10s}</b> × TOP10&ensp;<b>{entry.numberOnes}</b> × #1
              </span>
            </span>
          </button>
        ))}
        {activeLegend ? (
          <div className="career">
            <div className="career__head">
              <span className="career__title">Career Timeline</span>
              <span className="career__who">{activeLegend.player}</span>
            </div>
            <div className="career__rule" aria-hidden="true" />
            <div className="career__years" aria-hidden="true">
              {years.map((y) => (
                <span key={y}>{y}</span>
              ))}
            </div>
            <div className="career__dots" aria-hidden="true">
              {years.map((y) => {
                const rank = rankByYear.get(y)
                return <span key={y} className={`career__dot${rank ? ' is-in' : ''}${rank === 1 ? ' is-1' : ''}`} />
              })}
            </div>
            <p className="career__legend">
              {activeLegend.appearances} / {years.length} 年上榜 · 最佳 #{activeLegend.best}
            </p>
          </div>
        ) : null}
      </div>

      <div className="hof__stats" ref={statsRef} data-reveal>
        <HoFStat end={all.length} label="位选手曾上榜" active={statsActive} />
        <HoFStat end={tenPlus} label="上榜 ≥ 10 次" active={statsActive} />
        <HoFStat end={all.filter((e) => e.numberOnes > 0).length} label="曾登顶年度第一" active={statsActive} />
        <HoFStat end={entries} label="个 TOP20 名额" active={statsActive} />
      </div>

      <div className="hof__toolbar" data-reveal>
        <div className="hof__sorts">
          {SORTS.map((s) => (
            <button
              key={s.key}
              className={sortKey === s.key ? 'is-active' : ''}
              onClick={() => setSortKey(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div id="hof-list" data-reveal>
        <ol className="hof__list hof__list--swap" key={`${sortKey}-${query}`}>
          {list.map((entry, i) => (
            <HoFRow key={entry.player} entry={entry} index={i} />
          ))}
          {list.length === 0 ? <li className="hof__empty">没有找到匹配的选手</li> : null}
        </ol>
      </div>
    </section>
  )
}
