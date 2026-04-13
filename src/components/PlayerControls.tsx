type Props = {
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onPrev: () => void
}

const PlayerControls = ({ onPlay, onPause, onNext, onPrev }: Props) => {
  return (
    <div>
      <h2>Controles</h2>

      <button onClick={onPrev}>⏮️</button>
      <button onClick={onPlay}>▶️</button>
      <button onClick={onPause}>⏸️</button>
      <button onClick={onNext}>⏭️</button>
    </div>
  )
}

export default PlayerControls