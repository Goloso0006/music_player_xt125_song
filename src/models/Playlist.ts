import { DoublyLinkedList } from "./DoublyLinkedList"
import type { Song } from "./Song"

export class Playlist {
  name: string
  songs: DoublyLinkedList

  constructor(name: string) {
    this.name = name
    this.songs = new DoublyLinkedList()
  }

  // ➕ agregar canción
  addSong(song: Song) {
    const exists = this.songs.toArray().some((currentSong) => currentSong.id === song.id)
    if (exists) {
      return
    }

    this.songs.add(song)
  }

  // ❌ eliminar canción
  removeSong(id: string) {
    this.songs.remove(id)
  }

  // 📋 obtener canciones
  getSongs(): Song[] {
    return this.songs.toArray()
  }

  // ▶️ siguiente
  next() {
    return this.songs.next()
  }

  // ⏮️ anterior
  prev() {
    return this.songs.prev()
  }

  // 🎵 actual
  current() {
    return this.songs.getCurrent()
  }
}