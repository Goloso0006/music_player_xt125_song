import { useEffect, useState } from "react"
import './App.css'
import MusicPlayer from './components/MusicPlayer'
import PlayerControls from './components/PlayerControls'
import SongForm from './components/SongForm'
import SongList from './components/SongList'
import { Playlist } from './models/Playlist'
import { usePlaylist } from './hooks/usePlaylist'
import { usePlayer } from './hooks/usePlayer'
import type { Song } from './models/Song'

function App() {
  const {
    librarySongs,
    playlists,
    addSongsToLibrary,
    addSongToPlaylist,
    removeSongFromPlaylist,
    createPlaylist,
    deletePlaylist,
    addToFavorites
  } = usePlaylist()

  const {
    currentSong,
    setPlaylist,
    play,
    pause,
    next,
    prev,
    playSong,
    setVolume
  } = usePlayer()

  const [selectedPlaylistName, setSelectedPlaylistName] = useState("Favoritos")

  const selectedPlaylist = playlists.find((playlist) => playlist.name === selectedPlaylistName) ?? playlists[0] ?? null

  useEffect(() => {
    if (playlists.length === 0) {
      return
    }

    const playlistExists = playlists.some((playlist) => playlist.name === selectedPlaylistName)
    if (!playlistExists) {
      setSelectedPlaylistName(playlists[0].name)
    }
  }, [playlists, selectedPlaylistName])

  useEffect(() => {
    if (selectedPlaylist) {
      setPlaylist(selectedPlaylist)
    }
  }, [selectedPlaylist, setPlaylist])

  const handleSongsLoaded = (songs: Song[]) => {
    addSongsToLibrary(songs)
  }

  const handlePlaySong = (song: Song) => {
    if (!selectedPlaylist) return

    playSong(selectedPlaylist, song)
  }

  const handlePlayLibrarySong = (song: Song) => {
    if (librarySongs.length === 0) return

    const libraryPlaylist = new Playlist("Biblioteca global")
    librarySongs.forEach((librarySong) => {
      libraryPlaylist.addSong(librarySong)
    })

    playSong(libraryPlaylist, song)
  }

  const handleRemoveSong = (songId: string) => {
    if (!selectedPlaylist) return

    removeSongFromPlaylist(selectedPlaylist.name, songId)
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1 className="app-logo">XT125</h1>
      </header>

      <MusicPlayer
        playlists={playlists}
        selectedPlaylistName={selectedPlaylist?.name ?? "Favoritos"}
        onSelectPlaylist={setSelectedPlaylistName}
        onCreatePlaylist={createPlaylist}
        onDeletePlaylist={deletePlaylist}
        currentSong={currentSong}
        onAddToFavorites={addToFavorites}
      />

      <section className="panel panel-songs">
        <h2 className="section-title">Canciones</h2>
        <SongForm onSongsLoaded={handleSongsLoaded} />
        <SongList
          title="Biblioteca global"
          songs={librarySongs}
          currentSong={null}
          onPlay={handlePlayLibrarySong}
          onAddToPlaylist={(song) => {
            if (!selectedPlaylist) return

            addSongToPlaylist(selectedPlaylist.name, song)
          }}
          addButtonLabel={`Agregar a ${selectedPlaylist?.name ?? "playlist"}`}
          emptyMessage="Todavía no hay canciones cargadas"
        />
      </section>

      <section className="panel panel-playlist-tracks">
        <SongList
          title={`Canciones de ${selectedPlaylist?.name ?? "playlist"}`}
          songs={selectedPlaylist?.getSongs() ?? []}
          currentSong={currentSong}
          onPlay={handlePlaySong}
          onRemove={handleRemoveSong}
          emptyMessage="Esta playlist no tiene canciones"
        />
        <PlayerControls
          onPlay={play}
          onPause={pause}
          onNext={next}
          onPrev={prev}
          onVolumeChange={setVolume}
        />
      </section>
    </main>
  )
}

export default App
