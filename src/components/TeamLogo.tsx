import { TEAM_LOGOS, monogram } from '../data'

export default function TeamLogo({
  team,
  size = 24,
  className = '',
}: {
  team: string
  size?: number
  className?: string
}) {
  const logo = TEAM_LOGOS[team]
  if (logo) {
    return (
      <img
        src={logo}
        alt={team}
        title={team}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`tl-logo-img ${className}`}
      />
    )
  }
  return (
    <span
      title={team}
      className={`tl-logo-fallback ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(8, size * 0.28) }}
    >
      {monogram(team)}
    </span>
  )
}
