import { useEffect, useState } from "react"
import './App.css'
import MusicPlayer from './components/MusicPlayer'
import PlayerControls from './components/PlayerControls'
import SongForm from './components/SongForm'
import SongList from './components/SongList'
import { usePlaylist } from './hooks/usePlaylist'
import { usePlayer } from './hooks/usePlayer'
import type { Song } from './models/Song'

function App() {
  const {
    playlists,
    addSongToPlaylist,
    removeSongFromPlaylist,
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
    if (!selectedPlaylist) return

    songs.forEach((song) => {
      addSongToPlaylist(selectedPlaylist.name, song)
    })
  }

  const handlePlaySong = (song: Song) => {
    if (!selectedPlaylist) return

    playSong(selectedPlaylist, song)
  }

  const handleRemoveSong = (songId: string) => {
    if (!selectedPlaylist) return

    removeSongFromPlaylist(selectedPlaylist.name, songId)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">XT125</h1>

      <MusicPlayer
        playlists={playlists}
        selectedPlaylistName={selectedPlaylist?.name ?? "Favoritos"}
        onSelectPlaylist={setSelectedPlaylistName}
        currentSong={currentSong}
        onAddToFavorites={addToFavorites}
      />

      <section className="grid gap-4 rounded-xl border p-4 md:grid-cols-2">
        <SongForm onSongsLoaded={handleSongsLoaded} />
        <SongList
          songs={selectedPlaylist?.getSongs() ?? []}
          currentSong={currentSong}
          onPlay={handlePlaySong}
          onRemove={handleRemoveSong}
        />
      </section>

      <section className="grid gap-4 rounded-xl border p-4 md:grid-cols-2">
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
