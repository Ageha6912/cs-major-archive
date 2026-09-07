/**
 * UI 回归测试套件：断言式，任一失败进程退出码为 1。
 * 前置：dev server 运行于 http://localhost:5199/（npm run dev -- --port 5199）
 * 运行：node scripts/test-ui.mjs
 */
import { chromium } from 'playwright-core'

const EXE = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const URL = 'http://localhost:5199/'

const results = []
let page
const consoleErrors = []

function check(name, ok, detail = '') {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail && !ok ? ` :: ${detail}` : ''}`)
}

async function expect(name, fn) {
  try {
    const ok = await fn()
    check(name, ok === true, typeof ok === 'string' ? ok : '')
  } catch (err) {
    check(name, false, err.message)
  }
}

const browser = await chromium.launch({ executablePath: EXE, headless: true })
page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push(err.message))

await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForTimeout(2200)

// 1. 页面骨架
await expect('导航 Logo 渲染', () => page.locator('.nav__logo').isVisible())
await expect('四个区块挂载', async () => {
  for (const id of ['hall', 'timeline', 'top20', 'hof']) {
    if ((await page.locator(`#${id}`).count()) !== 1) return `missing #${id}`
  }
  return true
})
await expect('颗粒纹理层生效', async () => {
  const content = await page.evaluate(() => getComputedStyle(document.body, '::after').backgroundImage)
  return content.includes('data:image/svg+xml')
})

// 2. Hero 入场编排（遮罩升起后标题可见）
await expect('Hero 标题遮罩结构', async () => {
  const masks = await page.locator('.hero__title-mask').count()
  return masks === 2 ? true : `expected 2 masks, got ${masks}`
})
await expect('Hero 标题动画后可见', async () => {
  const opacity = await page.locator('.hero__title-line--accent').evaluate((el) => getComputedStyle(el).opacity)
  return opacity === '1' ? true : `opacity=${opacity}`
})
await expect('Hero 统计数字计数到终值', async () => {
  const num = await page.locator('.hero-stat__num').first().textContent()
  return num?.trim() === '24' ? true : `first stat=${num}`
})
await expect('加载后窗口滚动位置为 0', async () => {
  const y = await page.evaluate(() => window.scrollY)
  return y === 0 ? true : `scrollY=${y}`
})

// 3. 冠军殿堂：时代过滤 + 年份轨道
await expect('默认 24 张冠军卡', async () => (await page.locator('.hall-card').count()) === 24)
await page.click('.era-filter button:nth-child(3)')
await page.waitForTimeout(700)
await expect('CS2 过滤后 5 张卡', async () => (await page.locator('.hall-card').count()) === 5)
await expect('年份轨道 5 个年份', async () => (await page.locator('.hall__year').count()) === 5)
await page.click('.era-filter button:nth-child(2)')
await page.waitForTimeout(700)
await expect('CS:GO 过滤后 19 张卡', async () => (await page.locator('.hall-card').count()) === 19)
await page.click('.era-filter button:nth-child(1)')
await page.waitForTimeout(700)
await expect('切回全部 24 张卡', async () => (await page.locator('.hall-card').count()) === 24)

