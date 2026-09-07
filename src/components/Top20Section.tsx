import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { top20 } from '../data'
import type { Top20Entry } from '../data'
import PlayerAvatar from './PlayerAvatar'

const YEARS = Object.keys(top20).sort()

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function PodiumCard({ e, tier }: { e?: Top20Entry; tier: string }) {
  if (!e) return null
  return (
    <div className={`top20-podium__card top20-podium__card--${tier}`}>
      <PlayerAvatar name={e.player} size={92} />
      <span className="top20-podium__rank">{e.rank === 1 ? 'NO.1' : `#${e.rank}`}</span>
      <span className="top20-podium__player">{e.player}</span>
      <span className="top20-podium__meta">
        <span>{e.country}</span>
        <span>{e.team}</span>
      </span>
    </div>
  )
}

export default function Top20Section() {
  const [year, setYear] = useState('2025')
  const reduce = useReducedMotion()
  const list = top20[year] ?? []
  const podium = list.slice(0, 3)
  const rest = list.slice(3)

  return (
    <section className="top20 section" id="top20">
      <div className="section-head" data-reveal>
        <p className="section-head__kicker">HLTV TOP 20 PLAYERS OF THE YEAR</p>
        <h2 className="section-head__title">年度最佳选手 TOP20</h2>
        <p className="section-head__desc">HLTV 官方年度评选 · 2013-2025，十三年的顶尖个人榜单。</p>
      </div>
      <div className="top20__years" data-reveal>
        {YEARS.map((y) => (
          <button key={y} className={`top20__year ${y === year ? 'is-active' : ''}`} onClick={() => setYear(y)}>
            {y}
          </button>
        ))}
      </div>
      <div data-reveal>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            className="top20__podium"
            key={year}
            initial={reduce ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -14 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <PodiumCard e={podium[1]} tier="silver" />
            <PodiumCard e={podium[0]} tier="gold" />
            <PodiumCard e={podium[2]} tier="bronze" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div data-reveal>
        <AnimatePresence mode="wait" initial={false}>
          <motion.ol
            className="top20__list"
            key={year}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {rest.map((e, idx) => (
              <motion.li
                key={e.rank}
                className="top20-row"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: reduce ? 0 : 0.028 * idx, ease: EASE }}
              >
                <span className="top20-row__rank">{e.rank}</span>
                <span className="top20-row__flag">{e.country}</span>
                <PlayerAvatar name={e.player} size={30} />
                <span className="top20-row__player">{e.player}</span>
                <span className="top20-row__team">{e.team}</span>
              </motion.li>
            ))}
          </motion.ol>
        </AnimatePresence>
      </div>
      <p className="top20__note" data-reveal>
        队伍为该选手当年榜单发布时所效力战队
      </p>
    </section>
  )
}
