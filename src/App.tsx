import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ChampionHall from './components/ChampionHall'
import HallOfFame from './components/HallOfFame'
import Hero from './components/Hero'
import MajorDetail from './components/MajorDetail'
import Timeline from './components/Timeline'
import Top20Section from './components/Top20Section'
import { majors } from './data'
import { useReveal } from './hooks'

const SideRays = lazy(() => import('./components/SideRays'))

/** 滚动进度条：直接写 DOM transform，避免每帧重渲染整棵树 */
function ProgressRail() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? doc.scrollTop / max : 0})`
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
  }, [])
  return <div className="progress" ref={ref} style={{ transform: 'scaleX(0)' }} aria-hidden="true" />
}

function BackToTop() {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      ref.current?.classList.toggle('is-visible', window.scrollY > 700)
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
  return (
    <button
      ref={ref}
      className="to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="回到顶部"
      title="回到顶部"
    >
      ↑
    </button>
  )
}

/** 导航 scrollspy：当前所在区块的链接高亮 */
function useScrollSpy() {
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav__links a'))
    const sections = links
      .map((l) => document.querySelector<HTMLElement>(l.getAttribute('href') ?? ''))
      .filter((el): el is HTMLElement => !!el)
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = sections.indexOf(entry.target as HTMLElement)
          if (i >= 0) links[i].classList.toggle('is-active', entry.isIntersecting)
        }
      },
      { rootMargin: '-25% 0px -65% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])
}

export default function App() {
  const [eraFilter, setEraFilter] = useState<'all' | 'CS:GO' | 'CS2'>('all')
  const [detailId, setDetailId] = useState<string | null>(null)
  useReveal()
  useScrollSpy()

  useEffect(() => {
    const ready = requestAnimationFrame(() => document.documentElement.setAttribute('data-page-ready', 'true'))
    return () => cancelAnimationFrame(ready)
  }, [])

  const scrollToHall = () => {
    document.getElementById('hall')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="shell">
      <Suspense fallback={<div className="bg-fx" aria-hidden="true" />}>
        <div className="bg-fx" aria-hidden="true">
          <SideRays
            speed={2}
            rayColor1="#d8b45c"
            rayColor2="#96c8ff"
            intensity={2.2}
            spread={2.2}
            origin="top-right"
            saturation={1.4}
            blend={0.72}
            falloff={1.5}
            opacity={1}
          />
          <div className="bg-fx__veil" />
        </div>
      </Suspense>
      <div className={`app${detailId ? ' is-hidden' : ''}`}>
        <ProgressRail />
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
      <AnimatePresence>
        {detailId ? <MajorDetail id={detailId} onClose={() => setDetailId(null)} onSelect={setDetailId} /> : null}
      </AnimatePresence>
    </div>
  )
}
