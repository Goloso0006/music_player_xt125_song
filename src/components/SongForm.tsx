import type { Song } from "../models/Song"

type Props = {
  onSongsLoaded: (songs: Song[]) => void
}

const SongForm = ({ onSongsLoaded }: Props) => {

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const songs: Song[] = []

    Array.from(files).forEach((file) => {
      // 🎵 Filtrar solo mp3
      if (file.type === "audio/mpeg") {
        const song: Song = {
          id: crypto.randomUUID(),
          title: file.name,
          artist: "Desconocido",
          duration: 0,
          file: file
        }

        songs.push(song)
      }
    })

    onSongsLoaded(songs)
  }

  return (
    <div>
      <h2>Cargar carpeta de canciones</h2>

      <input
        type="file"
        multiple
        //@ts-ignore
        webkitdirectory="true"
        onChange={handleFolderUpload}
      />
    </div>
  )
}

export default SongForm