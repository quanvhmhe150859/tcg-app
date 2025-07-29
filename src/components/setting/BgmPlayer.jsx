import { useEffect, useState } from "react";
import { useBgm } from "../context/BgmContext";

const PLAY_MODES = {
  LOOP_ONE: "loop_one",
  LOOP_ALL: "loop_all",
  RANDOM: "random"
};

const getLabel = (mode) => {
  switch (mode) {
    case PLAY_MODES.LOOP_ONE: return "🔂";
    case PLAY_MODES.LOOP_ALL: return "🔁";
    case PLAY_MODES.RANDOM: return "🔀";
    default: return "";
  }
};

export default function BgmPlayer() {
  const [tracks, setTracks] = useState([]);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState(() => localStorage.getItem("bgm-mode") || PLAY_MODES.LOOP_ALL);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const {
    audioRef,
    volume,
    setVolume,
    currentTrackUrl,
    setCurrentTrackUrl,
    isLoopOne,
    setIsLoopOne,
  } = useBgm();

  useEffect(() => {
    fetch("/bgm/bgm.json")
      .then((res) => res.json())
      .then(setTracks);
  }, []);

  useEffect(() => {
    localStorage.setItem("bgm-mode", mode);
    setIsLoopOne(mode === PLAY_MODES.LOOP_ONE);
  }, [mode]);

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const handler = () => {
      if (mode === PLAY_MODES.RANDOM) {
        let next;
        do {
          next = Math.floor(Math.random() * tracks.length);
        } while (next === index && tracks.length > 1);
        setIndex(next);
      } else {
        setIndex((i) => (i + 1) % tracks.length);
      }
    };
    audio.addEventListener("ended", handler);
    return () => audio.removeEventListener("ended", handler);
  }, [mode, index, tracks]);

  useEffect(() => {
    if (tracks[index]) {
      setCurrentTrackUrl(`/bgm/${tracks[index]}`);
    }
  }, [index, tracks]);

  const handleChangeMode = () => {
    setMode((prev) => {
      if (prev === PLAY_MODES.LOOP_ONE) return PLAY_MODES.LOOP_ALL;
      if (prev === PLAY_MODES.LOOP_ALL) return PLAY_MODES.RANDOM;
      return PLAY_MODES.LOOP_ONE;
    });
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  const formatTime = (sec) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="section">
      <h3 className="font-bold mb-2">Background Music</h3>

      <label className="block mb-2 text-sm font-medium">🎵 Chọn bài hát:</label>
      <div className="border rounded max-h-64 overflow-y-auto mb-4">
        <ul className="divide-y divide-gray-200 text-sm">
          {tracks.map((track, i) => (
            <li
              key={track}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 hover:text-black transition ${
                i === index ? "bg-blue-100 font-semibold text-black" : ""
              }`}
              onClick={() => setIndex(i)}
            >
              {i + 1}. {track}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleChangeMode}
        className="text-xl mb-4 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 transition"
        title="Chế độ phát"
      >
        Chế độ: {getLabel(mode)}
      </button>

      <div className="text-sm mb-4">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <label className="block mb-1 text-sm font-medium">Âm lượng:</label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}
