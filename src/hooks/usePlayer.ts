import { useState } from "react";
import type { Song } from "../models/Song";

export function usePlayer() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const addSong = (song: Song) => {
    setSongs((prev) => [...prev, song]);
    if (currentIndex === -1) {
      setCurrentIndex(0);
    }
  };

  const nextSong = () => {
    setCurrentIndex((prev) => (prev + 1 < songs.length ? prev + 1 : prev));
  };

  const prevSong = () => {
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
  };

  return {
    songs,
    currentSong: currentIndex >= 0 ? songs[currentIndex] : null,
    addSong,
    nextSong,
    prevSong,
  };
}
