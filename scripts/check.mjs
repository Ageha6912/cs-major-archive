import { chromium } from 'playwright-core'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: EXE, headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const errors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push('console: ' + msg.text())
})
page.on('pageerror', (err) => errors.push('pageerror: ' + err.message))
page.on('requestfailed', (req) => {
  if (req.url().includes('youtube') || req.url().includes('ytimg')) {
    errors.push('netfail: ' + req.url().slice(0, 90))
  }
})

await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

// broken images?
const broken = await page.evaluate(() =>
  Array.from(document.images)
    .filter((img) => img.complete && img.naturalWidth === 0)
    .map((img) => img.src.slice(0, 90)),
)
console.log('broken images:', broken.length, broken.slice(0, 5))

// era filter interaction
await page.click('.era-filter button:nth-child(3)')
await page.waitForTimeout(300)
const cs2Count = await page.locator('.hall-card').count()
console.log('CS2 cards:', cs2Count)
await page.click('.era-filter button:nth-child(2)')
await page.waitForTimeout(300)
const csgoCount = await page.locator('.hall-card').count()
console.log('CSGO cards:', csgoCount)

// top20 year switch
await page.evaluate(() => document.getElementById('top20')?.scrollIntoView())
await page.waitForTimeout(400)
await page.click('.top20__year >> text=2016')
await page.waitForTimeout(300)
const first2016 = await page.locator('.top20-podium__player').first().textContent()
console.log('top20 2016 #1:', first2016)

// detail + keyboard nav
await page.evaluate(() => document.getElementById('hall')?.scrollIntoView())
await page.waitForTimeout(400)
await page.click('.hall-card')
await page.waitForTimeout(600)
const title = await page.locator('.detail__title').textContent()
console.log('detail:', title)
await page.keyboard.press('ArrowRight')
await page.waitForTimeout(600)
const title2 = await page.locator('.detail__title').textContent()
console.log('detail next:', title2)
await page.keyboard.press('Escape')
await page.waitForTimeout(400)
console.log('detail closed:', (await page.locator('.detail').count()) === 0)

// video click-to-play on detail
await page.click('.hall-card:nth-child(2)')
await page.waitForTimeout(500)
await page.evaluate(() => window.scrollTo(0, 99999))
await page.waitForTimeout(400)
const hasVideo = await page.locator('.video--cover').count()
console.log('detail videos:', hasVideo)

console.log('errors:', errors.length)
for (const e of errors.slice(0, 10)) console.log('  ', e)
await browser.close()
