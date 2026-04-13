export interface Song {
  id: string
  title: string
  artist: string
  duration: number
  file?: File
  sourceUrl?: string
}