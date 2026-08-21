import { chromium } from 'playwright-core'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: EXE, headless: true })
const errors = []

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1400)
await page.screenshot({ path: 'shots/hero-side.png' })

// timeline collapsed
await page.evaluate(() => document.getElementById('timeline')?.scrollIntoView())
await page.waitForTimeout(1000)
await page.screenshot({ path: 'shots/timeline-collapsed.png' })

const itemCountBefore = await page.locator('.tl__item').count()
await page.click('.tl__toggle')
await page.waitForTimeout(900)
const itemCountAfter = await page.locator('.tl__item').count()
console.log('timeline items before/after:', itemCountBefore, itemCountAfter)
await page.screenshot({ path: 'shots/timeline-expanded.png' })

// back to top
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(400)
const visibleAtTop = await page.locator('.to-top.is-visible').count()
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(600)
const visibleAtBottom = await page.locator('.to-top.is-visible').count()
console.log('to-top at top/bottom:', visibleAtTop, visibleAtBottom)
await page.screenshot({ path: 'shots/totop.png' })
await page.click('.to-top')
await page.waitForTimeout(900)
const scrolledTop = await page.evaluate(() => window.scrollY)
console.log('after click scrollY:', scrolledTop)

// smaller desktop where side panel still shows
const page2 = await browser.newPage({ viewport: { width: 1180, height: 800 } })
await page2.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page2.waitForTimeout(1000)
const sideVisible = await page2.locator('.hero__side').isVisible()
console.log('hero side visible @1180:', sideVisible)

// mobile
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mob.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await mob.waitForTimeout(1000)
const sideMobile = await mob.locator('.hero__side').isVisible()
await mob.screenshot({ path: 'shots/mobile-hero2.png' })
await mob.evaluate(() => document.getElementById('timeline')?.scrollIntoView())
await mob.waitForTimeout(800)
await mob.screenshot({ path: 'shots/mobile-timeline-collapsed.png' })
await mob.click('.tl__toggle')
await mob.waitForTimeout(700)
const mobItems = await mob.locator('.tl__item').count()
console.log('mobile side visible:', sideMobile, '| items after expand:', mobItems)

console.log('errors:', errors.length)
await browser.close()
