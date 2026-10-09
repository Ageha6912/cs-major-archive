/**
 * UI 回归测试套件（参考图合并版设计）：断言式，任一失败进程退出码为 1。
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
page = await browser.newPage({ viewport: { width: 1536, height: 1024 } })
const localAssetFailures = []
page.on('response', (res) => {
  // 网络层资源失败（外链 CDN 抖动）不算应用错误；本地资源失败单独追踪
  if (res.url().startsWith('http://localhost:5199') && res.status() >= 400) {
    localAssetFailures.push(`${res.status()} ${res.url()}`)
  }
})
page.on('requestfailed', (req) => {
  if (req.url().startsWith('http://localhost:5199')) {
    localAssetFailures.push(`${req.failure()?.errorText ?? 'failed'} ${req.url()}`)
  }
})
page.on('console', (msg) => {
  if (msg.type() === 'error' && !/net::ERR_|Failed to load resource/i.test(msg.text())) {
    consoleErrors.push(msg.text())
  }
})
page.on('pageerror', (err) => consoleErrors.push(err.message))

await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3200)

// 1. 页面骨架：档案条导航 + 四个锚点区块
await expect('导航 Logo 与字标渲染', async () => {
  if ((await page.locator('.nav__mark').count()) !== 1) return 'missing mark'
  const brand = await page.locator('.nav__brand').textContent()
  return brand === 'CS MAJOR ARCHIVE' ? true : `brand=${brand}`
})
await expect('导航含 5 个链接', async () => {
  const n = await page.locator('.nav__links a').count()
  return n === 5 ? true : `count=${n}`
})
await expect('年代切换控件渲染（ALL/CS:GO/CS2）', async () => {
  const n = await page.locator('.era-switch__btn').count()
  return n === 3 ? true : `count=${n}`
})
await expect('四个锚点区块挂载', async () => {
  for (const id of ['hall', 'timeline', 'top20', 'hof']) {
    if ((await page.locator(`#${id}`).count()) !== 1) return `missing #${id}`
  }
  return true
})
await expect('颗粒纹理层生效', async () => {
  const content = await page.evaluate(() => getComputedStyle(document.body, '::after').backgroundImage)
  return content.includes('data:image/svg+xml') ? true : 'no grain layer'
})
await expect('照片背景层已挂载（hero 底/奖杯层）', async () => {
  const bg = await page.locator('.hero__bg').evaluate((el) => getComputedStyle(el).backgroundImage)
  const trophy = await page.locator('.hero__trophy').evaluate((el) => getComputedStyle(el).backgroundImage)
  return bg.includes('url') && trophy.includes('url') ? true : `bg=${bg} trophy=${trophy}`
})

// 2. Hero：衬线大标题 + 统计 + FEATURED MAJOR
await expect('Hero 标题遮罩结构（两行）', async () => {
  const masks = await page.locator('.hero__title-mask').count()
  return masks === 2 ? true : `masks=${masks}`
})
await expect('Hero 标题动画后可见', async () => {
  const opacity = await page.locator('.hero__title-line--accent').evaluate((el) => getComputedStyle(el).opacity)
  return opacity === '1' ? true : `opacity=${opacity}`
})
await expect('Hero 年份区间 2013—2026', async () => {
  const t = (await page.locator('.hero__years').textContent())?.replace(/\s+/g, '')
  return t === '2013—2026' ? true : `years=${t}`
})
await expect('Hero 统计数字计数到终值 24', async () => {
  const num = await page.locator('.hero-stat__num').first().textContent()
  return num?.trim() === '24' ? true : `first stat=${num}`
})
await expect('Hero 引文渲染', () => page.locator('.hero__quote').isVisible())
await expect('FEATURED 卡标题为主办方短格式（IEM COLOGNE 2026）', async () => {
  const t = (await page.locator('.feat__title').textContent())?.toUpperCase()
  return t === 'IEM COLOGNE 2026' ? true : `title=${t}`
})
await expect('FEATURED 卡对阵为真实数据（Team Falcons 3 : 0）', async () => {
  const champ = await page.locator('.feat__team').first().locator('b').textContent()
  const score = (await page.locator('.feat__score').textContent())?.replace(/\s+/g, ' ').trim()
  return champ === 'Team Falcons' && score === '3 : 0' ? true : `champ=${champ} score=${score}`
})
await expect('FEATURED 卡信息条含地点/奖金/日期', async () => {
  const meta = (await page.locator('.feat__meta').textContent()) ?? ''
  return meta.includes('Cologne') && meta.includes('$1.3M') && meta.includes('2026') ? true : `meta=${meta}`
})
await expect('加载后窗口滚动位置为 0', async () => {
  const y = await page.evaluate(() => window.scrollY)
  return y === 0 ? true : `scrollY=${y}`
})
await expect('页首 HOME 导航高亮（scrollspy 绑定 hero）', async () => {
  const active = await page.locator('.nav__links a.is-active').allTextContents()
  return active.length === 1 && active[0] === 'HOME' ? true : `active=${JSON.stringify(active)}`
})

// 3. 冠军殿堂：窄卡轮播 + 时代过滤
await expect('默认 24 张冠军卡', async () => (await page.locator('.champ-card').count()) === 24)
await expect('区块计数显示 / 01 — 24', async () => {
  const t = (await page.locator('.champ .sec-head__sub').textContent())?.replace(/\s+/g, ' ').trim()
  return t === '/ 01 — 24' ? true : `sub=${t}`
})
await expect('冠军卡结构完整（年份/赛事/冠军/比分/对手）', async () => {
  const card = page.locator('.champ-card').first()
  const year = await card.locator('.champ-card__year').textContent()
  const event = await card.locator('.champ-card__event').textContent()
  const team = await card.locator('.champ-card__team').textContent()
  const score = (await card.locator('.champ-card__score').textContent())?.replace(/\s+/g, ' ').trim()
  const runner = await card.locator('.champ-card__runner').textContent()
  const ok =
    year === '2026' &&
    event === 'IEM Cologne Major' &&
    team === 'Team Falcons' &&
    score === '3 : 0' &&
    runner === 'FURIA Esports'
  return ok ? true : `y=${year} e=${event} t=${team} s=${score} r=${runner}`
})
await page.click('.era-switch__btn:nth-child(3)')
await page.waitForTimeout(700)
await expect('Header 切换 CS2 后 5 张卡', async () => (await page.locator('.champ-card').count()) === 5)
await page.click('.era-switch__btn:nth-child(2)')
await page.waitForTimeout(700)
await expect('Header 切换 CS:GO 后 19 张卡', async () => (await page.locator('.champ-card').count()) === 19)
await page.click('.era-switch__btn:nth-child(1)')
await page.waitForTimeout(700)
await expect('切回全部 24 张卡', async () => (await page.locator('.champ-card').count()) === 24)

await page.evaluate(() => document.getElementById('hall')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(900)
await expect('右箭头点击后卡组滚动', async () => {
  await page.locator('.champ__arrow--r').click()
  await page.waitForTimeout(900)
  const scrollLeft = await page.locator('.champ__strip').evaluate((el) => el.scrollLeft)
  return scrollLeft > 100 ? true : `scrollLeft=${scrollLeft}`
})
await expect('滚动到末尾后左箭头可用', async () => {
  await page.locator('.champ__arrow--r').click()
  await page.waitForTimeout(900)
  const state = await page.evaluate(() => {
    const el = document.querySelector('.champ__strip')
    const right = document.querySelector('.champ__arrow--r')
    return { atEnd: el.scrollLeft >= el.scrollWidth - el.clientWidth - 4, rightDisabled: right.disabled }
  })
  return state.atEnd && state.rightDisabled ? true : JSON.stringify(state)
})

// 4. 编年史：年份轨查看器
await page.evaluate(() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(900)
await expect('年份轨 24 个年份', async () => (await page.locator('.chron__year').count()) === 24)
await expect('默认选中最新一届（2026 激活）', async () => {
  const active = await page.locator('.chron__year.is-active').textContent()
  return active === '2026' ? true : `active=${active}`
})
await expect('卷宗头行渲染（年份 + 赛事名 + CS2 徽章）', async () => {
  const y = await page.locator('.chron__sel-year').textContent()
  const h3 = await page.locator('.chron__rowhead h3').textContent()
  const badge = await page.locator('.chron__badge').textContent()
  return y === '2026' && h3 === 'IEM COLOGNE MAJOR' && badge === 'CS2' ? true : `y=${y} h3=${h3} b=${badge}`
})
await expect('卷宗字段齐全（Champion/Runner-up/Final/Prize/Venue）', async () => {
  const dts = await page.locator('.chron__row dt').allTextContents()
  for (const label of ['Champion', 'Runner-up', 'Final', 'Prize Pool', 'Venue']) {
    if (!dts.includes(label)) return `missing ${label} in ${JSON.stringify(dts)}`
  }
  return true
})
await expect('冠军字段带迷你队标且为真实冠军', async () => {
  const dd = page.locator('.chron__row').first().locator('dd')
  const logo = await dd.locator('img, span').count()
  const name = await dd.locator('b').textContent()
  return logo >= 1 && name === 'Team Falcons' ? true : `logo=${logo} name=${name}`
})
await expect('FINAL MAPS 行数与真实数据一致（3 张）且比分青色', async () => {
  const n = await page.locator('.chron__map').count()
  const color = await page
    .locator('.chron__map em')
    .first()
    .evaluate((el) => getComputedStyle(el).color)
  return n === 3 && color.includes('108') ? true : `n=${n} color=${color}`
})
await expect('照片卡与 Match Highlights 链接到视频', async () => {
  const photoHref = await page.locator('.chron__photo').getAttribute('href')
  const hl = await page.locator('.chron__hl-link').first().getAttribute('href')
  return !!photoHref && photoHref.includes('youtube') && !!hl && hl.includes('youtube') ? true : `photo=${photoHref} hl=${hl}`
})
await expect('点击年份 2013 切换卷宗内容', async () => {
  await page.locator('.chron__year', { hasText: '2013' }).first().click()
  await page.waitForTimeout(700)
  const y = await page.locator('.chron__sel-year').textContent()
  const champ = await page.locator('.chron__row').first().locator('dd b').textContent()
  const badge = await page.locator('.chron__badge').textContent()
  return y === '2013' && champ === 'Fnatic' && badge === 'CS:GO' ? true : `y=${y} champ=${champ} badge=${badge}`
})

// 5. TOP20：双列 Editorial 年榜
await page.evaluate(() => document.getElementById('top20')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(1400)
await expect('年份按钮 13 个（2013-2025）', async () => (await page.locator('.t20__years .yearnav__btn').count()) === 13)
await expect('榜单 20 行完整呈现（双列）', async () => (await page.locator('.top20-row').count()) === 20)
await expect('第一名获得强调样式（is-top）', async () => (await page.locator('.top20-row.is-top').count()) === 1)
await expect('名次补零格式（01…20）', async () => {
  const first = await page.locator('.top20-row__rank').first().textContent()
  const last = await page.locator('.top20-row__rank').last().textContent()
  return first === '01' && last === '20' ? true : `first=${first} last=${last}`
})
const topPlayer2025 = await page.locator('.top20-row.is-top .top20-row__id b').first().textContent()
await page.locator('.t20__years .yearnav__btn', { hasText: '2016' }).click()
await page.waitForTimeout(1300)
const topPlayer2016 = await page.locator('.top20-row.is-top .top20-row__id b').first().textContent()
await expect('切换年份后年度第一更替', () => !!topPlayer2025 && !!topPlayer2016 && topPlayer2025 !== topPlayer2016)

// 6. 名人堂：传奇卡 + Career Timeline + 完整榜单
await page.evaluate(() => document.getElementById('hof')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(1600)
await expect('三张传奇卡渲染', async () => (await page.locator('.legend-card').count()) === 3)
await expect('传奇卡数据来自真实榜（NiKo 10 APPEARANCES）', async () => {
  const name = await page.locator('.legend-card').first().locator('.legend__name').textContent()
  const apps = await page.locator('.legend-card').first().locator('.legend__apps').textContent()
  return name === 'NiKo' && apps === '10 APPEARANCES' ? true : `name=${name} apps=${apps}`
})
await expect('Career Timeline 13 个年份圆点', async () => {
  const dots = await page.locator('.career__dot').count()
  const labels = await page.locator('.career__years span').count()
  return dots === 13 && labels === 13 ? true : `dots=${dots} labels=${labels}`
})
await expect('点击第二张传奇卡切换生涯时间轴', async () => {
  await page.locator('.legend-card').nth(1).click()
  await page.waitForTimeout(500)
  const who = await page.locator('.career__who').textContent()
  const active = await page.locator('.legend-card.is-active .legend__name').textContent()
  return who === 'dev1ce' && active === 'dev1ce' ? true : `who=${who} active=${active}`
})
await page.locator('.legend-card').first().click()
await expect('名人堂统计计数到终值 101', async () => {
  const num = await page.locator('.hof__stats b').first().textContent()
  return num?.trim() === '101' ? true : `stat=${num}`
})
await page.fill('.hof__search input', 's1mple')
await page.waitForTimeout(700)
await expect('搜索过滤到 1 行', async () => (await page.locator('.hof-row').count()) === 1)
await page.fill('.hof__search input', 'zzzzqqq')
await page.waitForTimeout(700)
await expect('空态提示出现', () => page.locator('.hof__empty').isVisible())
await page.fill('.hof__search input', '')
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

// 6.5 GSAP 委托：名人堂行按压反馈
await page.waitForTimeout(300)
const hofBtn = page.locator('.hof-row__main').first()
const hb = await hofBtn.boundingBox()
if (hb) {
  await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2)
  await page.mouse.down()
  await page.waitForTimeout(300)
  await expect('名人堂行按下缩小（GSAP scale≈0.97）', async () => {
    const t = await hofBtn.evaluate((el) => getComputedStyle(el).transform)
    if (t === 'none') return 'no transform while pressed'
    const p = t.match(/matrix\(([^)]+)\)/)
    if (!p) return `transform=${t}`
    const a = Number(p[1].split(',')[0])
    return a < 0.99 && a > 0.9 ? true : `a=${a}`
  })
  await page.mouse.up()
  await page.waitForTimeout(500)
  await expect('松开后按压内联样式清除', async () => {
    const t = await hofBtn.evaluate((el) => el.style.transform)
    return t === '' ? true : `inline=${t}`
  })
} else {
  check('名人堂行按压反馈', false, 'boundingBox 为空')
}

// 7. 详情页：档案卷宗
await page.evaluate(() => document.getElementById('hall')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(700)
await page.locator('.champ-card').first().click()
await page.waitForSelector('.detail', { state: 'visible' })
await page.waitForTimeout(400)
await expect('比分条生长中（GSAP scaleX<1）', async () => {
  const vals = await page.locator('.maprow__fill').evaluateAll((els) =>
    els.map((el) => (getComputedStyle(el).transform === 'none' ? 1 : new DOMMatrix(getComputedStyle(el).transform).a)),
  )
  return vals.length > 0 && vals.some((v) => v < 0.98) ? true : `a=${JSON.stringify(vals)}`
})
await page.waitForTimeout(1300)
await expect('比分条生长完成（scaleX=1）', async () => {
  const vals = await page.locator('.maprow__fill').evaluateAll((els) =>
    els.map((el) => (getComputedStyle(el).transform === 'none' ? 1 : new DOMMatrix(getComputedStyle(el).transform).a)),
  )
  return vals.length > 0 && vals.every((v) => v > 0.99) ? true : `a=${JSON.stringify(vals)}`
})
const titleA = await page.locator('.detail__title').textContent()
await expect('详情页标题渲染', () => !!titleA && titleA.includes('2026'))
await expect('地图行结构：图名 + 双向比分条 + 比分', async () => {
  const names = await page.locator('.maprow__name').allTextContents()
  const scores = await page.locator('.maprow__score').count()
  const wins = await page.locator('.maprow__score span.is-win').count()
  return names.length === 3 && scores === 3 && wins >= 3 ? true : `names=${JSON.stringify(names)} scores=${scores} wins=${wins}`
})

// 7.5 GSAP：决赛数据 Tab 切换淡入桥接（若有逐图数据）
const tabCount = await page.locator('.mstats__tab').count()
if (tabCount > 1) {
  await page.locator('.mstats__tab').nth(1).click()
  await expect('数据 Tab 切换淡入桥接（GSAP 接管透明度）', async () => {
    // 在 320ms 补间窗口内逐帧采样：捕捉到任意一帧「透明度进行中」即算桥接生效（对时序抖动免疫）
    return page.evaluate(async () => {
      const el = document.querySelector('.mstats__teams')
      if (!el) return 'missing .mstats__teams'
      for (let i = 0; i < 30; i++) {
        if (el.style.opacity !== '' && Number(el.style.opacity) < 0.999) return true
        await new Promise((r) => requestAnimationFrame(r))
      }
      return `style.opacity never mid-tween (final=${el.style.opacity || '(empty)'})`
    })
  })
  await page.waitForTimeout(700)
  await expect('数据 Tab 激活态更新', async () => {
    const cls = await page.locator('.mstats__tab').nth(1).getAttribute('class')
    return cls?.includes('is-active') ? true : `class=${cls}`
  })
}

// 7.6 GSAP：翻页方向滑入 + 覆盖层滚动复位
await page.evaluate(() => {
  const d = document.querySelector('.detail')
  if (d) d.scrollTop = 600
})
await page.keyboard.press('ArrowLeft')
await page.waitForTimeout(120)
await expect('翻页内容方向滑入（GSAP x 偏移）', async () => {
  const t = await page.evaluate(() => {
    const first = document.querySelector('.detail__body')?.firstElementChild
    return first ? first.style.transform : 'missing'
  })
  return t && t !== 'none' ? true : `transform=${t}`
})
await page.waitForTimeout(800)
await expect('翻页后覆盖层滚动复位到顶部', async () => {
  const st = await page.evaluate(() => document.querySelector('.detail')?.scrollTop ?? -1)
  return st === 0 ? true : `scrollTop=${st}`
})
await page.keyboard.press('ArrowLeft')
await page.waitForTimeout(700)
const titleB = await page.locator('.detail__title').textContent()
await expect('方向键翻到相邻一届', () => !!titleB && titleA !== titleB)
await expect('详情页 kicker 无横向破折号区间', async () => {
  const kicker = await page.locator('.detail__kicker').textContent()
  return kicker && !kicker.includes('–') ? true : `kicker=${kicker}`
})
await page.keyboard.press('Escape')
await page.waitForTimeout(900)
await expect('Esc 关闭详情页（含退场动画）', async () => (await page.locator('.detail').count()) === 0)

// 7.7 编年史面板点击打开完整档案；Hero VIEW ALL 直达详情
await page.evaluate(() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(800)
await page.locator('.chron__rowhead h3').click()
await page.waitForSelector('.detail', { state: 'visible' })
await page.waitForTimeout(500)
await expect('编年史面板点击打开完整档案', async () => {
  const t = await page.locator('.detail__title').textContent()
  return !!t && t.length > 4 ? true : `title=${t}`
})
await page.keyboard.press('Escape')
await page.waitForTimeout(800)
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
await page.waitForTimeout(600)
await page.locator('.feat__view').click()
await page.waitForSelector('.detail', { state: 'visible' })
await page.waitForTimeout(500)
await expect('Hero VIEW ALL 打开最新一届详情', async () => {
  const t = await page.locator('.detail__title').textContent()
  return t?.includes('2026') ? true : `title=${t}`
})
await page.keyboard.press('Escape')
await page.waitForTimeout(800)

// 8. 全局滚动组件：进度条 / 回顶 / scrollspy
await page.evaluate(() => document.getElementById('hof')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(800)
await expect('进度条随滚动推进（scaleX > 0.1）', async () => {
  const t = await page.locator('.progress').evaluate((el) => el.style.transform)
  const m = t.match(/scaleX\(([\d.]+)\)/)
  return m && Number(m[1]) > 0.1 ? true : `transform=${t}`
})
await expect('回到顶部按钮可见', () => page.locator('.to-top.is-visible').isVisible())
await expect('导航 scrollspy 高亮 HALL OF FAME', async () => {
  const active = await page.locator('.nav__links a.is-active').allTextContents()
  return active.some((t) => t.includes('HALL OF FAME')) ? true : `active=${JSON.stringify(active)}`
})

// 8.5 GSAP：资源加载淡入（捕获阶段委托 load 事件）
await expect('图片加载后淡入而非跳入', () =>
  page.evaluate(
    () =>
      new Promise((resolve) => {
        const img = document.createElement('img')
        img.style.cssText = 'position:fixed;left:0;bottom:0;width:30px;height:30px;z-index:-1'
        img.src =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        img.addEventListener('load', () => {
          setTimeout(() => {
            const op = Number(getComputedStyle(img).opacity)
            img.remove()
            resolve(op > 0 && op < 0.999 ? true : `opacity=${op}`)
          }, 120)
        })
        img.addEventListener('error', () => {
          img.remove()
          resolve('image failed to load')
        })
        document.body.appendChild(img)
      }),
  ),
)

// 9. 无控制台 JS 错误；本地资源全部可加载（外链 CDN 网络抖动不算应用失败）
await expect('无页面/控制台 JS 错误', async () => {
  return consoleErrors.length === 0 ? true : JSON.stringify(consoleErrors.slice(0, 3))
})
await expect('本地资源无加载失败', async () => {
  return localAssetFailures.length === 0 ? true : JSON.stringify(localAssetFailures.slice(0, 3))
})

// 10. reduced-motion 冒烟：页面完整渲染、无错误
const rmPage = await browser.newPage({ viewport: { width: 1536, height: 1024 }, reducedMotion: 'reduce' })
const rmErrors = []
rmPage.on('pageerror', (err) => rmErrors.push(err.message))
await rmPage.goto(URL, { waitUntil: 'domcontentloaded' })
await rmPage.waitForTimeout(2200)
await expect('reduced-motion 下标题直接可见', async () => {
  const opacity = await rmPage.locator('.hero__title-line--accent').evaluate((el) => getComputedStyle(el).opacity)
  return opacity === '1' ? true : `opacity=${opacity}`
})
await expect('reduced-motion 无页面错误', () => rmErrors.length === 0)

// 10.5 reduced-motion：详情页 GSAP 全部跳过，内容直接呈现、翻页仍可用
await rmPage.evaluate(() => document.getElementById('hall')?.scrollIntoView({ behavior: 'instant' }))
await rmPage.waitForTimeout(500)
await rmPage.locator('.champ-card').first().click()
await rmPage.waitForSelector('.detail', { state: 'visible' })
await rmPage.waitForTimeout(700)
await expect('reduced-motion 比分条无内联变换', async () => {
  const counts = await rmPage.evaluate(() => {
    const fills = Array.from(document.querySelectorAll('.maprow__fill'))
    return { total: fills.length, styled: fills.filter((el) => el.style.transform).length }
  })
  return counts.total > 0 && counts.styled === 0 ? true : JSON.stringify(counts)
})
const rmTitleA = await rmPage.locator('.detail__title').textContent()
await rmPage.keyboard.press('ArrowLeft')
await rmPage.waitForTimeout(500)
const rmTitleB = await rmPage.locator('.detail__title').textContent()
await expect('reduced-motion 下翻页仍可用', () => !!rmTitleA && !!rmTitleB && rmTitleA !== rmTitleB)
await rmPage.keyboard.press('Escape')
await rmPage.waitForTimeout(800)
await rmPage.close()

// 11. 移动端：导航两行、无横向溢出、卡组可横滑、榜单单列
const mPage = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })
await mPage.goto(URL, { waitUntil: 'domcontentloaded' })
await mPage.waitForTimeout(3000)
await expect('移动端加载后滚动位置为 0', async () => {
  const y = await mPage.evaluate(() => window.scrollY)
  return y === 0 ? true : `scrollY=${y}`
})
await expect('移动端导航链接不换行', async () => {
  const heights = await mPage.locator('.nav__links a').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height))
  return heights.every((h) => h < 40) ? true : `heights=${JSON.stringify(heights)}`
})
await expect('移动端整页不溢出视口', async () => {
  const over = await mPage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  return over <= 0 ? true : `overflow=${over}px`
})
await expect('移动端年代切换可见', () => mPage.locator('.era-switch').isVisible())
await mPage.evaluate(() => document.getElementById('hall')?.scrollIntoView({ behavior: 'instant' }))
await mPage.waitForTimeout(1000)
await expect('移动端冠军卡组可横向滑动', async () => {
  const m = await mPage.locator('.champ__strip').evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
  }))
  return m.scrollWidth > m.clientWidth ? true : `scrollWidth=${m.scrollWidth} clientWidth=${m.clientWidth}`
})
await mPage.evaluate(() => document.getElementById('top20')?.scrollIntoView({ behavior: 'instant' }))
await mPage.waitForTimeout(1400)
await expect('移动端 TOP20 单列且行不溢出', async () => {
  const cols = await mPage.locator('.t20__cols').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length)
  const bad = await mPage.locator('.top20-row').evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth + 1).length)
  return cols === 1 && bad === 0 ? true : `cols=${cols} bad=${bad}`
})
await mPage.evaluate(() => document.getElementById('hof')?.scrollIntoView({ behavior: 'instant' }))
await mPage.waitForTimeout(1800)
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
