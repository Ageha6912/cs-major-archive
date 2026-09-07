import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const OUT = new URL('../shots/ref-compare/', import.meta.url).pathname.replace(/^\//, '')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: EXE, headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })
await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
await page.screenshot({ path: OUT + '07-改版后-首页.png' })

await page.evaluate(() => document.getElementById('hall')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(1800)
await page.screenshot({ path: OUT + '08-改版后-冠军殿堂+年份条.png' })

await page.evaluate(() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(1800)
await page.screenshot({ path: OUT + '09-改版后-编年史.png' })

await page.evaluate(() => document.getElementById('top20')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(1800)
await page.screenshot({ path: OUT + '10-改版后-TOP20.png' })

await page.evaluate(() => document.getElementById('hof')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(1800)
await page.screenshot({ path: OUT + '11-改版后-名人堂.png' })

await page.evaluate(() => document.getElementById('hall')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(600)
await page.click('.hall-card')
await page.waitForTimeout(1500)
await page.screenshot({ path: OUT + '12-改版后-详情页.png' })

await browser.close()
console.log('done')
