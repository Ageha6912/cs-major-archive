import { useEffect, useRef, useState } from 'react'
import crowdTex from '../assets/archive/crowd-tex.jpg'
import heroTrophy from '../assets/archive/hero-trophy.jpg'
import arenaStrip from '../assets/archive/arena-strip2.jpg'
import { eventName, formatPurse, majors, ORGANIZERS, top20 } from '../data'
import { useCountUp } from '../hooks'
import TeamLogo from './TeamLogo'

function Stat({ end, label, active }: { end: number; label: string; active: boolean }) {
  const value = useCountUp(end, active)
  return (
    <div className="hero-stat">
      <span className="hero-stat__num">{value}</span>
      <span className="hero-stat__label">{label}</span>
    </div>
  )
}

export default function Hero({ onSelect }: { onSelect: (id: string) => void }) {
  const ref = useRef<HTMLElement>(null)
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

  const featured = majors[majors.length - 1]
  const goCount = new Set(majors.map((m) => m.champion.team)).size
  const cityCount = new Set(majors.map((m) => m.location)).size
  const top20YearCount = Object.keys(top20).length

  return (
    <header className="hero" ref={ref}>
      <div className="hero__bg" style={{ ['--hero-photo' as string]: `url(${crowdTex})` }} aria-hidden="true" />
      <div className="hero__trophy" style={{ ['--trophy-photo' as string]: `url(${heroTrophy})` }} aria-hidden="true" />
      <div className="hero__shade" aria-hidden="true" />
      <div className="hero__inner">
        <div className="hero__main">
          <p className="hero__kicker">THE HISTORY OF</p>
          <h1 className="hero__title">
            <span className="hero__title-mask">
              <span className="hero__title-line">COUNTER-STRIKE</span>
            </span>
            <span className="hero__title-mask">
              <span className="hero__title-line hero__title-line--accent">MAJORS</span>
            </span>
          </h1>
          <p className="hero__years">
            2013 <i aria-hidden="true">—</i> 2026
          </p>
          <div className="hero__stats">
            <Stat end={majors.length} label="MAJORS" active={active} />
            <Stat end={goCount} label="CHAMPION TEAMS" active={active} />
            <Stat end={top20YearCount} label="TOP20 YEARS" active={active} />
            <Stat end={cityCount} label="HOST CITIES" active={active} />
          </div>
        </div>

        <p className="hero__quote">
          Not just a game,
          <br />
          but a history of
          <br />
          extraordinary people.
        </p>

        <aside className="feat">
          <div className="feat__body">
            <div className="feat__head">
              <p className="feat__kicker">
                <i className="fa-solid fa-trophy" aria-hidden="true" />
                FEATURED MAJOR
              </p>
              <button className="feat__view" onClick={() => onSelect(featured.id)}>
                VIEW ALL
                <i className="fa-solid fa-arrow-right-long" aria-hidden="true" />
              </button>
            </div>
            <h2 className="feat__title">
              {(ORGANIZERS[featured.id]?.label ?? eventName(featured.fullName, featured.year)) + ' ' + featured.name}
            </h2>
            <p className="feat__sub">{featured.location}</p>
            <div className="feat__duel">
              <div className="feat__team feat__team--champ">
                <TeamLogo team={featured.champion.team} size={54} />
                <b>{featured.champion.team}</b>
                <span className="feat__tag">CHAMPION</span>
              </div>
              <div className="feat__score">{featured.score.replace('–', ' : ')}</div>
              <div className="feat__team">
                <TeamLogo team={featured.runnerUp.team} size={54} />
                <b>{featured.runnerUp.team}</b>
                <span className="feat__tag">RUNNER-UP</span>
              </div>
            </div>
            <div className="feat__meta">
              <span>
                <i className="fa-solid fa-location-dot" aria-hidden="true" />
                {featured.location}
              </span>
              <span>
                <i className="fa-solid fa-coins" aria-hidden="true" />
                {formatPurse(featured.purse)}
              </span>
              <span>
                <i className="fa-solid fa-calendar-days" aria-hidden="true" />
                {featured.dates}
              </span>
            </div>
          </div>
          <div className="feat__photo" style={{ ['--feat-photo' as string]: `url(${arenaStrip})` }} aria-hidden="true" />
        </aside>
      </div>
    </header>
  )
}
