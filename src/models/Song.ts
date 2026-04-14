export interface Song {
  id: string
  title: string
  artist: string
  duration: number
  coverUrl: string
  file?: File
  sourceUrl?: string
}