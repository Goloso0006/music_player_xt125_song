import { useState, type ChangeEvent } from "react"

type Props = {
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onPrev: () => void
  onVolumeChange: (value: number) => void
}

const PlayerControls = ({ onPlay, onPause, onNext, onPrev, onVolumeChange }: Props) => {
  const [volume, setVolume] = useState(1)

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    setVolume(value)
    onVolumeChange(value)
  }

  return (
    <div>
      <h2>Controles</h2>

      <button onClick={onPrev}>⏮️</button>
      <button onClick={onPlay}>▶️</button>
      <button onClick={onPause}>⏸️</button>
      <button onClick={onNext}>⏭️</button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        aria-label="Volumen"
      />
    </div>
  )
}

export default PlayerControls