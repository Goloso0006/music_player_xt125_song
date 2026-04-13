import type { ChangeEvent } from "react"
import type { Song } from "../models/Song"

type Props = {
  onSongsLoaded: (songs: Song[]) => void
}

const readFileAsDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve(typeof reader.result === "string" ? reader.result : "")
    }

    reader.onerror = () => {
      reject(new Error(`No se pudo leer el archivo: ${file.name}`))
    }

    try {
      reader.readAsDataURL(file)
    } catch (error) {
      reject(error)
    }
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
    const input = event.currentTarget
    const files = input.files

    if (!files || files.length === 0) {
      return
    }

    const audioFiles = Array.from(files).filter((file) => file.type.startsWith("audio/"))
    if (audioFiles.length === 0) {
      alert("No se encontraron archivos de audio válidos")
      input.value = ""
      return
    }

    try {
      const loadedSongs = await Promise.all(
        audioFiles.map(async (file): Promise<Song | null> => {
          try {
            const [duration, sourceUrl] = await Promise.all([
              getAudioDuration(file),
              readFileAsDataUrl(file)
            ])

            if (!sourceUrl) {
              throw new Error(`La canción no tiene contenido reproducible: ${file.name}`)
            }

            const song: Song = {
              id: crypto.randomUUID(),
              title: file.name,
              artist: "Desconocido",
              duration,
              file,
              sourceUrl
            }

            return song
          } catch (error) {
            console.error(`Error cargando ${file.name}`, error)
            return null
          }
        })
      )

      const songs = loadedSongs.filter((song): song is Song => song !== null)

      if (songs.length === 0) {
        alert("No se pudieron cargar canciones")
        return
      }

      onSongsLoaded(songs)
    } catch (error) {
      console.error("Error inesperado al cargar canciones", error)
      alert("Ocurrió un error al procesar los archivos")
    } finally {
      input.value = ""
    }
  }

  return (
    <div className="upload-block">
      <p className="upload-label">Carga una carpeta de canciones</p>

      <label className="btn file-upload-btn" htmlFor="folder-upload">
        📁 Cargar Canciones
      </label>
      <input
        id="folder-upload"
        className="file-input-hidden"
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