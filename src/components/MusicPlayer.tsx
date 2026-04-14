import { useState } from "react"
import type { MouseEvent } from "react"
import type { Playlist } from "../models/Playlist"
import type { Song } from "../models/Song"
import PlayerControls from "./PlayerControls"
import defaultCover from "../assets/default-cover.svg"

type Props = {
  playlists: Playlist[]
  selectedPlaylistName: string
  onSelectPlaylist: (playlistName: string) => void
  onCreatePlaylist: (playlistName: string) => void
  onDeletePlaylist: (playlistName: string) => void
  currentSong: Song | null
  onAddToFavorites: (song: Song) => void
  onPlay: () => void
  onPause: () => void
  onNext: () => void
  onPrev: () => void
  onVolumeChange: (value: number) => void
  currentTime: number
  onSeek: (time: number) => void
}

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

const MusicPlayer = ({
  playlists,
  selectedPlaylistName,
  onSelectPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
  currentSong,
  onAddToFavorites,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onVolumeChange,
  currentTime,
  onSeek
}: Props) => {
  const [playlistName, setPlaylistName] = useState("")
  const selectedPlaylist = playlists.find((playlist) => playlist.name === selectedPlaylistName) ?? null
  const duration = currentSong?.duration ?? 0
  const safeCurrentTime = Math.max(0, Math.min(currentTime, duration))
  const percentage = duration > 0 ? (safeCurrentTime / duration) * 100 : 0

  const handleCreatePlaylist = () => {
    const trimmedPlaylistName = playlistName.trim()

    if (!trimmedPlaylistName) {
      return
    }

    onCreatePlaylist(trimmedPlaylistName)
    onSelectPlaylist(trimmedPlaylistName)
    setPlaylistName("")
  }

  const handleSeek = (event: MouseEvent<HTMLDivElement>) => {
    if (duration <= 0) {
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const newTime = (clickX / rect.width) * duration

    onSeek(newTime)
  }

  return (
    <>
      <section className="panel player-main">
        <div className="now-playing">
          <div className="album-art">
            <img
              className="album-art-image"
              src={currentSong ? currentSong.coverUrl : defaultCover}
              alt={currentSong ? `Portada de ${currentSong.title}` : "Portada por defecto"}
            />
            <div className="album-art-overlay" aria-hidden="true" />
          </div>
          <h2 className="song-title">{currentSong?.title ?? "No hay canción"}</h2>
          <p className="song-artist">{currentSong?.artist ?? "Sube una carpeta de canciones"}</p>
          <div className="visualizer" aria-hidden="true">
            {Array.from({ length: 7 }).map((_, index) => (
              <span key={index} className="bar" />
            ))}
          </div>
          <div className="progress-container">
            <div className="time-display">
              <span>{formatDuration(safeCurrentTime)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
            <div
              className="progress-bar"
              role="progressbar"
              aria-label="Progreso de reproducción"
              aria-valuemin={0}
              aria-valuemax={Math.floor(duration)}
              aria-valuenow={Math.floor(safeCurrentTime)}
              onClick={handleSeek}
            >
              <div className="progress-fill" style={{ width: `${percentage}%` }} />
            </div>
          </div>
          {currentSong && (
            <button
              className="btn btn-favorite"
              type="button"
              onClick={() => onAddToFavorites(currentSong)}
            >
              Añadir a favoritos
            </button>
          )}

          <PlayerControls
            onPlay={onPlay}
            onPause={onPause}
            onNext={onNext}
            onPrev={onPrev}
            onVolumeChange={onVolumeChange}
          />
        </div>
      </section>

      <section className="panel playlist-section">
        <h2 className="section-title">Mis Playlists</h2>

        <div className="playlist-input-group">
          <input
            className="playlist-input"
            type="text"
            value={playlistName}
            placeholder="Nombre de la playlist..."
            onChange={(event) => setPlaylistName(event.target.value)}
          />
          <button className="btn" type="button" onClick={handleCreatePlaylist}>
            Crear
          </button>
        </div>

        <label className="playlist-label" htmlFor="playlist-select">
          Playlist activa
        </label>
        <select
          id="playlist-select"
          className="playlist-select"
          value={selectedPlaylistName}
          onChange={(event) => onSelectPlaylist(event.target.value)}
        >
          {playlists.map((playlist) => (
            <option key={playlist.name} value={playlist.name}>
              {playlist.name}
            </option>
          ))}
        </select>

        <ul className="playlist-list">
          {playlists.map((playlist) => (
            <li
              key={playlist.name}
              className={`playlist-item ${playlist.name === selectedPlaylistName ? "active" : ""}`}
            >
              <button className="playlist-name" type="button" onClick={() => onSelectPlaylist(playlist.name)}>
                {playlist.name}
              </button>
              <div className="playlist-meta">
                <span>{playlist.getSongs().length} canciones</span>
                {playlist.name !== "Favoritos" && (
                  <button
                    className="delete-btn"
                    type="button"
                    onClick={() => onDeletePlaylist(playlist.name)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>

        {!playlists.length && <p className="empty-state">No hay playlists aún</p>}

        <div className="playlist-selected">
          <p className="playlist-selected-label">Seleccionada</p>
          <p className="playlist-selected-name">{selectedPlaylist?.name ?? "Sin playlist"}</p>
          <p className="playlist-selected-count">{selectedPlaylist?.getSongs().length ?? 0} canciones</p>
        </div>
      </section>
    </>
  )
}

export default MusicPlayer