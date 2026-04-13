import { useEffect, useState } from "react"
import { Playlist } from "../models/Playlist"
import type { Song } from "../models/Song"

type StoredSong = Omit<Song, "file">

type StoredPlaylist = {
  name: string
  songs: StoredSong[]
}

const STORAGE_KEY = "playlists"
const FAVORITES_PLAYLIST = "Favoritos"
const MAX_PLAYLISTS = 5

const createDefaultPlaylists = () => [new Playlist(FAVORITES_PLAYLIST)]

const hydratePlaylists = (storedPlaylists: StoredPlaylist[]) => {
  const playlists = storedPlaylists.map((storedPlaylist) => {
    const playlist = new Playlist(storedPlaylist.name)

    storedPlaylist.songs.forEach((song) => {
      playlist.addSong(song as Song)
    })

    return playlist
  })

  return playlists.length > 0 ? playlists : createDefaultPlaylists()
}

const serializePlaylists = (playlists: Playlist[]): StoredPlaylist[] => {
  return playlists.map((playlist) => ({
    name: playlist.name,
    songs: playlist.getSongs().map((song) => {
      const { file, ...rest } = song
      return rest
    })
  }))
}

const readStoredPlaylists = (): StoredPlaylist[] | null => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const rawPlaylists = localStorage.getItem(STORAGE_KEY)

    if (!rawPlaylists) {
      return null
    }

    const parsedPlaylists = JSON.parse(rawPlaylists)
    return Array.isArray(parsedPlaylists) ? (parsedPlaylists as StoredPlaylist[]) : null
  } catch (error) {
    console.error("No se pudieron leer playlists de localStorage", error)
    return null
  }
}

const savePlaylists = (playlists: Playlist[]) => {
  if (typeof window === "undefined") {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializePlaylists(playlists)))
  } catch (error) {
    console.error("No se pudieron guardar playlists en localStorage", error)
  }
}

export const usePlaylist = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const storedPlaylists = readStoredPlaylists()

    if (!storedPlaylists) {
      return createDefaultPlaylists()
    }

    return hydratePlaylists(storedPlaylists)
  })

  useEffect(() => {
    savePlaylists(playlists)
  }, [playlists])

  // ➕ Crear playlist
  const createPlaylist = (name: string) => {
    const sanitizedName = name.trim()

    if (!sanitizedName) {
      return
    }

    if (playlists.length >= MAX_PLAYLISTS) {
      alert("Máximo 5 playlists")
      return
    }

    const exists = playlists.some((playlist) => playlist.name === sanitizedName)
    if (exists) {
      return
    }

    setPlaylists((currentPlaylists) => [...currentPlaylists, new Playlist(sanitizedName)])
  }

  // ❌ Eliminar playlist
  const deletePlaylist = (name: string) => {
    if (name === FAVORITES_PLAYLIST) return // no se puede borrar

    setPlaylists((currentPlaylists) => currentPlaylists.filter((playlist) => playlist.name !== name))
  }

  // ➕ Agregar canción a playlist
  const addSongToPlaylist = (playlistName: string, song: Song) => {
    setPlaylists((currentPlaylists) => {
      const updatedPlaylists = currentPlaylists.map((playlist) => {
        if (playlist.name === playlistName) {
          playlist.addSong(song)
        }

        return playlist
      })

      return [...updatedPlaylists]
    })
  }

  const addToFavorites = (song: Song) => {
    addSongToPlaylist(FAVORITES_PLAYLIST, song)
  }

  // ❌ Eliminar canción
  const removeSongFromPlaylist = (playlistName: string, songId: string) => {
    setPlaylists((currentPlaylists) => {
      const updatedPlaylists = currentPlaylists.map((playlist) => {
        if (playlist.name === playlistName) {
          playlist.removeSong(songId)
        }

        return playlist
      })

      return [...updatedPlaylists]
    })
  }

  return {
    playlists,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    addToFavorites,
    removeSongFromPlaylist
  }
}