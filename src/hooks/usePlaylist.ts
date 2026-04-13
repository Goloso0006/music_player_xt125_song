import { useEffect, useState } from "react"
import { Playlist } from "../models/Playlist"
import type { Song } from "../models/Song"

type StoredSong = Omit<Song, "file">

type StoredPlaylist = {
  name: string
  songs: StoredSong[]
}

type StoredState = {
  librarySongs: StoredSong[]
  playlists: StoredPlaylist[]
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

const hydrateLibrarySongs = (storedSongs: StoredSong[]) => {
  return storedSongs.map((song) => song as Song)
}

const serializeSongs = (songs: Song[]): StoredSong[] => {
  return songs.map((song) => {
    const { file, ...rest } = song
    return rest
  })
}

const serializePlaylists = (playlists: Playlist[]): StoredPlaylist[] => {
  return playlists.map((playlist) => ({
    name: playlist.name,
    songs: serializeSongs(playlist.getSongs())
  }))
}

const readStoredState = (): StoredState | null => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const rawPlaylists = localStorage.getItem(STORAGE_KEY)

    if (!rawPlaylists) {
      return null
    }

    const parsedPlaylists = JSON.parse(rawPlaylists)

      if (Array.isArray(parsedPlaylists)) {
        return {
          librarySongs: [],
          playlists: parsedPlaylists as StoredPlaylist[]
        }
      }

      if (parsedPlaylists && typeof parsedPlaylists === "object") {
        const storedState = parsedPlaylists as Partial<StoredState>

        return {
          librarySongs: Array.isArray(storedState.librarySongs) ? storedState.librarySongs : [],
          playlists: Array.isArray(storedState.playlists) ? storedState.playlists : []
        }
      }

      return null
  } catch (error) {
    console.error("No se pudieron leer playlists de localStorage", error)
    return null
  }
}

  const saveState = (librarySongs: Song[], playlists: Playlist[]) => {
  if (typeof window === "undefined") {
    return
  }

  try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          librarySongs: serializeSongs(librarySongs),
          playlists: serializePlaylists(playlists)
        })
      )
  } catch (error) {
    console.error("No se pudieron guardar playlists en localStorage", error)
  }
}

export const usePlaylist = () => {
    const storedState = readStoredState()

    const [librarySongs, setLibrarySongs] = useState<Song[]>(() => {
      if (!storedState) {
        return []
      }

      return hydrateLibrarySongs(storedState.librarySongs)
    })

    const [playlists, setPlaylists] = useState<Playlist[]>(() => {
      if (!storedState) {
        return createDefaultPlaylists()
      }

      return hydratePlaylists(storedState.playlists)
  })

  useEffect(() => {
      saveState(librarySongs, playlists)
    }, [librarySongs, playlists])

    const addSongsToLibrary = (songs: Song[]) => {
      setLibrarySongs((currentSongs) => {
        const existingIds = new Set(currentSongs.map((song) => song.id))
        const newSongs = songs.filter((song) => !existingIds.has(song.id))

        return [...currentSongs, ...newSongs]
      })
    }

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
      return currentPlaylists.map((playlist) => {
        if (playlist.name !== playlistName) {
          return playlist
        }

        const updatedPlaylist = new Playlist(playlist.name)
        playlist.getSongs().forEach((currentSong) => {
          updatedPlaylist.addSong(currentSong)
        })
        updatedPlaylist.addSong(song)

        return updatedPlaylist
      })
    })
  }

  const addToFavorites = (song: Song) => {
    addSongToPlaylist(FAVORITES_PLAYLIST, song)
  }

  // ❌ Eliminar canción
  const removeSongFromPlaylist = (playlistName: string, songId: string) => {
    setPlaylists((currentPlaylists) => {
      return currentPlaylists.map((playlist) => {
        if (playlist.name !== playlistName) {
          return playlist
        }

        const updatedPlaylist = new Playlist(playlist.name)
        playlist.getSongs()
          .filter((song) => song.id !== songId)
          .forEach((song) => {
            updatedPlaylist.addSong(song)
          })

        return updatedPlaylist
      })
    })
  }

  return {
    librarySongs,
    playlists,
    addSongsToLibrary,
    createPlaylist,
    deletePlaylist,
    addSongToPlaylist,
    addToFavorites,
    removeSongFromPlaylist
  }
}