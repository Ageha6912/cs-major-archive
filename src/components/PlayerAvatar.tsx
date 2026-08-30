import { playerImage } from '../data'

export default function PlayerAvatar({ name, size }: { name: string; size: number }) {
  const image = playerImage(name)
  const dimensions = { width: size, height: size }
  if (image) {
    return <img src={image} alt="" loading="lazy" className="player-avatar" style={dimensions} />
  }
  return (
    <span aria-hidden="true" className="player-avatar player-avatar--fallback" style={dimensions}>
      {name.slice(0, 2).toUpperCase()}
    </span>
  )
}
