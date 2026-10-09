import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import ChampionHall from './components/ChampionHall'
import HallOfFame from './components/HallOfFame'
import Hero from './components/Hero'
import MajorDetail from './components/MajorDetail'
import Timeline from './components/Timeline'
import Top20Section from './components/Top20Section'
import { majors } from './data'
import { gsap } from './lib/motion'
import { useReveal } from './hooks'

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

/** 委托式按压反馈：GSAP 独占这些元素的 transform */
const PRESS_SCALE: [string, number][] = [
  ['.champ-card', 0.98],
  ['.legend-card', 0.98],
  ['.hof-row__main', 0.97],
  ['.video', 0.97],
  ['.detail__nav button', 0.97],
]

const HOVER_LIFT: [string, number][] = [['.detail__nav button', -2]]

function usePressFeedback() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const pressSelector = PRESS_SCALE.map(([s]) => s).join(',')
    const liftSelector = HOVER_LIFT.map(([s]) => s).join(',')
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)')
    let pressed: Element | null = null
    let hovered: Element | null = null

    const matchValue = (el: Element, table: [string, number][]) => {
      for (const [sel, value] of table) if (el.matches(sel)) return value
      return 1
    }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || !(e.target instanceof Element)) return
      const el = e.target.closest(pressSelector)
      if (!el) return
      pressed = el
      gsap.to(el, { scale: matchValue(el, PRESS_SCALE), duration: 0.16, ease: 'power2.out', overwrite: 'auto' })
    }
    const release = () => {
      if (!pressed) return
      const el = pressed
      pressed = null
      gsap.to(el, { scale: 1, duration: 0.2, ease: 'power2.out', overwrite: 'auto', clearProps: 'scale' })
    }

    const onOver = (e: MouseEvent) => {
      if (!canHover.matches || !(e.target instanceof Element)) return
      const el = e.target.closest(liftSelector)
      if (!el || el === hovered) return
      if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return
      hovered = el
      gsap.to(el, { y: matchValue(el, HOVER_LIFT), duration: 0.25, ease: 'power3.out', overwrite: 'auto' })
    }
    const onOut = (e: MouseEvent) => {
      if (!canHover.matches || !(e.target instanceof Element)) return
      const el = e.target.closest(liftSelector)
      if (!el || el !== hovered) return
      if (e.relatedTarget instanceof Node && el.contains(e.relatedTarget)) return
      hovered = null
      gsap.to(el, {
        y: 0,
        duration: 0.25,
        ease: 'power3.out',
        overwrite: 'auto',
        ...(pressed === el ? {} : { clearProps: 'y' }),
      })
    }

    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    window.addEventListener('mouseover', onOver)
    window.addEventListener('mouseout', onOut)
    window.addEventListener('blur', release)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mouseout', onOut)
      window.removeEventListener('blur', release)
    }
  }, [])
}

/** 懒加载资源淡入：捕获阶段委托 load 事件 */
function useMediaLoadFade() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const onLoad = (e: Event) => {
      const t = e.target
      const isFrame = t instanceof HTMLIFrameElement
      if (!isFrame && !(t instanceof HTMLImageElement)) return
      if (t.closest('.page-skeleton')) return
      gsap.fromTo(
        t,
        { opacity: 0 },
        {
          opacity: 1,
          duration: isFrame ? 0.4 : 0.3,
          ease: 'power1.out',
          overwrite: 'auto',
          clearProps: 'opacity',
        },
      )
    }
    document.addEventListener('load', onLoad, true)
    return () => document.removeEventListener('load', onLoad, true)
  }, [])
}

/** 导航 scrollspy：当前所在区块的链接高亮（HOME 绑定 hero，其余绑定各区块） */
function useScrollSpy() {
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav__links a'))
    const pairs = links
      .map((l) => ({
        link: l,
        el:
          l.getAttribute('href') === '#top'
            ? document.querySelector<HTMLElement>('.hero')
            : document.querySelector<HTMLElement>(l.getAttribute('href') ?? ''),
      }))
      .filter((p): p is { link: HTMLAnchorElement; el: HTMLElement } => !!p.el)
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const i = pairs.findIndex((p) => p.el === entry.target)
          if (i >= 0) pairs[i].link.classList.toggle('is-active', entry.isIntersecting)
        }
      },
      { rootMargin: '-25% 0px -65% 0px' },
    )
    pairs.forEach((p) => io.observe(p.el))
    return () => io.disconnect()
  }, [])
}

