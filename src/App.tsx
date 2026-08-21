import { Suspense, lazy, useEffect, useState } from 'react'
import ChampionHall from './components/ChampionHall'
import HallOfFame from './components/HallOfFame'
import Hero from './components/Hero'
import MajorDetail from './components/MajorDetail'
import Timeline from './components/Timeline'
import Top20Section from './components/Top20Section'
import { majors } from './data'
import { useReveal, useScrollProgress } from './hooks'

const Beams = lazy(() => import('./components/Beams'))

function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      className={`to-top ${show ? 'is-visible' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="回到顶部"
      title="回到顶部"
    >
      ↑
    </button>
  )
}

export default function App() {
  const [eraFilter, setEraFilter] = useState<'all' | 'CS:GO' | 'CS2'>('all')
  const [detailId, setDetailId] = useState<string | null>(null)
  const progress = useScrollProgress()
  useReveal()

  const scrollToHall = () => {
    document.getElementById('hall')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="shell">
      <Suspense fallback={<div className="beams-bg" aria-hidden="true" />}>
        <div className="beams-bg" aria-hidden="true">
          <Beams
            beamWidth={1.7}
            beamHeight={16}
            beamNumber={10}
            lightColor="#e7c87c"
            speed={
              typeof window !== 'undefined' &&
              window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 0
                : 1.8
            }
            noiseIntensity={1.4}
            scale={0.22}
            rotation={0}
            sideLights
          />
          <div className="beams-bg__veil" />
        </div>
      </Suspense>
      <div className={`app${detailId ? ' is-hidden' : ''}`}>
        <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
        <nav className="nav">
          <a className="nav__logo" href="#top">
            CS<span>MAJOR</span>
            <i>ARCHIVE</i>
          </a>
          <div className="nav__links">
            <a href="#hall">冠军殿堂</a>
            <a href="#timeline">编年史</a>
            <a href="#top20">TOP20</a>
            <a href="#hof">名人堂</a>
          </div>
        </nav>
        <main id="top">
          <Hero onBrowse={scrollToHall} />
          <div className="era-filter" data-reveal>
            <button className={eraFilter === 'all' ? 'is-active' : ''} onClick={() => setEraFilter('all')}>
              全部 24 届
            </button>
            <button className={eraFilter === 'CS:GO' ? 'is-active' : ''} onClick={() => setEraFilter('CS:GO')}>
              CS:GO 时代
            </button>
            <button className={eraFilter === 'CS2' ? 'is-active' : ''} onClick={() => setEraFilter('CS2')}>
              CS2 时代
            </button>
          </div>
          <ChampionHall majors={majors} eraFilter={eraFilter} onSelect={setDetailId} />
          <Timeline majors={majors} onSelect={setDetailId} />
          <Top20Section />
          <HallOfFame />
        </main>
        <footer className="foot">
          <p>CS MAJOR ARCHIVE · 数据整理自 Wikipedia / HLTV · 视频版权归原作者所有</p>
        </footer>
        <BackToTop />
      </div>
      {detailId ? <MajorDetail id={detailId} onClose={() => setDetailId(null)} onSelect={setDetailId} /> : null}
    </div>
  )
}
