import { useState } from "react"
import type { Song } from "../models/Song"

type Props = {
  title: string
  songs: Song[]
  currentSong: Song | null
  onPlay?: (song: Song) => void
  onRemove?: (songId: string) => void
  onMove?: (songId: string, targetIndex: number) => void
  onAddToPlaylist?: (song: Song) => void
  enableDragReorder?: boolean
  showPositionNumber?: boolean
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
  onMove,
  onAddToPlaylist,
  enableDragReorder = false,
  showPositionNumber = false,
  addButtonLabel = "Agregar",
  emptyMessage = "No hay canciones"
}: Props) => {
  const [draggedSongId, setDraggedSongId] = useState<string | null>(null)
  const [dragOverSongId, setDragOverSongId] = useState<string | null>(null)

  const canReorder = enableDragReorder && Boolean(onMove)

  const handleDrop = (targetIndex: number) => {
    if (!onMove || !draggedSongId) {
      return
    }

    onMove(draggedSongId, targetIndex)
    setDraggedSongId(null)
    setDragOverSongId(null)
  }

  return (
    <div className="song-list-block">
      <h3 className="section-title">{title}</h3>
      {canReorder && songs.length > 1 && (
        <p className="playlist-label">Arrastra para reordenar en esta playlist</p>
      )}

      {songs.length === 0 && <p className="empty-state">{emptyMessage}</p>}

      <ul className="song-list">
        {songs.map((song, index) => {
          const displayTitle = song.title.trim() || `Canción ${index + 1}`

          return (
          <li
            key={song.id}
            className={`song-item ${currentSong?.id === song.id ? "active" : ""} ${dragOverSongId === song.id ? "drag-over" : ""} ${draggedSongId === song.id ? "dragging" : ""}`}
            draggable={canReorder}
            onDragStart={() => {
              if (!canReorder) {
                return
              }

              setDraggedSongId(song.id)
            }}
            onDragOver={(event) => {
              if (!canReorder) {
                return
              }

              event.preventDefault()
              setDragOverSongId(song.id)
            }}
            onDrop={(event) => {
              if (!canReorder) {
                return
              }

              event.preventDefault()
              handleDrop(index)
            }}
            onDragEnd={() => {
              setDraggedSongId(null)
              setDragOverSongId(null)
            }}
          >
            <div className="song-main">
              {showPositionNumber && <span className="song-position">{index + 1}</span>}
              <div className="song-info">
                <p className="song-name">{displayTitle}</p>
                <p className="song-duration">{formatDuration(song.duration)}</p>
              </div>
            </div>
            <div className="song-actions">
              {onPlay && <button className="btn btn-secondary" type="button" onClick={() => onPlay(song)}>▶ Play</button>}
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
          )
        })}
      </ul>
    </div>
  )
}

export default SongList