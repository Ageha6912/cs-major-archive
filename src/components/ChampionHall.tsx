import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CITY_ZH, ORGANIZERS, teamColor, visualPeriod } from '../data'
import type { Major } from '../data'
import TeamLogo from './TeamLogo'

function HallCard({ major, onSelect }: { major: Major; onSelect: (id: string) => void }) {
  const color = teamColor(major.champion.team)
  const org = ORGANIZERS[major.id]
  const roster = major.champion.roster
  const [playerIndex, setPlayerIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setPlayerIndex((prev) => (prev + 1) % roster.length), 3500)
    return () => clearInterval(timer)
  }, [roster.length])

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={() => onSelect(major.id)}
      className={`hall-card era-${major.era === 'CS2' ? 'cs2' : 'csgo'} period-${visualPeriod(major.year)}`}
      style={{ ['--team-color' as string]: color }}
    >
      {/* 顶部环境光晕 */}
      <span className="hall-card__glow" aria-hidden="true" />

      {/* Header：年份 + 赛事名 + 主办方 */}
      <header className="hall-card__head">
        <span className="hall-card__title">
          {major.year}年{CITY_ZH[major.id]}锦标赛
        </span>
        <span className="hall-card__subtitle">{major.fullName}</span>
        <span className="hall-card__org">
          {org.logo ? (
            <img src={org.logo} alt={org.label} />
          ) : (
            <span className="hall-card__org-text">{org.label}</span>
          )}
        </span>
      </header>

      {/* 冠军英雄区 */}
      <div className="hall-card__hero">
        <span className="hall-card__champ-label">★ 锦标赛冠军</span>
        <TeamLogo team={major.champion.team} size={88} className="hall-card__champ-logo" />
        <b className="hall-card__champ-name">{major.champion.team}</b>
        <div className="hall-card__ticker">
          <AnimatePresence mode="wait">
            <motion.span
              key={playerIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="hall-card__player"
            >
              {roster[playerIndex]}
            </motion.span>
          </AnimatePresence>
        </div>
        <span className="hall-card__roster-tag">ROSTER</span>
      </div>

      <div className="hall-card__divider" aria-hidden="true" />

      {/* 梯级赛果 */}
      <div className="hall-card__brackets">
        <div className="hall-tier">
          <span className="hall-tier__label">决赛选手</span>
          <span className="hall-tier__row">
            <TeamLogo team={major.runnerUp.team} size={18} />
            <span>{major.runnerUp.team}</span>
          </span>
        </div>
        <div className="hall-tier">
          <span className="hall-tier__label">半决赛选手</span>
          <span className="hall-tier__grid">
            {major.semifinalists.map((t) => (
              <span className="hall-tier__row" key={t}>
                <TeamLogo team={t} size={15} />
                <span>{t}</span>
              </span>
            ))}
          </span>
        </div>
        <div className="hall-tier">
          <span className="hall-tier__label">四分之一决赛选手</span>
          <span className="hall-tier__grid">
            {major.quarterfinalists.map((t) => (
              <span className="hall-tier__row" key={t}>
                <TeamLogo team={t} size={14} />
                <span>{t}</span>
              </span>
            ))}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export default function ChampionHall({
  majors,
  eraFilter,
  onSelect,
}: {
  majors: Major[]
  eraFilter: 'all' | 'CS:GO' | 'CS2'
  onSelect: (id: string) => void
}) {
  const shelfRef = useRef<HTMLDivElement>(null)
  const yearsRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)
  const [activeIdx, setActiveIdx] = useState(0)
  const list = (eraFilter === 'all' ? majors : majors.filter((m) => m.era === eraFilter)).slice().reverse()

  useEffect(() => {
    const el = shelfRef.current
    if (el) el.scrollTo({ left: 0 })
    yearsRef.current?.scrollTo({ left: 0 })
    setActiveIdx(0)
  }, [eraFilter])

  // 活跃年份卡片在轨道中保持居中，形成“跟随滚动”的寻路反馈。
  // 只滚动轨道自身，绝不能用 scrollIntoView —— 它会把整页窗口滚离原位。
  useEffect(() => {
    const rail = yearsRef.current
    const btn = rail?.children[activeIdx] as HTMLElement | undefined
    if (!rail || !btn) return
    const target = btn.offsetLeft - (rail.clientWidth - btn.offsetWidth) / 2
    rail.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
  }, [activeIdx])

  useEffect(() => {
    const el = shelfRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      e.preventDefault()
      el.scrollLeft += (e.deltaMode === 1 ? 28 : 1) * e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onScroll = () => {
    const el = shelfRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setProgress(max > 0 ? el.scrollLeft / max : 0)
    const cards = el.querySelectorAll<HTMLElement>('.hall-card')
    let nearest = 0
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i]
      if (card.offsetLeft - el.offsetLeft <= el.scrollLeft + 12) nearest = i
      else break
    }
    setActiveIdx(nearest)
  }

  const jumpTo = (i: number) => {
    const el = shelfRef.current
    const card = el?.querySelectorAll<HTMLElement>('.hall-card')[i]
    if (!el || !card) return
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 4, behavior: 'smooth' })
    setActiveIdx(i)
  }

  return (
    <section className="hall section" id="hall">
      <div className="section-head" data-reveal>
        <p className="section-head__kicker">CHAMPIONS HALL</p>
        <h2 className="section-head__title">冠军殿堂</h2>
        <p className="section-head__desc">
          从 2026 年科隆的新王，回溯到 2013 年延雪平的初代冠军——每一届的冠军、决赛与四强都在这里列队。
        </p>
      </div>
      <div className="hall__years" ref={yearsRef} data-reveal>
        {list.map((m, i) => (
          <button
            key={m.id}
            className={`hall__year ${i === activeIdx ? 'is-active' : ''}`}
            onClick={() => jumpTo(i)}
            title={m.fullName}
          >
            {m.year}
          </button>
        ))}
      </div>
      <div className="hall__shelf" ref={shelfRef} onScroll={onScroll} data-reveal>
        <div className="hall__swap" key={eraFilter}>
          {list.map((m) => (
            <HallCard key={m.id} major={m} onSelect={onSelect} />
          ))}
        </div>
      </div>
      <div className="hall__progress" data-reveal>
        <div className="hall__progress-track">
          <div className="hall__progress-fill" style={{ width: `${Math.max(3, progress * 100)}%` }} />
        </div>
      </div>
      <p className="hall__hint" data-reveal>
        滚轮横向浏览 · 点击任意一届进入详情
      </p>
    </section>
  )
}
