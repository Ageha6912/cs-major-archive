import { chromium } from 'playwright-core'
import { writeFileSync } from 'node:fs'

const newTeams = [
  ['AVANGAR', 'avangar.png'],
  ['Apeks', 'apeks.jpg'],
  ['Aurora Gaming', 'auroragaming.svg'],
  ['Copenhagen Wolves', 'copenhagenwolves.png'],
  ['Counter Logic Gaming', 'counterlogicgaming.svg'],
  ['ENCE', 'ence.svg'],
  ['Eternal Fire', 'eternalfire.jpg'],
  ['FURIA Esports', 'furiaesports.svg'],
  ['FlipSid3 Tactics', 'flipsid3tactics.png'],
  ['G2 Esports', 'g2esports.svg'],
  ['Gambit Gaming', 'gambitgaming.svg'],
  ['GamerLegion', 'gamerlegion.png'],
  ['HellRaisers', 'hellraisers.png'],
  ['Heroic', 'heroic.png'],
  ['MIBR', 'mibr.png'],
  ['MOUZ', 'mouz.svg'],
  ['mousesports', 'mousesports.svg'],
  ['PENTA Sports', 'pentasports.png'],
  ['Renegades', 'renegades.svg'],
  ['Team Dignitas', 'teamdignitas.svg'],
  ['Team Liquid', 'teamliquid.svg'],
  ['Team SoloMid', 'teamsolomid.svg'],
  ['The MongolZ', 'themongolz.svg'],
  ['paiN Gaming', 'paingaming.svg'],
]

const cards = newTeams
  .map(
    ([name, file]) => `
    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px;background:#14141b;border:1px solid rgba(255,255,255,.1);border-radius:10px">
      <div style="width:96px;height:96px;display:flex;align-items:center;justify-content:center;background:#fff;border-radius:50%">
        <img src="../public/logos/${file}" style="max-width:80px;max-height:80px;object-fit:contain" onerror="this.parentElement.innerHTML='<span style=font-size:11px;color:#f66>BROKEN</span>'"/>
      </div>
      <div style="font-size:12px;color:#ece9e2">${name}</div>
    </div>`,
  )
  .join('')

writeFileSync(
  'shots/logo-sheet2.html',
  `<!doctype html><html><head><style>body{background:#0a0a0d;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;padding:20px;font-family:sans-serif}</style></head><body>${cards}</body></html>`,
)

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
})
const page = await browser.newPage({ viewport: { width: 1200, height: 1100 } })
await page.goto('file:///' + process.cwd().replace(/\\/g, '/') + '/shots/logo-sheet2.html')
await page.waitForTimeout(800)
await page.screenshot({ path: 'shots/logo-sheet2.png' })
await browser.close()
console.log('done')
