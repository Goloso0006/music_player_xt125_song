import { useState, useRef } from "react"
import { Playlist } from "../models/Playlist"

export const usePlayer = () => {
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
  const [currentSong, setCurrentSong] = useState<any>(null)
  const audioRef = useRef(new Audio())

  // ▶️ Seleccionar playlist
  const setPlaylist = (playlist: Playlist) => {
    setCurrentPlaylist(playlist)
    const song = playlist.current()
    setCurrentSong(song)
  }

  // ▶️ Reproducir
  const play = () => {
    if (!currentSong) return

    audioRef.current.src = URL.createObjectURL(currentSong.file)
    audioRef.current.play()
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
      audioRef.current.src = URL.createObjectURL(nextSong.file)
      audioRef.current.play()
    }
  }

  // ⏮️ Anterior
  const prev = () => {
    if (!currentPlaylist) return

    const prevSong = currentPlaylist.prev()
    if (prevSong) {
      setCurrentSong(prevSong)
      audioRef.current.src = URL.createObjectURL(prevSong.file)
      audioRef.current.play()
    }
  }

  return {
    currentSong,
    setPlaylist,
    play,
    pause,
    next,
    prev
  }
}