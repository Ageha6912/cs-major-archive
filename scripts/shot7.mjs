import { chromium } from 'playwright-core'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: EXE, headless: true })
const errors = []

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)

// fixed background canvas present
const bgCanvas = await page.locator('.beams-bg canvas').count()
console.log('global beams canvas:', bgCanvas)
await page.screenshot({ path: 'shots/page-hero.png' })

// mid page — timeline / top20 area
await page.evaluate(() => document.getElementById('top20')?.scrollIntoView())
await page.waitForTimeout(1200)
await page.screenshot({ path: 'shots/page-top20.png' })

// very bottom — hall of fame
await page.evaluate(() => document.getElementById('hof')?.scrollIntoView())
await page.waitForTimeout(1200)
await page.screenshot({ path: 'shots/page-hof.png' })

// detail overlay over beams
await page.evaluate(() => document.getElementById('hall')?.scrollIntoView())
await page.waitForTimeout(600)
await page.click('.hall-card')
await page.waitForTimeout(1000)
await page.screenshot({ path: 'shots/page-detail.png' })

// mobile
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
mob.on('pageerror', (e) => errors.push('mobile: ' + e.message))
await mob.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await mob.waitForTimeout(2500)
await mob.evaluate(() => document.getElementById('top20')?.scrollIntoView())
await mob.waitForTimeout(1000)
await mob.screenshot({ path: 'shots/page-mobile-top20.png' })

console.log('errors:', errors.length)
for (const e of errors.slice(0, 6)) console.log('  ', e.slice(0, 140))
await browser.close()
