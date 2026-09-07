import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const OUT = new URL('../shots/ref-compare/', import.meta.url).pathname.replace(/^\//, '')
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: EXE, headless: true })
const mob = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
await mob.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await mob.waitForTimeout(2500)
await mob.screenshot({ path: OUT + '13-改版后-移动端首页.png' })
await mob.evaluate(() => document.getElementById('hall')?.scrollIntoView({ behavior: 'instant' }))
await mob.waitForTimeout(1800)
await mob.screenshot({ path: OUT + '14-改版后-移动端殿堂.png' })
await browser.close()
console.log('done')
