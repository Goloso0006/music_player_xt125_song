import type { Song } from "../models/Song"

type Props = {
  songs: Song[]
  currentSong: Song | null
  onPlay: (song: Song) => void
  onRemove?: (songId: string) => void
}

const formatDuration = (duration: number) => {
  const minutes = Math.floor(duration / 60)
  const seconds = Math.floor(duration % 60)

  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

const SongList = ({ songs, currentSong, onPlay, onRemove }: Props) => {
  return (
    <div>
      <h2>Lista de canciones</h2>

      {songs.length === 0 && <p>No hay canciones</p>}

      <ul>
        {songs.map((song) => (
          <li
            key={song.id}
            style={{
              fontWeight: currentSong?.id === song.id ? "bold" : "normal"
            }}
          >
            <span>
              {song.title} - {song.artist} - {formatDuration(song.duration)}
            </span>
            <button onClick={() => onPlay(song)}>▶️</button>
            {onRemove && <button onClick={() => onRemove(song.id)}>🗑️</button>}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SongList