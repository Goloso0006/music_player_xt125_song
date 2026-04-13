import { useState } from "react"
import { Playlist } from "../models/Playlist"
import type { Song } from "../models/Song"

export const usePlaylist = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([
    new Playlist("Favoritos") // ❤️ por defecto
  ])

  const MAX_PLAYLISTS = 5

  // ➕ Crear playlist
  const createPlaylist = (name: string) => {
    if (playlists.length >= MAX_PLAYLISTS) {
      alert("Máximo 5 playlists")
      return
    }

    const newPlaylist = new Playlist(name)
    setPlaylists([...playlists, newPlaylist])
  }

  // ❌ Eliminar playlist
  const deletePlaylist = (name: string) => {
    if (name === "Favoritos") return // no se puede borrar

    setPlaylists(playlists.filter(p => p.name !== name))
  }

  // ➕ Agregar canción a playlist
  const addSongToPlaylist = (playlistName: string, song: Song) => {
    const updated = playlists.map(p => {
      if (p.name === playlistName) {
        p.addSong(song)
      }
      return p
    })

    setPlaylists([...updated])
  }

  // ❌ Eliminar canción
  const removeSongFromPlaylist = (playlistName: string, songId: string) => {
    const updated = playlists.map(p => {
      if (p.name === playlistName) {
        p.removeSong(songId)
      }
      return p
    })

    setPlaylists([...updated])
  }

  return {
    playlists,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
  }
}