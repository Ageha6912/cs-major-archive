<div align="center">
  <img src="assets/readme/hero.svg" alt="CS MAJOR ARCHIVE —— 2013—2026 二十四届 Major 冠军档案:24 届赛事 · 16 支冠军战队 · 13 年 HLTV TOP20 · 19 座主办城市" width="100%">
</div>

# CS MAJOR ARCHIVE · 历代 Major 冠军档案

把 CS:GO / CS2 全部 **24 届 Major**(2013 DreamHack Winter — 2026 IEM Cologne)收进一个暗色年鉴式单页:**24 届赛事 · 16 支冠军战队 · 13 年 HLTV TOP20 · 19 座主办城市**——每届的冠军阵容、决赛地图比分、场馆与奖金、HLTV 年度 TOP20,以及由 260 个 TOP20 名额叠出来的常青树榜。

**在线访问:[cs-major-archive.pages.dev](https://cs-major-archive.pages.dev)** · 技术栈:React 19 · TypeScript · Vite · framer-motion · ogl

<div align="center">
  <img src="assets/readme/header-showcase.svg" alt="区块:站点速览" width="100%">
</div>

首屏即档案:左侧是十三年的四项核心统计与时代双色刻度(香槟金 = CS:GO 时代,电光青 = CS2 时代),右侧「冠军俱乐部」按夺冠次数排布多冠战队。

![首页首屏——大标题、核心统计、时代刻度与冠军俱乐部面板](assets/readme/shot-hero.png)

| 冠军殿堂 | 历届征程 · 编年史 |
| --- | --- |
| ![冠军殿堂横向画廊——每届一列,战队主题色光晕](assets/readme/shot-hall.png) | ![历届征程时间轴——决赛地图比分、场馆奖金与名场面视频](assets/readme/shot-timeline.png) |
| **HLTV 年度最佳选手 TOP20** | **Major 详情页(布达佩斯 2025 为例)** |
| ![HLTV 年度 TOP20 榜单——按年份切换](assets/readme/shot-top20.png) | ![Major 详情页——决赛对阵与逐图比分](assets/readme/shot-detail.png) |

移动端保持同一套年鉴语言:长廊横滑、时间轴单列、榜单纵向堆叠。

<p align="center">
  <img src="assets/readme/shot-mobile-hero.png" alt="移动端首屏" width="30%">
  &nbsp;&nbsp;
  <img src="assets/readme/shot-mobile-top20.png" alt="移动端 TOP20 榜单" width="30%">
  &nbsp;&nbsp;
  <img src="assets/readme/shot-mobile-hof.png" alt="移动端名人堂" width="30%">
</p>

<div align="center">
  <img src="assets/readme/header-features.svg" alt="区块:功能与设计" width="100%">
</div>

- **冠军殿堂** —— Panorama 风格战术毛玻璃横向画廊:赛事徽记与主办方 Logo、冠军战队大 Logo(主题色光晕)、选手名单轮播、决赛/半决赛/八强梯级赛果;滚轮横向滚动,支持时代筛选,点击年份刻度平滑跳转至任意一届。
- **编年史(历届征程)** —— 按时间轴展示每届的决赛地图比分、场馆、奖金与名场面视频,默认折叠前 6 届,一键展开全部。
- **HLTV TOP20** —— 2013—2025 十三届年度最佳选手榜单:名次、国旗、选手与当年所效力战队。
- **名人堂(常青树榜)** —— 把十三年 260 个 TOP20 名额叠加排序:上榜 / 前十 / 登顶次数与最佳名次,点击展开逐年排名,支持搜索。
- **详情页** —— 点击任意一届进入全屏档案:淘汰赛四强 / 八强、全员参赛名单、冠亚军阵容、当年 TOP20 中的冠军成员、决赛视频(点击播放)。

设计上,全站固定背景使用 React Bits 的 SideRays 放射光柱(ogl 着色器,按需加载独立 chunk,香槟金 + 冷蓝双色层);炭黑底 + 香槟金(CS:GO)/ 电光青(CS2)双色体系贯穿始终;16 支冠军战队使用真实队徽(本地 `public/logos/`,来源 Wikimedia / Liquipedia),其余战队自动回退为六边形字母徽章;动效克制——滚动渐显、数字滚动、卡片悬停、顶部滚动进度条,并适配 `prefers-reduced-motion`。字体 Bebas Neue 与 Oswald 已本地打包,离线可用。

<div align="center">
  <img src="assets/readme/header-data.svg" alt="区块:数据档案" width="100%">
</div>

四份静态 JSON 驱动全站,构建与运行时不请求外部接口:

| 文件 | 内容 |
| --- | --- |
| `data/majors.json` | 24 届赛事元数据:场馆、奖金、冠亚军阵容、四强、八强、全员参赛名单 |
| `data/final_maps.json` | 每届决赛地图与比分 |
| `data/top20.json` | HLTV 年度 TOP20(2013—2025) |
| `data/videos.json` | 每届名场面视频(YouTube,详情页内嵌播放) |

数据整理自 Wikipedia 与 HLTV,视频版权归原作者所有;解析与校验脚本位于 `scripts/`。

<div align="center">
  <img src="assets/readme/header-quickstart.svg" alt="区块:快速开始" width="100%">
</div>

```bash
npm install
npm run dev        # 本地开发,默认 http://localhost:5173
```

生产构建与预览:

```bash
npm run build
npm run preview
```

推送到 `main` 分支后,GitHub Actions 会自动构建并发布至 Cloudflare Pages(见 [deploy.yml](.github/workflows/deploy.yml))。

## 数据来源与致谢

- 赛事与阵容数据整理自 [Wikipedia](https://en.wikipedia.org/wiki/Counter-Strike_Major_Championships) 与 [HLTV](https://www.hltv.org/),仅作展示用途,版权归原作者所有。
- 战队与主办方徽标来自 Wikimedia / Liquipedia,版权归各俱乐部与赛事方所有。
- 界面背景光柱动效来自 [React Bits](https://reactbits.dev/) 的 SideRays 组件。
