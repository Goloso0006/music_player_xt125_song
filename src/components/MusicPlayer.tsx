import { usePlaylist } from "../hooks/usePlaylist"
import { usePlayer } from "../hooks/usePlayer"

import SongForm from "./SongForm"
import SongList from "./SongList"
import PlayerControls from "./PlayerControls"

const MusicPlayer = () => {
  const {
    playlists,
    addSongToPlaylist
  } = usePlaylist()

  const {
    currentSong,
    setPlaylist,
    play,
    pause,
    next,
    prev
  } = usePlayer()

  // 🎵 Playlist activa (por ahora usamos la primera = Favoritos)
  const currentPlaylist = playlists[0]

  return (
    <div>
      <h1>🎧 Music Player</h1>

      {/* 📂 Subir canciones */}
      <SongForm
        onSongsLoaded={(songs) => {
          songs.forEach(song => {
            addSongToPlaylist("Favoritos", song)
          })
        }}
      />

      {/* 🎵 Lista de canciones */}
      <SongList
        songs={currentPlaylist?.getSongs() || []}
        onPlay={(song) => {
          setPlaylist(currentPlaylist)
          // ⚠️ aún no forzamos current exacto (lo mejoramos luego)
          play()
        }}
      />

      {/* 🎮 Controles */}
      <PlayerControls
        onPlay={play}
        onPause={pause}
        onNext={next}
        onPrev={prev}
      />

      {/* 🎶 Canción actual */}
      {currentSong && (
        <div>
          <h3>Reproduciendo:</h3>
          <p>{currentSong.title}</p>
        </div>
      )}
    </div>
  )
}

export default MusicPlayer