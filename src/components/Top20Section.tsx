import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { top20 } from '../data'
import type { Top20Entry } from '../data'
import PlayerAvatar from './PlayerAvatar'

const YEARS = Object.keys(top20).sort()

function Row({ e }: { e: Top20Entry }) {
  return (
    <li className={`top20-row${e.rank === 1 ? ' is-top' : ''}`}>
      <span className="top20-row__rank">{String(e.rank).padStart(2, '0')}</span>
      <PlayerAvatar name={e.player} size={19} />
      <span className="top20-row__id">
        <b>{e.player}</b>
      </span>
      <span className="top20-row__team">{e.team}</span>
    </li>
  )
}

export default function Top20Section() {
  const [year, setYear] = useState('2025')
  const reduce = useReducedMotion()
  const list = top20[year] ?? []
  const left = list.slice(0, 10)
  const right = list.slice(10)

  return (
    <section id="top20" className="panel panel__pad t20" data-reveal>
      <div className="t20__head">
        <span className="sec-head__bar" aria-hidden="true" />
        <h2 className="t20__title">HLTV TOP 20</h2>
        <span className="t20__year">{year}</span>
        <a className="sec-head__view" href="#hof">
          VIEW ALL
          <i className="fa-solid fa-arrow-right-long" aria-hidden="true" />
        </a>
      </div>
      <div className="t20__years">
        {YEARS.map((y) => (
          <button
            key={y}
            className={`yearnav__btn era-csgo ${y === year ? 'is-active' : ''}`}
            onClick={() => setYear(y)}
          >
            {y}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          className="t20__cols"
          key={year}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <ol className="top20__list">
            {left.map((e) => (
              <Row key={e.rank} e={e} />
            ))}
          </ol>
          <ol className="top20__list">
            {right.map((e) => (
              <Row key={e.rank} e={e} />
            ))}
          </ol>
        </motion.div>
      </AnimatePresence>
      <p className="t20__note">排名为 HLTV 当年官方评选 · 队伍为榜单发布时所效力战队</p>
    </section>
  )
}
