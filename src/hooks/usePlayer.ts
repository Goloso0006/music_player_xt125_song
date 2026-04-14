import { useCallback, useEffect, useRef, useState } from "react"
import { Playlist } from "../models/Playlist"
import type { Song } from "../models/Song"

export const usePlayer = () => {
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
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
          setCurrentTime(0)
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
      syncCurrentSong(playlist, song)
      setCurrentSong(song)
      setCurrentTime(0)
    }
  }, [syncCurrentSong])

  // ▶️ Reproducir
  const play = useCallback(() => {
    const songToPlay = currentSong || currentPlaylist?.current() || currentPlaylist?.songs.head?.data || null

    if (!songToPlay || !currentPlaylist) return

    syncCurrentSong(currentPlaylist, songToPlay)
    setCurrentSong(songToPlay)
    void playCurrentSong(songToPlay)
  }, [currentPlaylist, currentSong, playCurrentSong, syncCurrentSong])

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
    setCurrentTime(0)
    syncCurrentSong(playlist, song)
    void playCurrentSong(song)
  }, [playCurrentSong, syncCurrentSong])

  const setVolume = useCallback((value: number) => {
    audioRef.current.volume = Math.min(1, Math.max(0, value))
  }, [])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current

    if (!Number.isFinite(time)) {
      return
    }

    const duration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : time
    const safeTime = Math.min(Math.max(time, 0), duration)

    audio.currentTime = safeTime
    setCurrentTime(safeTime)
  }, [])

  useEffect(() => {
    const audio = audioRef.current

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime)
    }

    audio.onended = () => {
      void next()
    }

    return () => {
      audio.ontimeupdate = null
      audio.onended = null
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
    currentTime,
    setPlaylist,
    play,
    pause,
    next,
    prev,
    playSong,
    setVolume,
    seek
  }
}