function EraSwitch({
  eraFilter,
  setEraFilter,
}: {
  eraFilter: 'all' | 'CS:GO' | 'CS2'
  setEraFilter: (v: 'all' | 'CS:GO' | 'CS2') => void
}) {
  const options = [
    { value: 'all', label: 'ALL' },
    { value: 'CS:GO', label: 'CS:GO' },
    { value: 'CS2', label: 'CS2' },
  ] as const
  return (
    <div className="era-switch" role="group" aria-label="按赛事年代筛选">
      {options.map((o) => (
        <button
          key={o.value}
          className={`era-switch__btn${eraFilter === o.value ? ' is-active' : ''}${o.value === 'CS2' ? ' era-cs2' : o.value === 'CS:GO' ? ' era-csgo' : ''}`}
          onClick={() => setEraFilter(o.value)}
          aria-pressed={eraFilter === o.value}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function App() {
  const [eraFilter, setEraFilter] = useState<'all' | 'CS:GO' | 'CS2'>('all')
  const [detailId, setDetailId] = useState<string | null>(null)
  useReveal()
  useScrollSpy()
  usePressFeedback()
  useMediaLoadFade()

  useEffect(() => {
    const ready = requestAnimationFrame(() => document.documentElement.setAttribute('data-page-ready', 'true'))
    return () => cancelAnimationFrame(ready)
  }, [])

  return (
    <div className="shell">
      <div className="bg-fx" aria-hidden="true" />
      <div className={`app${detailId ? ' is-hidden' : ''}`}>
        <ProgressRail />
        <header className="nav">
          <a className="nav__logo" href="#top" aria-label="CS Major Archive 返回页首">
            <span className="nav__mark" aria-hidden="true">
              A
            </span>
            <span className="nav__brand">CS MAJOR ARCHIVE</span>
          </a>
          <nav className="nav__links" aria-label="站点导航">
            <a href="#top">HOME</a>
            <a href="#hall">CHAMPIONS</a>
            <a href="#timeline">TIMELINE</a>
            <a href="#top20">TOP 20</a>
            <a href="#hof">HALL OF FAME</a>
          </nav>
          <EraSwitch eraFilter={eraFilter} setEraFilter={setEraFilter} />
        </header>
        <main id="top">
          <Hero onSelect={setDetailId} />
          <ChampionHall majors={majors} eraFilter={eraFilter} onSelect={setDetailId} />
          <Timeline majors={majors} onSelect={setDetailId} />
          <section className="bottom band" aria-label="HLTV TOP 20 与名人堂">
            <div className="bottom__grid">
              <Top20Section />
              <HallOfFame />
            </div>
          </section>
        </main>
        <footer className="foot">
          <div className="foot__inner">
            <span className="foot__bar" aria-hidden="true" />
            <p className="foot__logo">CS MAJOR ARCHIVE</p>
            <p className="foot__tag">HISTORY LIVES HERE</p>
            <div className="foot__links">
              <a
                href="https://github.com/Ageha6912/cs-major-archive#readme"
                target="_blank"
                rel="noreferrer"
              >
                About
              </a>
              <a href="https://www.hltv.org/" target="_blank" rel="noreferrer">
                Data Sources
              </a>
              <a href="https://github.com/Ageha6912/cs-major-archive" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <span className="sep" aria-hidden="true" />
              <a href="https://github.com/Ageha6912/cs-major-archive" target="_blank" rel="noreferrer" aria-label="GitHub 仓库">
                <i className="fa-brands fa-github" aria-hidden="true" />
              </a>
            </div>
          </div>
        </footer>
        <BackToTop />
      </div>
      <AnimatePresence>
        {detailId ? <MajorDetail id={detailId} onClose={() => setDetailId(null)} onSelect={setDetailId} /> : null}
      </AnimatePresence>
    </div>
  )
}
