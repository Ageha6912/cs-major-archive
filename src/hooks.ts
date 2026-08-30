import { useEffect, useRef, useState } from 'react'

/** Adds `is-in` to elements with `[data-reveal]` when scrolled into view. */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const reveal = (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        ;(entry.target as HTMLElement).classList.add('is-in')
        io.unobserve(entry.target)
        tallIo.unobserve(entry.target)
      }
    }
    const options = { rootMargin: '0px 0px -40px 0px' } as const
    const io = new IntersectionObserver((entries) => entries.forEach(reveal), { ...options, threshold: 0.12 })
    // Elements taller than the viewport can never reach a 0.12 ratio; reveal them on first intersection.
    const tallIo = new IntersectionObserver((entries) => entries.forEach(reveal), { ...options, threshold: 0 })
    els.forEach((el) =>
      (el.getBoundingClientRect().height > window.innerHeight * 0.6 ? tallIo : io).observe(el),
    )
    return () => {
      io.disconnect()
      tallIo.disconnect()
    }
  }, [])
}

/** Counts from 0 to `end` once `active` becomes true. */
export function useCountUp(end: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(end * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, end, duration])
  return value
}

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const max = doc.scrollHeight - doc.clientHeight
      setProgress(max > 0 ? doc.scrollTop / max : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return progress
}

export function useLockBody(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [locked])
}

export function useOnKey(keys: string[], handler: () => void, enabled = true) {
  const ref = useRef(handler)
  useEffect(() => {
    ref.current = handler
  })
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (keys.includes(e.key)) ref.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [keys, enabled])
}
