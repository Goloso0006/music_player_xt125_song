import { useState } from "react"
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
  onVolumeChange
}: Props) => {
  const [playlistName, setPlaylistName] = useState("")
  const selectedPlaylist = playlists.find((playlist) => playlist.name === selectedPlaylistName) ?? null

  const handleCreatePlaylist = () => {
    const trimmedPlaylistName = playlistName.trim()

    if (!trimmedPlaylistName) {
      return
    }

    onCreatePlaylist(trimmedPlaylistName)
    onSelectPlaylist(trimmedPlaylistName)
    setPlaylistName("")
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
          <div className="progress-container" aria-hidden="true">
            <div className="time-display">
              <span>0:00</span>
              <span>{formatDuration(currentSong?.duration ?? 0)}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" />
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