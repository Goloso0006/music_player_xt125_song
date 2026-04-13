import { useState } from "react"
import type { Playlist } from "../models/Playlist"
import type { Song } from "../models/Song"

type Props = {
  playlists: Playlist[]
  selectedPlaylistName: string
  onSelectPlaylist: (playlistName: string) => void
  onCreatePlaylist: (playlistName: string) => void
  onDeletePlaylist: (playlistName: string) => void
  currentSong: Song | null
  onAddToFavorites: (song: Song) => void
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
  onAddToFavorites
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
    <section className="rounded-xl border p-4">
      <h2 className="text-xl font-semibold">Music Player</h2>

      <div className="mt-4 rounded-lg border p-4">
        <p className="text-sm uppercase tracking-wide text-gray-500">Gestionar playlists</p>
        <div className="mt-2 flex gap-2">
          <input
            className="min-w-0 flex-1 rounded-md border px-3 py-2"
            type="text"
            value={playlistName}
            placeholder="Nueva playlist"
            onChange={(event) => setPlaylistName(event.target.value)}
          />
          <button className="rounded-md border px-3 py-2" onClick={handleCreatePlaylist}>
            Crear
          </button>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Playlist activa
            <select
              className="mt-2 block w-full rounded-md border px-3 py-2"
              value={selectedPlaylistName}
              onChange={(event) => onSelectPlaylist(event.target.value)}
            >
              {playlists.map((playlist) => (
                <option key={playlist.name} value={playlist.name}>
                  {playlist.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ul className="mt-4 space-y-2">
          {playlists.map((playlist) => (
            <li key={playlist.name} className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
              <button className="text-left" onClick={() => onSelectPlaylist(playlist.name)}>
                {playlist.name}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{playlist.getSongs().length} canciones</span>
                {playlist.name !== "Favoritos" && (
                  <button className="rounded-md border px-2 py-1 text-sm" onClick={() => onDeletePlaylist(playlist.name)}>
                    Eliminar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-lg bg-gray-900 p-4 text-white">
        <p className="text-sm uppercase tracking-wide text-gray-300">Playlist seleccionada</p>
        <p className="text-lg font-semibold">{selectedPlaylist?.name ?? "Sin playlist"}</p>
        <p className="text-sm text-gray-300">
          {selectedPlaylist?.getSongs().length ?? 0} canciones
        </p>
      </div>

      {currentSong && (
        <div className="mt-4 rounded-lg border p-4">
          <p className="text-sm uppercase tracking-wide text-gray-500">Reproduciendo ahora</p>
          <p className="text-lg font-semibold">{currentSong.title}</p>
          <p className="text-sm text-gray-600">{currentSong.artist}</p>
          <p className="text-sm text-gray-600">{formatDuration(currentSong.duration)}</p>
          <button
            className="mt-3 rounded-md border px-3 py-2"
            onClick={() => onAddToFavorites(currentSong)}
          >
            Añadir a favoritos
          </button>
        </div>
      )}
    </section>
  )
}

export default MusicPlayer