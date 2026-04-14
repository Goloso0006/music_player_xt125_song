import type { ChangeEvent } from "react"
import type { Song } from "../models/Song"
import { useNotification } from "../hooks/useNotification"
import { getRandomCover } from "../utils/coverSelector.ts"

type Props = {
  onSongsLoaded: (songs: Song[]) => void
}

const MAX_UPLOAD_BATCH = 10

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

const getFileNameWithoutExtension = (fileName: string) => {
  return fileName.replace(/\.[^/.]+$/, "")
}

const normalizeSongTitle = (title: string) => {
  return title
    .replace(/\s*[-–]\s*copy(?:\s*\(\d+\))?$/i, "")
    .replace(/\s*\(\d+\)$/i, "")
    .trim()
}

const createUploadedFileKey = (file: File) => {
  return [file.name.toLowerCase().trim(), file.size.toString()].join("|")
}

const SongForm = ({ onSongsLoaded }: Props) => {
  const { notify } = useNotification()

  const handleFolderUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget
    const files = input.files

    if (!files || files.length === 0) {
      return
    }

    const audioFiles = Array.from(files).filter((file) => file.type.startsWith("audio/"))
    if (audioFiles.length === 0) {
      notify("No se encontraron archivos de audio válidos", { variant: "warning" })
      input.value = ""
      return
    }

    const uniqueFiles: File[] = []
    const seenKeys = new Set<string>()

    audioFiles.forEach((file) => {
      const fileKey = createUploadedFileKey(file)

      if (seenKeys.has(fileKey)) {
        return
      }

      seenKeys.add(fileKey)
      uniqueFiles.push(file)
    })

    if (uniqueFiles.length < audioFiles.length) {
      notify(`Se omitieron ${audioFiles.length - uniqueFiles.length} archivo(s) duplicado(s) dentro de la carpeta`, { variant: "warning" })
    }

    const batchFiles = uniqueFiles.slice(0, MAX_UPLOAD_BATCH)

    if (uniqueFiles.length > MAX_UPLOAD_BATCH) {
      notify(`Solo se procesarán las primeras ${MAX_UPLOAD_BATCH} canciones por carga`, { variant: "info" })
    }

    try {
      const loadedSongs = await Promise.all(
        batchFiles.map(async (file): Promise<Song | null> => {
          try {
            const [duration, sourceUrl] = await Promise.all([
              getAudioDuration(file),
              readFileAsDataUrl(file)
            ])

            if (!sourceUrl) {
              throw new Error(`La canción no tiene contenido reproducible: ${file.name}`)
            }

            return {
              id: crypto.randomUUID(),
              title: normalizeSongTitle(getFileNameWithoutExtension(file.name)),
              duration,
              coverUrl: getRandomCover(),
              file,
              sourceUrl
            }
          } catch (error) {
            console.error(`Error cargando ${file.name}`, error)
            return null
          }
        })
      )

      const songs = loadedSongs.filter((song): song is Song => song !== null)

      if (songs.length === 0) {
        notify("No se pudieron cargar canciones", { variant: "error" })
        return
      }

      onSongsLoaded(songs)
    } catch (error) {
      console.error("Error inesperado al cargar canciones", error)
      notify("Ocurrió un error al procesar los archivos", { variant: "error" })
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