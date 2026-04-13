import type { Song } from "./Song"

export class Node {
  data: Song
  next: Node | null = null
  prev: Node | null = null

  constructor(data: Song) {
    this.data = data
  }
}