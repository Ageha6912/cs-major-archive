import { chromium } from 'playwright-core'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: EXE, headless: true })
const errors = []

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
await page.evaluate(() => document.getElementById('hall')?.scrollIntoView())
await page.waitForTimeout(1000)
await page.screenshot({ path: 'shots/hall-final.png' })

const broken = await page.evaluate(() =>
  Array.from(document.images)
    .filter((img) => img.src.includes('/logos/') && img.complete && img.naturalWidth === 0)
    .map((img) => img.src),
)
console.log('broken logos:', broken.length, broken.slice(0, 4))

// scroll shelf to the right to see CS2-era cards
await page.evaluate(() => {
  const shelf = document.querySelector('.hall__shelf')
  shelf?.scrollTo({ left: shelf.scrollWidth, behavior: 'instant' })
})
await page.waitForTimeout(900)
await page.screenshot({ path: 'shots/hall-final-right.png' })

// CS2 filter
await page.evaluate(() => document.querySelector('.hall__shelf')?.scrollTo({ left: 0 }))
await page.click('.era-filter button:nth-child(3)')
await page.waitForTimeout(600)
await page.screenshot({ path: 'shots/hall-cs2.png' })

// mobile
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mob.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await mob.waitForTimeout(1500)
await mob.evaluate(() => document.getElementById('hall')?.scrollIntoView())
await mob.waitForTimeout(800)
await mob.screenshot({ path: 'shots/hall-mobile.png' })

console.log('errors:', errors.length)
await browser.close()
