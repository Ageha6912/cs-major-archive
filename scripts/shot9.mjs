import { chromium } from 'playwright-core'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: EXE, headless: true })
const errors = []

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
await page.screenshot({ path: 'shots/redo-home.png' })

// horizontal scroll via wheel
await page.mouse.move(720, 500)
await page.mouse.wheel(0, 1400)
await page.waitForTimeout(700)
await page.mouse.wheel(0, 1400)
await page.waitForTimeout(700)
await page.screenshot({ path: 'shots/redo-scrolled.png' })

// roster ticker: wait 4s and compare card region? just screenshot after 4s
await page.waitForTimeout(3600)
await page.screenshot({ path: 'shots/redo-ticker.png' })

// click card -> modal
await page.click('.glass.cursor-pointer')
await page.waitForTimeout(900)
await page.screenshot({ path: 'shots/redo-modal.png' })
await page.keyboard.press('Escape')
await page.waitForTimeout(500)

// mobile
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
mob.on('pageerror', (e) => errors.push('mobile: ' + e.message))
await mob.goto('http://localhost:5173/', { waitUntil: 'networkidle' })
await mob.waitForTimeout(2000)
await mob.screenshot({ path: 'shots/redo-mobile.png' })

console.log('errors:', errors.length)
for (const e of errors.slice(0, 6)) console.log('  ', e.slice(0, 140))
await browser.close()
