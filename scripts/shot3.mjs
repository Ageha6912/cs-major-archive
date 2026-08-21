import { chromium } from 'playwright-core'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const browser = await chromium.launch({ executablePath: EXE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.evaluate(() => document.getElementById('hof')?.scrollIntoView())
await page.waitForTimeout(800)
await page.click('.hof-row__main')
await page.waitForTimeout(500)
await page.evaluate(() => {
  const row = document.querySelector('.hof-row')
  row?.scrollIntoView({ block: 'center' })
})
await page.waitForTimeout(500)
await page.screenshot({ path: 'shots/hof-expanded.png' })
await browser.close()
