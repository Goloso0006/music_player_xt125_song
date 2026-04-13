import { useCallback, useEffect, useRef, useState } from "react"
import { Playlist } from "../models/Playlist"
import type { Song } from "../models/Song"

export const usePlayer = () => {
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const audioRef = useRef<HTMLAudioElement>(new Audio())
  const activeObjectUrlRef = useRef<string | null>(null)

  const revokeActiveObjectUrl = useCallback(() => {
    if (!activeObjectUrlRef.current) {
      return
    }

    URL.revokeObjectURL(activeObjectUrlRef.current)
    activeObjectUrlRef.current = null
  }, [])

  const getSongSource = useCallback((song: Song) => {
    if (song.sourceUrl) {
      revokeActiveObjectUrl()
      return song.sourceUrl
    }

    if (song.file) {
      revokeActiveObjectUrl()
      const objectUrl = URL.createObjectURL(song.file)
      activeObjectUrlRef.current = objectUrl
      return objectUrl
    }

    return ""
  }, [revokeActiveObjectUrl])

  const playCurrentSong = useCallback(
    async (song: Song) => {
      try {
        const source = getSongSource(song)

        if (!source) {
          return
        }

        const audio = audioRef.current

        if (audio.src !== source) {
          audio.pause()
          audio.src = source
          audio.load()
        }

        await audio.play()
      } catch (error) {
        console.error("No se pudo reproducir la canción", error)
      }
    },
    [getSongSource]
  )

  const syncCurrentSong = useCallback((playlist: Playlist, song: Song) => {
    let temp = playlist.songs.head

    while (temp) {
      if (temp.data.id === song.id) {
        playlist.songs.current = temp
        break
      }

      temp = temp.next
    }
  }, [])

  // ▶️ Seleccionar playlist
  const setPlaylist = useCallback((playlist: Playlist) => {
    setCurrentPlaylist(playlist)

    const song = playlist.current() || playlist.songs.head?.data || null

    if (song) {
      setCurrentSong(song)
    }
  }, [])

  // ▶️ Reproducir
  const play = useCallback(() => {
    if (!currentSong) return

    void playCurrentSong(currentSong)
  }, [currentSong, playCurrentSong])

  // ⏸️ Pausar
  const pause = useCallback(() => {
    audioRef.current.pause()
  }, [])

  // ⏭️ Siguiente
  const next = useCallback(() => {
    if (!currentPlaylist) return

    const nextSong = currentPlaylist.next()
    if (nextSong) {
      setCurrentSong(nextSong)
      void playCurrentSong(nextSong)
    }
  }, [currentPlaylist, playCurrentSong])

  // ⏮️ Anterior
  const prev = useCallback(() => {
    if (!currentPlaylist) return

    const prevSong = currentPlaylist.prev()
    if (prevSong) {
      setCurrentSong(prevSong)
      void playCurrentSong(prevSong)
    }
  }, [currentPlaylist, playCurrentSong])

  const playSong = useCallback((playlist: Playlist, song: Song) => {
    setCurrentPlaylist(playlist)
    setCurrentSong(song)
    syncCurrentSong(playlist, song)
    void playCurrentSong(song)
  }, [playCurrentSong, syncCurrentSong])

  const setVolume = useCallback((value: number) => {
    audioRef.current.volume = Math.min(1, Math.max(0, value))
  }, [])

  useEffect(() => {
    audioRef.current.onended = () => {
      void next()
    }

    return () => {
      audioRef.current.onended = null
    }
  }, [next])

  useEffect(() => {
    return () => {
      const audio = audioRef.current
      audio.pause()
      audio.src = ""
      revokeActiveObjectUrl()
    }
  }, [revokeActiveObjectUrl])

  return {
    currentSong,
    setPlaylist,
    play,
    pause,
    next,
    prev,
    playSong,
    setVolume
  }
}