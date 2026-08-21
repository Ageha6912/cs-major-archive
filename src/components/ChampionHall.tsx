import { formatPurse, priorTitles } from '../data'
import type { Major } from '../data'
import TeamBadge from './TeamBadge'

export default function ChampionHall({
  majors,
  eraFilter,
  onSelect,
}: {
  majors: Major[]
  eraFilter: 'all' | 'CS:GO' | 'CS2'
  onSelect: (id: string) => void
}) {
  const list = eraFilter === 'all' ? majors : majors.filter((m) => m.era === eraFilter)
  return (
    <section className="hall section" id="hall">
      <div className="section-head" data-reveal>
        <p className="section-head__kicker">CHAMPIONS HALL</p>
        <h2 className="section-head__title">冠军殿堂</h2>
        <p className="section-head__desc">从 2013 年延雪平的初代冠军，到 2026 年科隆的新王，24 支冠军之师在此列队。</p>
      </div>
      <div className="hall__shelf" data-reveal>
        {list.map((m, i) => {
          const titles = priorTitles(m) + 1
          return (
            <button
              className={`hall-card era-${m.era === 'CS2' ? 'cs2' : 'csgo'}`}
              key={m.id}
              onClick={() => onSelect(m.id)}
              style={{ ['--i' as string]: i }}
            >
              <span className="hall-card__year">{m.year}</span>
              <span className="hall-card__era">{m.era}</span>
              <span className="hall-card__trophy" aria-hidden="true">
                🏆
              </span>
              <span className="hall-card__team">
                <TeamBadge team={m.champion.team} size={54} />
                <span className="hall-card__team-name">{m.champion.team}</span>
                <span className="hall-card__team-title">
                  第 {titles} 冠
                  <i>·</i>
                  {formatPurse(m.purse)}
                </span>
              </span>
              <span className="hall-card__final">
                <b>{m.score}</b>
                <span>
                  vs <em>{m.runnerUp.team}</em>
                </span>
              </span>
              <span className="hall-card__mvp">
                MVP <em>{m.mvp}</em>
              </span>
              <span className="hall-card__more">查看详情 →</span>
            </button>
          )
        })}
      </div>
      <p className="hall__hint" data-reveal>
        左右滑动浏览 · 点击任意一届进入详情
      </p>
    </section>
  )
}
