import { useEffect, useRef, useState } from 'react'
import crowdTex from '../assets/archive/crowd-tex.jpg'
import { eventName } from '../data'
import type { Major } from '../data'
import TeamLogo from './TeamLogo'

function ChampCard({ major, onSelect }: { major: Major; onSelect: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(major.id)}
      className="champ-card"
      title={major.fullName}
    >
      <span className="champ-card__tex" style={{ ['--card-tex' as string]: `url(${crowdTex})` }} aria-hidden="true" />
      <span className="champ-card__year">{major.year}</span>
      <span className="champ-card__event">{eventName(major.fullName, major.year)}</span>
      <span className="champ-card__logo">
        <TeamLogo team={major.champion.team} size={58} />
      </span>
      <span className="champ-card__team">{major.champion.team}</span>
      <span className="champ-card__score">{major.score.replace('–', ' : ')}</span>
      <span className="champ-card__runner">{major.runnerUp.team}</span>
    </button>
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
  const stripRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const list = (eraFilter === 'all' ? majors : majors.filter((m) => m.era === eraFilter)).slice().reverse()

  useEffect(() => {
    stripRef.current?.scrollTo({ left: 0 })
    updateArrows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eraFilter])

  const updateArrows = () => {
    const el = stripRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 4)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  const step = (dir: 1 | -1) => {
    const el = stripRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' })
  }

  return (
    <section className="champ band" id="hall">
      <div className="sec-head" data-reveal>
        <span className="sec-head__bar" aria-hidden="true" />
        <h2 className="sec-head__title">CHAMPIONS</h2>
        <span className="sec-head__sub">
          / 01 — {String(list.length).padStart(2, '0')}
        </span>
        <a className="sec-head__view" href="#timeline">
          VIEW ALL
          <i className="fa-solid fa-arrow-right-long" aria-hidden="true" />
        </a>
      </div>
      <div className="champ__wrap" data-reveal>
        <button
          className="champ__arrow champ__arrow--l"
          onClick={() => step(-1)}
          disabled={!canLeft}
          aria-label="向左滚动冠军卡"
        >
          <i className="fa-solid fa-chevron-left" aria-hidden="true" />
        </button>
        <div className="champ__strip" ref={stripRef} onScroll={updateArrows}>
          {list.map((m) => (
            <ChampCard key={m.id} major={m} onSelect={onSelect} />
          ))}
        </div>
        <button
          className="champ__arrow champ__arrow--r"
          onClick={() => step(1)}
          disabled={!canRight}
          aria-label="向右滚动冠军卡"
        >
          <i className="fa-solid fa-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
