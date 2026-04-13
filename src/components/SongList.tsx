import type { Song } from "../models/Song"

type Props = {
  songs: Song[]
  onPlay: (song: Song) => void
}

const SongList = ({ songs, onPlay }: Props) => {
  return (
    <div>
      <h2>Lista de canciones</h2>

      {songs.length === 0 && <p>No hay canciones</p>}

      <ul>
        {songs.map((song) => (
          <li key={song.id}>
            {song.title}
            <button onClick={() => onPlay(song)}>
              ▶️
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SongList