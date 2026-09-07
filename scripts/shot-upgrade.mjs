import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const tag = process.argv[2] || 'base'
const OUT = new URL('../shots/upgrade/', import.meta.url).pathname.replace(/^\/(?=[A-Za-z]:)/, '')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: EXE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
await page.screenshot({ path: `${OUT}${tag}-hero.png` })

const sections = ['hall', 'timeline', 'top20', 'hof']
for (const id of sections) {
  await page.evaluate((sid) => document.getElementById(sid)?.scrollIntoView({ behavior: 'instant' }), id)
  await page.waitForTimeout(1800)
  await page.screenshot({ path: `${OUT}${tag}-${id}.png` })
}

await page.evaluate(() => document.getElementById('hall')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(600)
await page.click('.hall-card')
await page.waitForTimeout(1500)
await page.screenshot({ path: `${OUT}${tag}-detail.png` })

await browser.close()
console.log('done', tag)
