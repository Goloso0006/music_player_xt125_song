import { useEffect, useRef, useState } from "react"
import { Playlist } from "../models/Playlist"
import type { Song } from "../models/Song"

export const usePlayer = () => {
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const audioRef = useRef<HTMLAudioElement>(new Audio())

  const getSongSource = (song: Song) => {
    if (song.sourceUrl) {
      return song.sourceUrl
    }

    if (song.file) {
      return URL.createObjectURL(song.file)
    }

    return ""
  }

  const playCurrentSong = (song: Song) => {
    const source = getSongSource(song)

    if (!source) {
      return
    }

    audioRef.current.src = source
    void audioRef.current.play()
  }

  const syncCurrentSong = (playlist: Playlist, song: Song) => {
    let temp = playlist.songs.head

    while (temp) {
      if (temp.data.id === song.id) {
        playlist.songs.current = temp
        break
      }

      temp = temp.next
    }
  }

  // ▶️ Seleccionar playlist
  const setPlaylist = (playlist: Playlist) => {
    setCurrentPlaylist(playlist)

    const song = playlist.current() || playlist.songs.head?.data || null

    if (song) {
      setCurrentSong(song)
    }
  }

  // ▶️ Reproducir
  const play = () => {
    if (!currentSong) return

    playCurrentSong(currentSong)
  }

  // ⏸️ Pausar
  const pause = () => {
    audioRef.current.pause()
  }

  // ⏭️ Siguiente
  const next = () => {
    if (!currentPlaylist) return

    const nextSong = currentPlaylist.next()
    if (nextSong) {
      setCurrentSong(nextSong)
      playCurrentSong(nextSong)
    }
  }

  // ⏮️ Anterior
  const prev = () => {
    if (!currentPlaylist) return

    const prevSong = currentPlaylist.prev()
    if (prevSong) {
      setCurrentSong(prevSong)
      playCurrentSong(prevSong)
    }
  }

  const playSong = (playlist: Playlist, song: Song) => {
    setCurrentPlaylist(playlist)
    setCurrentSong(song)
    syncCurrentSong(playlist, song)
    playCurrentSong(song)
  }

  const setVolume = (value: number) => {
    audioRef.current.volume = Math.min(1, Math.max(0, value))
  }

  useEffect(() => {
    audioRef.current.onended = () => {
      next()
    }

    return () => {
      audioRef.current.onended = null
    }
  }, [next])

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