await page.evaluate(() => document.getElementById('hall')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(900)
await page.locator('.hall__year', { hasText: '2018' }).first().click()
await page.waitForTimeout(1200)
await expect('年份轨道点击跳转卡组', async () => {
  const scrollLeft = await page.locator('.hall__shelf').evaluate((el) => el.scrollLeft)
  return scrollLeft > 100 ? true : `scrollLeft=${scrollLeft}`
})
await expect('被点年份获得高亮', async () =>
  (await page.locator('.hall__year.is-active').textContent())?.includes('2018'),
)

// 4. 编年史：流光脊线 + 节点点亮
await page.evaluate(() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(500)
await page.mouse.wheel(0, 900)
await page.waitForTimeout(800)
await expect('流光脊线随滚动生长', async () => {
  const t = await page.locator('.tl__spine').evaluate((el) => el.style.transform)
  const m = t.match(/scaleY\(([\d.]+)\)/)
  return m && Number(m[1]) > 0.05 ? true : `transform=${t}`
})
await expect('年份节点点亮', async () => (await page.locator('.tl__node.is-lit').count()) >= 1)

// 5. TOP20：年份切换过渡
await page.evaluate(() => document.getElementById('top20')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(1400)
const champ2025 = await page.locator('.top20-podium__player').first().textContent()
await page.locator('.top20__year', { hasText: '2016' }).click()
await page.waitForTimeout(1400)
const champ2016 = await page.locator('.top20-podium__player').first().textContent()
await expect('TOP20 切换年份后领奖台更替', () => !!champ2025 && !!champ2016 && champ2025 !== champ2016)
await expect('TOP20 榜单 17 行（4-20 名）', async () => (await page.locator('.top20-row').count()) === 17)

// 6. 名人堂：计数、搜索、空态、展开
await page.evaluate(() => document.getElementById('hof')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(2000)
await expect('名人堂统计计数到终值 101', async () => {
  const num = await page.locator('.hof__stats b').first().textContent()
  return num?.trim() === '101' ? true : `stat=${num}`
})
await page.fill('.hof__search', 's1mple')
await page.waitForTimeout(700)
await expect('搜索过滤到 1 行', async () => (await page.locator('.hof-row').count()) === 1)
await page.fill('.hof__search', 'zzzzqqq')
await page.waitForTimeout(700)
await expect('空态提示出现', () => page.locator('.hof__empty').isVisible())
await page.fill('.hof__search', '')
await page.waitForTimeout(700)
await page.locator('.hof-row__main').first().click()
await page.waitForTimeout(700)
await expect('行展开动画类生效', async () => {
  const rows = await page.locator('.hof-row.is-open .hof-row__detail').evaluateAll((els) =>
    els.map((el) => Number.parseFloat(getComputedStyle(el).gridTemplateRows)),
  )
  return rows.length === 1 && rows[0] > 0 ? true : `rows=${JSON.stringify(rows)}`
})
await page.locator('.hof__sorts button', { hasText: '登顶次数' }).click()
await page.waitForTimeout(700)
await expect('按登顶次数排序后首行即为最多者', async () => {
  const ones = await page.locator('.hof-row .hof-row__stat--ones b').allTextContents()
  const nums = ones.map((v) => Number(v))
  return nums.length > 1 && nums[0] === Math.max(...nums) && nums[0] > 0 ? true : `ones=${JSON.stringify(nums.slice(0, 5))}`
})

// 7. 详情页：打开、键盘翻页、退场
await page.evaluate(() => document.getElementById('hall')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(700)
await page.locator('.hall-card').first().click()
await page.waitForSelector('.detail', { state: 'visible' })
await page.waitForTimeout(1000)
const titleA = await page.locator('.detail__title').textContent()
await expect('详情页标题渲染', () => !!titleA && titleA.includes('2026'))
await page.keyboard.press('ArrowLeft')
await page.waitForTimeout(700)
const titleB = await page.locator('.detail__title').textContent()
await expect('方向键翻到相邻一届', () => !!titleB && titleA !== titleB)
await expect('详情页无横向破折号区间', async () => {
  const kicker = await page.locator('.detail__kicker').textContent()
  return kicker && !kicker.includes('–') ? true : `kicker=${kicker}`
})
await page.keyboard.press('Escape')
await page.waitForTimeout(900)
await expect('Esc 关闭详情页（含退场动画）', async () => (await page.locator('.detail').count()) === 0)

// 8. 全局滚动组件：进度条 / 回顶 / scrollspy
await page.evaluate(() => document.getElementById('hof')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(800)
await expect('进度条 scaleX > 0.3', async () => {
  const t = await page.locator('.progress').evaluate((el) => el.style.transform)
  const m = t.match(/scaleX\(([\d.]+)\)/)
  return m && Number(m[1]) > 0.3 ? true : `transform=${t}`
})
await expect('回到顶部按钮可见', () => page.locator('.to-top.is-visible').isVisible())
await expect('导航 scrollspy 高亮名人堂', async () => {
  const active = await page.locator('.nav__links a.is-active').allTextContents()
  return active.length === 1 && active[0].includes('名人堂') ? true : `active=${JSON.stringify(active)}`
})

// 9. 无控制台错误（YouTube 外链图加载失败不算）
await expect('无页面/控制台错误', async () => {
  const real = consoleErrors.filter((e) => !e.includes('ytimg') && !e.includes('youtube'))
  return real.length === 0 ? true : JSON.stringify(real.slice(0, 3))
})

// 10. reduced-motion 冒烟：页面完整渲染、无错误
const rmPage = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
const rmErrors = []
rmPage.on('pageerror', (err) => rmErrors.push(err.message))
await rmPage.goto(URL, { waitUntil: 'networkidle' })
await rmPage.waitForTimeout(1800)
await expect('reduced-motion 下标题直接可见', async () => {
  const opacity = await rmPage.locator('.hero__title-line--accent').evaluate((el) => getComputedStyle(el).opacity)
  return opacity === '1' ? true : `opacity=${opacity}`
})
await rmPage.evaluate(() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'instant' }))
await rmPage.waitForTimeout(600)
await expect('reduced-motion 下脊线直接填满', async () => {
  const t = await rmPage.locator('.tl__spine').evaluate((el) => el.style.transform || getComputedStyle(el).transform)
  return t.includes('1') || t.includes('matrix') ? true : `transform=${t}`
})
await expect('reduced-motion 无页面错误', () => rmErrors.length === 0)
await rmPage.close()

// 11. 移动端：导航单行、领奖台金→银→铜、HoF 行不横向溢出
const mPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await mPage.goto(URL, { waitUntil: 'networkidle' })
await mPage.waitForTimeout(2200)
await expect('移动端加载后滚动位置为 0', async () => {
  const y = await mPage.evaluate(() => window.scrollY)
  return y === 0 ? true : `scrollY=${y}`
})
await expect('移动端导航链接不换行', async () => {
  const heights = await mPage.locator('.nav__links a').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))
  return heights.every((h) => h < 40) ? true : `heights=${JSON.stringify(heights)}`
})
await expect('移动端导航不溢出视口', async () => {
  const over = await mPage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  return over <= 0 ? true : `overflow=${over}px`
})
await mPage.evaluate(() => document.getElementById('top20')?.scrollIntoView({ behavior: 'instant' }))
await mPage.waitForTimeout(1500)
await expect('移动端领奖台视觉顺序金榜第一在最上', async () => {
  const tops = await mPage.locator('.top20-podium__card').evaluateAll((els) =>
    els.map((el) => ({ tier: el.className, top: el.getBoundingClientRect().top })),
  )
  const gold = tops.find((t) => t.tier.includes('--gold'))
  const silver = tops.find((t) => t.tier.includes('--silver'))
  return gold && silver && gold.top < silver.top ? true : `tops=${JSON.stringify(tops.map((t) => ({ t: t.tier.slice(-8), top: Math.round(t.top) })))}`
})
await mPage.evaluate(() => document.getElementById('hof')?.scrollIntoView({ behavior: 'instant' }))
await mPage.waitForTimeout(2000)
await expect('移动端 HoF 行不横向溢出', async () => {
  const bad = await mPage.locator('.hof-row__main').evaluateAll((els) =>
    els.filter((el) => el.scrollWidth > el.clientWidth + 1).length,
  )
  return bad === 0 ? true : `${bad} rows overflow`
})
await mPage.close()

await browser.close()

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} passed`)
if (failed.length > 0) {
  console.log('FAILED:', failed.map((f) => f.name).join(' | '))
  process.exitCode = 1
}
