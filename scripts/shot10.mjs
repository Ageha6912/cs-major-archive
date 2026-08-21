import { chromium } from 'playwright-core'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: EXE, headless: true })
const errors = []

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
await page.screenshot({ path: 'shots/restore-home.png' })

// hall with report cards
await page.evaluate(() => document.getElementById('hall')?.scrollIntoView())
await page.waitForTimeout(1000)
await page.screenshot({ path: 'shots/restore-hall.png' })

// wheel -> horizontal scroll on hall shelf
await page.mouse.move(720, 600)
await page.mouse.wheel(0, 1200)
await page.waitForTimeout(700)
await page.screenshot({ path: 'shots/restore-hall-scrolled.png' })

// roster ticker change after 3.5s
const ticker1 = await page.locator('.hall-card__player').first().textContent()
await page.waitForTimeout(3600)
const ticker2 = await page.locator('.hall-card__player').first().textContent()
console.log('ticker:', ticker1, '->', ticker2)

// era filter (regression: was blocked by beams canvas before)
await page.evaluate(() => document.querySelector('.hall__shelf')?.scrollTo({ left: 0 }))
await page.click('.era-filter button:nth-child(3)')
await page.waitForTimeout(500)
const cs2Count = await page.locator('.hall-card').count()
console.log('CS2 filter cards:', cs2Count)

// click card -> detail modal (old MajorDetail)
await page.click('.hall-card')
await page.waitForTimeout(900)
await page.screenshot({ path: 'shots/restore-detail.png' })
await page.keyboard.press('Escape')
await page.waitForTimeout(500)

// timeline collapsed toggle
await page.evaluate(() => document.getElementById('timeline')?.scrollIntoView())
await page.waitForTimeout(800)
const tlBefore = await page.locator('.tl__item').count()
await page.click('.tl__toggle')
await page.waitForTimeout(700)
const tlAfter = await page.locator('.tl__item').count()
console.log('timeline items:', tlBefore, '->', tlAfter)

// mobile
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
mob.on('pageerror', (e) => errors.push('mobile: ' + e.message))
await mob.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await mob.waitForTimeout(1800)
await mob.evaluate(() => document.getElementById('hall')?.scrollIntoView())
await mob.waitForTimeout(800)
await mob.screenshot({ path: 'shots/restore-mobile-hall.png' })

console.log('errors:', errors.length)
for (const e of errors.slice(0, 6)) console.log('  ', e.slice(0, 140))
await browser.close()
