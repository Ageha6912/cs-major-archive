import { chromium } from 'playwright-core'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: EXE, headless: true })
const errors = []

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text())
})
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const canvas = await page.locator('.hero__beams canvas').count()
console.log('beams canvas count:', canvas)
await page.screenshot({ path: 'shots/hero-beams.png' })

// wait a moment and capture motion difference
await page.waitForTimeout(1800)
await page.screenshot({ path: 'shots/hero-beams-2.png' })

// scroll down and back to make sure no runtime errors
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(600)
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(800)

const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
mob.on('pageerror', (e) => errors.push('mobile: ' + e.message))
await mob.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await mob.waitForTimeout(2500)
const mobCanvas = await mob.locator('.hero__beams canvas').count()
console.log('mobile beams canvas count:', mobCanvas)
await mob.screenshot({ path: 'shots/mobile-hero-beams.png' })

console.log('errors:', errors.length)
for (const e of errors.slice(0, 8)) console.log('  ', e.slice(0, 140))
await browser.close()
