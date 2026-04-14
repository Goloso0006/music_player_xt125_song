import { useEffect, useState } from "react"
import { Playlist } from "../models/Playlist"
import type { Song } from "../models/Song"
import { useNotification } from "./useNotification"

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
const MAX_LIBRARY_SONGS = 50
const FALLBACK_COVER_URL = "/default/krisR.webp"

const normalizeSongText = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

const createSongKey = (song: Pick<Song, "title" | "duration" | "sourceUrl">) => {
  if (song.sourceUrl) {
    return song.sourceUrl
  }

  return [
    normalizeSongText(song.title),
    Math.round(song.duration).toString()
  ].join("|")
}

const legacyCoverMap: Record<string, string> = {
  "/default/COVERGANASKRISR.webp": "/default/COVER.webp",
  "/default/loswawancoconsaborcolombian.webp": "/default/loswawan.webp"
}

const normalizeCoverUrl = (coverUrl?: string) => {
  if (!coverUrl) {
    return FALLBACK_COVER_URL
  }

  let normalizedCover = coverUrl

  if (normalizedCover.startsWith("/covers/default/")) {
    normalizedCover = normalizedCover.replace("/covers/default/", "/default/")
  }

  return legacyCoverMap[normalizedCover] || normalizedCover
}

const createDefaultPlaylists = () => [new Playlist(FAVORITES_PLAYLIST)]

const hydratePlaylists = (storedPlaylists: StoredPlaylist[]) => {
  const playlists = storedPlaylists.map((storedPlaylist) => {
    const playlist = new Playlist(storedPlaylist.name)

    storedPlaylist.songs.forEach((song) => {
      playlist.addSong({
        ...song,
        coverUrl: normalizeCoverUrl(song.coverUrl)
      } as Song)
    })

    return playlist
  })

  return playlists.length > 0 ? playlists : createDefaultPlaylists()
}

const hydrateLibrarySongs = (storedSongs: StoredSong[]) => {
  return storedSongs.map((song) => ({
    ...song,
    coverUrl: normalizeCoverUrl(song.coverUrl)
  }) as Song)
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
  const { notify } = useNotification()
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
        if (currentSongs.length >= MAX_LIBRARY_SONGS) {
          notify("Límite alcanzado: máximo 50 canciones en biblioteca", { variant: "warning" })
          return currentSongs
        }

        const existingKeys = new Set(currentSongs.map(createSongKey))
        const uniqueSongs: Song[] = []
        const seenKeys = new Set<string>()

        songs.forEach((song) => {
          const songKey = createSongKey(song)

          if (existingKeys.has(songKey) || seenKeys.has(songKey)) {
            return
          }

          seenKeys.add(songKey)
          uniqueSongs.push(song)
        })

        const duplicateCount = songs.length - uniqueSongs.length
        const newSongs = uniqueSongs
        const remainingSlots = MAX_LIBRARY_SONGS - currentSongs.length

        if (duplicateCount > 0) {
          notify(`Se omitieron ${duplicateCount} canción(es) duplicada(s)`, { variant: "info" })
        }

        if (newSongs.length > remainingSlots) {
          notify(`Solo se agregaron ${remainingSlots} canción(es). Límite máximo: 50`, { variant: "warning" })
        }

        const songsToAdd = newSongs.slice(0, Math.max(0, remainingSlots))

        return [...currentSongs, ...songsToAdd]
      })
    }

  // ➕ Crear playlist
  const createPlaylist = (name: string) => {
    const sanitizedName = name.trim()

    if (!sanitizedName) {
      return
    }

    if (playlists.length >= MAX_PLAYLISTS) {
      notify("Máximo 5 playlists", { variant: "warning" })
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