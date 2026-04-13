import './App.css'
import MusicPlayer from './components/MusicPlayer'
import PlayerControls from './components/PlayerControls'
import SongForm from './components/SongForm'
import SongList from './components/SongList'

function App() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-semibold">XT125</h1>

      <section className="grid gap-4 rounded-xl border p-4 md:grid-cols-2">
        <SongForm />
        <SongList />
      </section>

      <section className="grid gap-4 rounded-xl border p-4 md:grid-cols-2">
        <MusicPlayer />
        <PlayerControls />
      </section>
    </main>
  )
}

export default App
