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
    <div className="song-list-block">
      <h3 className="section-title">{title}</h3>

      {songs.length === 0 && <p className="empty-state">{emptyMessage}</p>}

      <ul className="song-list">
        {songs.map((song) => (
          <li
            key={song.id}
            className={`song-item ${currentSong?.id === song.id ? "active" : ""}`}
          >
            <div className="song-info">
              <p className="song-name">{song.title}</p>
              <p className="song-duration">{song.artist} · {formatDuration(song.duration)}</p>
            </div>
            <div className="song-actions">
              {onPlay && <button className="btn btn-secondary" type="button" onClick={() => onPlay(song)}>▶ Reproducir</button>}
              {onAddToPlaylist && (
                <button className="btn btn-secondary" type="button" onClick={() => onAddToPlaylist(song)}>
                {addButtonLabel}
                </button>
              )}
              {onRemove && (
                <button className="delete-btn" type="button" onClick={() => onRemove(song.id)}>
                  Eliminar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SongList