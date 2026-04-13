import type { ChangeEvent } from "react"
import type { Song } from "../models/Song"

type Props = {
  onSongsLoaded: (songs: Song[]) => void
}

const readFileAsDataUrl = (file: File) => {
  return new Promise<string>((resolve) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "")
    }

    reader.onerror = () => {
      resolve("")
    }

    reader.readAsDataURL(file)
  })
}

const getAudioDuration = (file: File) => {
  return new Promise<number>((resolve) => {
    const audio = document.createElement("audio")
    const objectUrl = URL.createObjectURL(file)

    audio.preload = "metadata"
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(audio.duration || 0)
    }
    audio.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(0)
    }
    audio.src = objectUrl
  })
}

const SongForm = ({ onSongsLoaded }: Props) => {
  const handleFolderUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.currentTarget.files
    if (!files) return

    const audioFiles = Array.from(files).filter((file) => file.type.startsWith("audio/"))

    const songs = await Promise.all(
      audioFiles.map(async (file) => {
        const [duration, sourceUrl] = await Promise.all([
          getAudioDuration(file),
          readFileAsDataUrl(file)
        ])

        return {
          id: crypto.randomUUID(),
          title: file.name,
          artist: "Desconocido",
          duration,
          file,
          sourceUrl
        }
      })
    )

    onSongsLoaded(songs)
    event.currentTarget.value = ""
  }

  return (
    <div>
      <h2>Cargar carpeta de canciones</h2>

      <input
        type="file"
        multiple
        accept="audio/*"
        // @ts-ignore
        webkitdirectory="true"
        onChange={handleFolderUpload}
      />
    </div>
  )
}

export default SongForm