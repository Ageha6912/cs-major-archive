import { TEAM_LOGOS, monogram } from '../data'

export default function TeamBadge({ team, size = 44 }: { team: string; size?: number }) {
  const logo = TEAM_LOGOS[team]
  return (
    <span
      className="team-badge"
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.3) }}
      title={team}
    >
      <svg viewBox="0 0 100 100" className="team-badge__shape">
        <polygon
          points="50,4 90,27 90,73 50,96 10,73 10,27"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <polygon
          points="50,16 80,33 80,67 50,84 20,67 20,33"
          fill="rgba(255,255,255,0.035)"
          stroke="none"
        />
      </svg>
      {logo ? (
        <span className="team-badge__logo">
          <img src={logo} alt={team} />
        </span>
      ) : (
        <span className="team-badge__text" aria-hidden="true">
          {monogram(team)}
        </span>
      )}
    </span>
  )
}
