import { useMemo, useState } from 'react'
import { hallOfFame, top20 } from '../data'
import type { HoFEntry } from '../data'
import PlayerAvatar from './PlayerAvatar'

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

function HoFRow({ entry, index }: { entry: HoFEntry; index: number }) {
  const [open, setOpen] = useState(false)
  const tier = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''
  return (
    <li className={`hof-row ${tier ? `hof-row--${tier}` : ''}`}>
      <button className="hof-row__main" onClick={() => setOpen((v) => !v)}>
        <span className="hof-row__no">{index + 1}</span>
        <PlayerAvatar name={entry.player} size={30} />
        <span className="hof-row__name">{entry.player}</span>
        <span className="hof-row__stat">
          <b>{entry.appearances}</b>次上榜
        </span>
        <span className="hof-row__stat">
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
      {open ? (
        <div className="hof-row__detail">
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
      ) : null}
    </li>
  )
}

export default function HallOfFame() {
  const all = useMemo(() => hallOfFame(), [])
  const [sortKey, setSortKey] = useState<SortKey>('appearances')
  const [query, setQuery] = useState('')

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q ? all.filter((e) => e.player.toLowerCase().includes(q)) : all
    return [...filtered].sort((a, b) => compare(a, b, sortKey))
  }, [all, query, sortKey])

  const entries = Object.values(top20).reduce((n, year) => n + year.length, 0)
  const tenPlus = all.filter((e) => e.appearances >= 10).length

  return (
    <section className="hof section" id="hof">
      <div className="section-head" data-reveal>
        <p className="section-head__kicker">HALL OF FAME · 名人堂</p>
        <h2 className="section-head__title">常青树榜单</h2>
        <p className="section-head__desc">
          把 2013—2025 共 {entries} 个 TOP20 名额叠加起来：谁的名字出现得最多？谁最多次站上第一？
        </p>
      </div>
      <div className="hof__stats" data-reveal>
        <div>
          <b>{all.length}</b>
          <span>不同选手曾上榜</span>
        </div>
        <div>
          <b>{tenPlus}</b>
          <span>上榜 ≥ 10 次</span>
        </div>
        <div>
          <b>{all.filter((e) => e.numberOnes > 0).length}</b>
          <span>曾登顶年度第一</span>
        </div>
        <div>
          <b>{all.filter((e) => e.top10s >= 5).length}</b>
          <span>前十 ≥ 5 次</span>
        </div>
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
        <input
          className="hof__search"
          type="search"
          placeholder="搜索选手名…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <ol className="hof__list" data-reveal>
        {list.map((entry, i) => (
          <HoFRow key={entry.player} entry={entry} index={i} />
        ))}
        {list.length === 0 ? <li className="hof__empty">没有找到匹配的选手</li> : null}
      </ol>
    </section>
  )
}
