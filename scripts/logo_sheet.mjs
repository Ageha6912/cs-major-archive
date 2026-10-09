import { chromium } from 'playwright-core'

const teams = [
  ['Astralis', 'astralis.svg'],
  ['Cloud9', 'cloud9.svg'],
  ['FaZe Clan', 'fazeclan.svg'],
  ['Fnatic', 'fnatic.svg'],
  ['Gambit Esports', 'gambitesports.svg'],
  ['Luminosity Gaming', 'luminositygaming.svg'],
  ['Natus Vincere', 'natusvincere.svg'],
  ['Ninjas in Pyjamas', 'ninjasinpyjamas.png'],
  ['Outsiders', 'outsiders.png'],
  ['SK Gaming', 'skgaming.png'],
  ['Team EnVyUs', 'teamenvyus.png'],
  ['Team Falcons', 'teamfalcons.svg'],
  ['Team LDLC.com', 'teamldlccom.svg'],
  ['Team Spirit', 'teamspirit.png'],
  ['Team Vitality', 'teamvitality.png'],
  ['Virtus.pro', 'virtuspro.png'],
]

const cards = teams
  .map(
    ([name, file]) => `
    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px;background:#14141b;border:1px solid rgba(255,255,255,.1);border-radius:10px">
      <div style="width:96px;height:96px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:50%">
        <img src="../public/logos/${file}" style="max-width:76px;max-height:76px;object-fit:contain" onerror="this.parentElement.innerHTML='<span style=font-size:11px;color:#999>BROKEN</span>'"/>
      </div>
      <div style="font-size:12px;color:#ece9e2">${name}</div>
    </div>`,
  )
  .join('')

const html = `<!doctype html><html><head><style>body{background:#0a0a0d;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:20px;font-family:sans-serif}</style></head><body>${cards}</body></html>`

const { writeFileSync } = await import('node:fs')
writeFileSync('shots/logo-sheet.html', html)

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } })
await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/shots/logo-sheet.html')
await page.waitForTimeout(800)
await page.screenshot({ path: 'shots/logo-sheet.png' })
await browser.close()
console.log('done')
