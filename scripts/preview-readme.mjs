import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const OUT = new URL('../shots/', import.meta.url).pathname.replace(/^\//, '')
mkdirSync(OUT, { recursive: true })

const A = 'file:///E:/CsMajor/assets/readme/'
const body = `
<img class="hero" src="${A}hero.svg" alt="">
<h1>CS MAJOR ARCHIVE · 历代 Major 冠军档案</h1>
<p>把 CS:GO / CS2 全部 <strong>24 届 Major</strong>(2013 DreamHack Winter — 2026 IEM Cologne)收进一个暗色年鉴式单页:每届的冠军阵容、决赛地图比分、场馆与奖金、HLTV 年度 TOP20,以及由 260 个 TOP20 名额叠出来的常青树榜。</p>
<p><strong>在线访问:<a>cs-major-archive.pages.dev</a></strong> · 技术栈:React 19 · TypeScript · Vite · framer-motion · ogl</p>
<img class="plate" src="${A}header-showcase.svg" alt="">
<p>首屏即档案:左侧是十三年的四项核心统计与时代双色刻度(香槟金 = CS:GO 时代,电光青 = CS2 时代),右侧「冠军俱乐部」按夺冠次数排布多冠战队。</p>
<img src="${A}shot-hero.png" alt="">
<table><thead><tr><th>冠军殿堂</th><th>历届征程 · 编年史</th></tr></thead>
<tbody><tr><td><img src="${A}shot-hall.png" alt=""></td><td><img src="${A}shot-timeline.png" alt=""></td></tr>
<tr><td><strong>HLTV 年度最佳选手 TOP20</strong></td><td><strong>Major 详情页(布达佩斯 2025 为例)</strong></td></tr>
<tr><td><img src="${A}shot-top20.png" alt=""></td><td><img src="${A}shot-detail.png" alt=""></td></tr></tbody></table>
<p>移动端保持同一套年鉴语言:长廊横滑、时间轴单列、榜单纵向堆叠。</p>
<p class="mobrow"><img src="${A}shot-mobile-hero.png" width="30%">&nbsp;&nbsp;<img src="${A}shot-mobile-top20.png" width="30%">&nbsp;&nbsp;<img src="${A}shot-mobile-hof.png" width="30%"></p>
<img class="plate" src="${A}header-features.svg" alt="">
<ul>
<li><strong>冠军殿堂</strong> —— Panorama 风格战术毛玻璃横向画廊:赛事徽记与主办方 Logo、冠军战队大 Logo(主题色光晕)、选手名单轮播、决赛/半决赛/八强梯级赛果;滚轮横向滚动,支持时代筛选,点击年份刻度平滑跳转至任意一届。</li>
<li><strong>编年史(历届征程)</strong> —— 按时间轴展示每届的决赛地图比分、场馆、奖金与名场面视频,默认折叠前 6 届,一键展开全部。</li>
<li><strong>HLTV TOP20</strong> —— 2013—2025 十三届年度最佳选手榜单:名次、国旗、选手与当年所效力战队。</li>
<li><strong>名人堂(常青树榜)</strong> —— 把十三年 260 个 TOP20 名额叠加排序:上榜 / 前十 / 登顶次数与最佳名次,点击展开逐年排名,支持搜索。</li>
<li><strong>详情页</strong> —— 点击任意一届进入全屏档案:淘汰赛四强 / 八强、全员参赛名单、冠亚军阵容、当年 TOP20 中的冠军成员、决赛视频(点击播放)。</li>
</ul>
<p>设计上,全站固定背景使用 React Bits 的 SideRays 放射光柱(ogl 着色器,按需加载独立 chunk,香槟金 + 冷蓝双色层);炭黑底 + 香槟金(CS:GO)/ 电光青(CS2)双色体系贯穿始终;16 支冠军战队使用真实队徽(本地 <code>public/logos/</code>,来源 Wikimedia / Liquipedia),其余战队自动回退为六边形字母徽章;动效克制——滚动渐显、数字滚动、卡片悬停、顶部滚动进度条,并适配 <code>prefers-reduced-motion</code>。字体 Bebas Neue 与 Oswald 已本地打包,离线可用。</p>
<img class="plate" src="${A}header-data.svg" alt="">
<p>四份静态 JSON 驱动全站,构建与运行时不请求外部接口:</p>
<table><thead><tr><th>文件</th><th>内容</th></tr></thead><tbody>
<tr><td><code>data/majors.json</code></td><td>24 届赛事元数据:场馆、奖金、冠亚军阵容、四强、八强、全员参赛名单</td></tr>
<tr><td><code>data/final_maps.json</code></td><td>每届决赛地图与比分</td></tr>
<tr><td><code>data/top20.json</code></td><td>HLTV 年度 TOP20(2013—2025)</td></tr>
<tr><td><code>data/videos.json</code></td><td>每届名场面视频(YouTube,详情页内嵌播放)</td></tr>
</tbody></table>
<p>数据整理自 Wikipedia 与 HLTV,视频版权归原作者所有;解析与校验脚本位于 <code>scripts/</code>。</p>
<img class="plate" src="${A}header-quickstart.svg" alt="">
<pre><code>npm install
npm run dev        # 本地开发,默认 http://localhost:5173</code></pre>
<p>生产构建与预览:</p>
<pre><code>npm run build
npm run preview</code></pre>
<p>推送到 <code>main</code> 分支后,GitHub Actions 会自动构建并发布至 Cloudflare Pages(见 deploy.yml)。</p>
<h2>数据来源与致谢</h2>
<ul>
<li>赛事与阵容数据整理自 Wikipedia 与 HLTV,仅作展示用途,版权归原作者所有。</li>
<li>战队与主办方徽标来自 Wikimedia / Liquipedia,版权归各俱乐部与赛事方所有。</li>
<li>界面背景光柱动效来自 React Bits 的 SideRays 组件。</li>
</ul>`

const css = (dark) => `
  html,body{margin:0;padding:0}
  body{background:${dark ? '#0d1117' : '#ffffff'};font-family:-apple-system,'Segoe UI','Noto Sans',Helvetica,Arial,'PingFang SC','Microsoft YaHei',sans-serif;color:${dark ? '#e6edf3' : '#1f2328'};font-size:16px;line-height:1.6}
  .md{max-width:900px;margin:0 auto;padding:28px 16px 60px}
  img{max-width:100%;height:auto;display:block;border-radius:6px}
  h1{font-size:1.9em;font-weight:700;border-bottom:1px solid ${dark ? '#30363d' : '#d1d9e0'};padding-bottom:.3em;margin:.6em 0 .4em}
  h2{font-size:1.45em;font-weight:700;border-bottom:1px solid ${dark ? '#30363d' : '#d1d9e0'};padding-bottom:.3em;margin-top:1.4em}
  p,ul{margin:.7em 0}
  li{margin:.3em 0}
  table{border-collapse:collapse;width:100%;margin:.7em 0}
  th,td{border:1px solid ${dark ? '#30363d' : '#d1d9e0'};padding:8px 12px;text-align:left;vertical-align:middle}
  th{background:${dark ? '#161b22' : '#f6f8fa'}}
  td img{margin:0}
  code{background:${dark ? '#161b22' : '#f6f8fa'};padding:.15em .35em;border-radius:5px;font-size:.86em}
  pre{background:${dark ? '#161b22' : '#f6f8fa'};padding:14px 16px;border-radius:6px;overflow:auto}
  pre code{background:none;padding:0}
  .mobrow{text-align:center}
  .mobrow img{display:inline-block;vertical-align:top}
`

const browser = await chromium.launch({ executablePath: EXE, headless: true })

async function shot(name, { width, dark }) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 })
  const content = `<!doctype html><html><head><meta charset="utf-8"><style>${css(dark)} .md{max-width:${Math.min(width, 900)}px}</style></head><body><div class="md">${body}</div></body></html>`
  const htmlPath = OUT + `readme-preview-${dark ? 'dark' : 'light'}.html`
  await import('node:fs').then(fs => fs.writeFileSync(htmlPath, content))
  await page.goto('file:///' + htmlPath.replace(/^\//, '').replace(/\\/g, '/'), { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await page.screenshot({ path: OUT + name, fullPage: true })
  await page.close()
  console.log('saved', name)
}

await shot('readme-preview-desktop-dark.png', { width: 940, dark: true })
await shot('readme-preview-desktop-light.png', { width: 940, dark: false })
await shot('readme-preview-mobile-dark.png', { width: 390, dark: true })
await browser.close()
console.log('done')
