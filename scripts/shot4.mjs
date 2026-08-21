import { chromium } from 'playwright-core'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: EXE, headless: true })
const errors = []

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => errors.push(e.message))
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await page.evaluate(() => document.getElementById('hall')?.scrollIntoView())
await page.waitForTimeout(1200)
await page.screenshot({ path: 'shots/hall-logos.png' })

// broken logo images?
const broken = await page.evaluate(() =>
  Array.from(document.images)
    .filter((img) => img.src.includes('/logos/') && img.complete && img.naturalWidth === 0)
    .map((img) => img.src),
)
console.log('broken logos:', broken.length, broken.slice(0, 5))

await page.click('.hall-card')
await page.waitForTimeout(800)
await page.screenshot({ path: 'shots/detail-logos.png' })

const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mob.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await mob.waitForTimeout(1000)
await mob.evaluate(() => document.getElementById('hall')?.scrollIntoView())
await mob.waitForTimeout(1000)
await mob.screenshot({ path: 'shots/mobile-hall-logos.png' })

console.log('errors:', errors.length)
await browser.close()
