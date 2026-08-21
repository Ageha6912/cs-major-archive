import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const OUT = new URL('../shots/', import.meta.url).pathname.replace(/^\//, '')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: EXE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

await page.evaluate(() => document.getElementById('hof')?.scrollIntoView())
await page.waitForTimeout(1200)
await page.screenshot({ path: OUT + 'desktop-hof.png' })

// expand NiKo row (first)
await page.click('.hof-row__main')
await page.waitForTimeout(500)
await page.locator('.hof-row').first().scrollIntoViewIfNeeded()
await page.waitForTimeout(400)
await page.screenshot({ path: OUT + 'desktop-hof-open.png' })

// sort by top10s and search
await page.click('.hof__sorts button:nth-child(2)')
await page.waitForTimeout(300)
await page.fill('.hof__search', 's1mple')
await page.waitForTimeout(400)
const rows = await page.locator('.hof-row').count()
const firstName = await page.locator('.hof-row__name').first().textContent()
console.log('search rows:', rows, 'first:', firstName)

// mobile
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mob.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await mob.waitForTimeout(1000)
await mob.evaluate(() => document.getElementById('hof')?.scrollIntoView())
await mob.waitForTimeout(1200)
await mob.screenshot({ path: OUT + 'mobile-hof.png' })
await mob.click('.hof-row__main')
await mob.waitForTimeout(500)
await mob.screenshot({ path: OUT + 'mobile-hof-open.png' })

console.log('errors:', errors.length)
await browser.close()
