import { useEffect, useState } from "react";
import { useBgm } from "../context/BgmContext";
import { Tooltip } from "react-tooltip";
import { useTranslation } from "react-i18next";

const getLabel = (mode) => {
  switch (mode) {
    case "loop_one":
      return "🔂";
    case "loop_all":
      return "🔁";
    case "random":
      return "🔀";
    default:
      return "";
  }
};

export default function BgmPlayer() {
  const { t } = useTranslation();

  const {
    audioRef,
    volume,
    setVolume,
    tracks,
    index,
    setIndex,
    mode,
    setMode,
    PLAY_MODES,
    persistAudio,
    setPersistAudio,
  } = useBgm();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Update time and duration
  useEffect(() => {
    const audio = audioRef.current;
    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    return () => audio.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  const handleChangeMode = () => {
    setMode((prev) => {
      if (prev === PLAY_MODES.LOOP_ONE) return PLAY_MODES.LOOP_ALL;
      if (prev === PLAY_MODES.LOOP_ALL) return PLAY_MODES.RANDOM;
      return PLAY_MODES.LOOP_ONE;
    });
  };

  const handleTrackSelect = (i) => {
    console.log(`Selecting track index: ${i}, track: ${tracks[i]}`);
    setIndex(i);
  };

  const handleTogglePersistAudio = () => {
    setPersistAudio((prev) => !prev);
  };

  const formatTime = (sec) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <>
      <h3 className="font-bold mb-2">{t("backgroundMusic")}</h3>

      <label className="block mb-2 text-sm font-medium">
        🎵 {t("selectSongs")}:
      </label>
      <div className="border rounded max-h-64 overflow-y-auto mb-4">
        <ul className="divide-y divide-gray-200 text-sm">
          {tracks.map((track, i) => (
            <li
              key={track}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 hover:text-black transition ${
                i === index ? "bg-blue-100 font-semibold text-black" : ""
              }`}
              onClick={() => handleTrackSelect(i)}
            >
              {i + 1}. {track}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleChangeMode}
        className="text-xl px-3 py-1 mb-4 mt-4 rounded transition"
        data-tooltip-id="play-mode-tooltip"
        data-tooltip-content={`${t(getLabel(mode))}`}
      >
        {t("playMode")}: {getLabel(mode)}
      </button>

      <Tooltip id="play-mode-tooltip" place="bottom" effect="solid" />
      <Tooltip id="persist-audio-tooltip" place="bottom" effect="solid" />

      <div className="text-sm mb-4">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      <label className="block mb-1 text-sm font-medium">{t("volume")}:</label>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => setVolume(parseFloat(e.target.value))}
        className="w-1/2 mb-4"
      />

      <div>
        <button
          onClick={handleTogglePersistAudio}
          className={`text-xl px-3 py-1 rounded transition`}
          data-tooltip-id="persist-audio-tooltip"
          data-tooltip-content={t(
            persistAudio ? "persistAudioOn" : "persistAudioOff"
          )}
        >
          {t("persistAudio")}: {persistAudio ? "🔓" : "🔒"}
        </button>
      </div>
    </>
  );
}
