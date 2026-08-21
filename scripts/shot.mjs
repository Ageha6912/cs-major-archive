import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const OUT = new URL('../shots/', import.meta.url).pathname.replace(/^\//, '')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: EXE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1400)
await page.screenshot({ path: OUT + 'desktop-hero.png' })

// scroll through sections
await page.evaluate(() => document.getElementById('hall')?.scrollIntoView())
await page.waitForTimeout(1200)
await page.screenshot({ path: OUT + 'desktop-hall.png' })

await page.evaluate(() => document.getElementById('timeline')?.scrollIntoView())
await page.waitForTimeout(1200)
await page.screenshot({ path: OUT + 'desktop-timeline.png' })

await page.evaluate(() => document.getElementById('top20')?.scrollIntoView())
await page.waitForTimeout(1200)
await page.screenshot({ path: OUT + 'desktop-top20.png' })

// open a detail
await page.evaluate(() => document.getElementById('hall')?.scrollIntoView())
await page.waitForTimeout(400)
await page.click('.hall-card')
await page.waitForTimeout(1000)
await page.screenshot({ path: OUT + 'desktop-detail.png' })

// mobile
const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
await mob.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await mob.waitForTimeout(1400)
await mob.screenshot({ path: OUT + 'mobile-hero.png' })
await mob.evaluate(() => document.getElementById('hall')?.scrollIntoView())
await mob.waitForTimeout(1200)
await mob.screenshot({ path: OUT + 'mobile-hall.png' })
await mob.evaluate(() => document.getElementById('timeline')?.scrollIntoView())
await mob.waitForTimeout(1200)
await mob.screenshot({ path: OUT + 'mobile-timeline.png' })
await mob.evaluate(() => document.getElementById('top20')?.scrollIntoView())
await mob.waitForTimeout(1200)
await mob.screenshot({ path: OUT + 'mobile-top20.png' })
await mob.evaluate(() => document.getElementById('hall')?.scrollIntoView())
await mob.waitForTimeout(400)
await mob.click('.hall-card')
await mob.waitForTimeout(1000)
await mob.screenshot({ path: OUT + 'mobile-detail.png' })

// CS2-era detail (Shanghai 2024) on desktop
await page.keyboard.press('Escape')
await page.waitForTimeout(300)
await page.click('.hall-card:has-text("2024")')
await page.waitForTimeout(900)
await page.screenshot({ path: OUT + 'desktop-cs2-detail.png' })

await browser.close()
console.log('done')
