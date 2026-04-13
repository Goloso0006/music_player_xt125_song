import { Node } from "./Node"
import type { Song } from "./Song"

export class DoublyLinkedList {
  head: Node | null = null
  tail: Node | null = null
  current: Node | null = null

  // ➕ Agregar al final
  add(song: Song) {
    const newNode = new Node(song)

    if (!this.head) {
      this.head = this.tail = this.current = newNode
      return
    }

    newNode.prev = this.tail
    if (this.tail) this.tail.next = newNode
    this.tail = newNode
  }

  // ❌ Eliminar por id
  remove(id: string) {
    let temp = this.head

    while (temp) {
      if (temp.data.id === id) {
        // si es head
        if (temp === this.head) {
          this.head = temp.next
          if (this.head) this.head.prev = null
        }
        // si es tail
        else if (temp === this.tail) {
          this.tail = temp.prev
          if (this.tail) this.tail.next = null
        }
        // nodo intermedio
        else {
          if (temp.prev) temp.prev.next = temp.next
          if (temp.next) temp.next.prev = temp.prev
        }

        // ajustar current
        if (this.current === temp) {
          this.current = temp.next || temp.prev
        }

        return
      }
      temp = temp.next
    }
  }

  // ▶️ Siguiente canción
  next() {
    if (this.current?.next) {
      this.current = this.current.next
    }
    return this.current?.data || null
  }

  // ⏮️ Canción anterior
  prev() {
    if (this.current?.prev) {
      this.current = this.current.prev
    }
    return this.current?.data || null
  }

  // 🎵 Canción actual
  getCurrent() {
    return this.current?.data || null
  }

  // 📋 Convertir a array (para UI)
  toArray(): Song[] {
    const songs: Song[] = []
    let temp = this.head

    while (temp) {
      songs.push(temp.data)
      temp = temp.next
    }

    return songs
  }
}