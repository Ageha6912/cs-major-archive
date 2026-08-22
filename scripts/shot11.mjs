import { chromium } from 'playwright-core'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: EXE, headless: true })
const errors = []

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
const canvas = await page.locator('.bg-fx canvas').count()
console.log('siderays canvas:', canvas)
await page.screenshot({ path: 'shots/rays-home.png' })

// animation check: two frames differ
await page.waitForTimeout(1600)
await page.screenshot({ path: 'shots/rays-home-2.png' })

// era filter still clickable (pointer-events regression)
await page.evaluate(() => document.getElementById('hall')?.scrollIntoView())
await page.waitForTimeout(800)
await page.click('.era-filter button:nth-child(3)')
await page.waitForTimeout(400)
console.log('CS2 cards:', await page.locator('.hall-card').count())

// mobile
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
mob.on('pageerror', (e) => errors.push('mobile: ' + e.message))
await mob.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await mob.waitForTimeout(2200)
await mob.screenshot({ path: 'shots/rays-mobile.png' })

console.log('errors:', errors.length)
for (const e of errors.slice(0, 6)) console.log('  ', e.slice(0, 140))
await browser.close()
