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
  const [isPlaying, setIsPlaying] = useState(false)

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    setVolume(value)
    onVolumeChange(value)
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause()
      setIsPlaying(false)
      return
    }

    onPlay()
    setIsPlaying(true)
  }

  return (
    <section className="controls-section">
      <div className="controls">
        <button className="control-btn" type="button" onClick={onPrev} aria-label="Anterior">
          ⏮
        </button>
        <button className="control-btn play-btn" type="button" onClick={handlePlayPause} aria-label="Reproducir o pausar">
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button className="control-btn" type="button" onClick={onNext} aria-label="Siguiente">
          ⏭
        </button>
        <div className="volume-container">
          <span className="volume-icon">🔊</span>
          <input
            className="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Volumen"
          />
        </div>
      </div>
    </section>
  )
}

export default PlayerControls