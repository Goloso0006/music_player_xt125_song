import type { Song } from "../models/Song"

type Props = {
  title: string
  songs: Song[]
  currentSong: Song | null
  onPlay?: (song: Song) => void
  onRemove?: (songId: string) => void
  onAddToPlaylist?: (song: Song) => void
  addButtonLabel?: string
  emptyMessage?: string
}

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

const SongList = ({
  title,
  songs,
  currentSong,
  onPlay,
  onRemove,
  onAddToPlaylist,
  addButtonLabel = "Agregar",
  emptyMessage = "No hay canciones"
}: Props) => {
  return (
    <div>
      <h2>{title}</h2>

      {songs.length === 0 && <p>{emptyMessage}</p>}

      <ul>
        {songs.map((song) => (
          <li
            key={song.id}
            style={{
              fontWeight: currentSong?.id === song.id ? "bold" : "normal"
            }}
          >
            <span>
              {song.title} - {song.artist} - {formatDuration(song.duration)}
            </span>
            {onPlay && <button onClick={() => onPlay(song)}>▶️</button>}
            {onAddToPlaylist && (
              <button type="button" onClick={() => onAddToPlaylist(song)}>
                {addButtonLabel}
              </button>
            )}
            {onRemove && (
              <button type="button" onClick={() => onRemove(song.id)}>
                🗑️
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SongList