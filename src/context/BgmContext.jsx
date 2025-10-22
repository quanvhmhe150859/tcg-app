import { createContext, useContext, useRef, useState, useEffect } from "react";
import { getOrFetchAndSet } from "../utils/cache";
import api from "../utils/api";

const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BgmContext = createContext(null);

const PLAY_MODES = {
  LOOP_ONE: "loop_one",
  LOOP_ALL: "loop_all",
  RANDOM: "random",
};

export const BgmProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem("bgm-enabled") === "true"
  );
  const [volume, setVolume] = useState(
    () => parseFloat(localStorage.getItem("bgm-volume")) || 0.8
  );
  const [currentTrackUrl, setCurrentTrackUrl] = useState(
    () => localStorage.getItem("bgm-current-url") || null
  );
  const [isLoopOne, setIsLoopOne] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState(
    () => localStorage.getItem("bgm-mode") || PLAY_MODES.LOOP_ALL
  );
  const [persistAudio, setPersistAudio] = useState(
    () => localStorage.getItem("bgm-persist-audio") === "true"
  );

  // Load tracks from /api/music and strip /bgm/ prefix
  useEffect(() => {
    getOrFetchAndSet(
      "bgm_tracks",
      () =>
        api.get("/api/music").then((res) =>
          res.data.map((url) => url.replace(/^\/bgm\//, ""))
        ),
      setTracks
    );
  }, []);

  // Restore saved track or select first track
  useEffect(() => {
    if (tracks.length === 0) return;

    const savedUrl = localStorage.getItem("bgm-current-url");
    if (savedUrl) {
      const name = savedUrl.replace(new RegExp(`^${BACKEND_BASE_URL}/bgm/`), "");
      const foundIndex = tracks.indexOf(name);
      if (foundIndex !== -1) {
        setIndex(foundIndex);
        setCurrentTrackUrl(savedUrl);
        return;
      }
    }

    setIndex(0);
    if (tracks[0]) {
      const newUrl = `${BACKEND_BASE_URL}/bgm/${tracks[0]}`;
      setCurrentTrackUrl(newUrl);
    }
  }, [tracks]);

  // Update currentTrackUrl when index changes
  useEffect(() => {
    if (!tracks[index] || tracks.length === 0) return;
    const newUrl = `${BACKEND_BASE_URL}/bgm/${tracks[index]}`;
    if (newUrl !== currentTrackUrl) {
      setCurrentTrackUrl(newUrl);
    }
  }, [index, tracks]);

  // Update mode and persist to localStorage
  useEffect(() => {
    localStorage.setItem("bgm-mode", mode);
    setIsLoopOne(mode === PLAY_MODES.LOOP_ONE);
  }, [mode]);

  // Persist persistAudio to localStorage
  useEffect(() => {
    localStorage.setItem("bgm-persist-audio", persistAudio.toString());
  }, [persistAudio]);

  // Handle track advancement
  useEffect(() => {
    if (tracks.length === 0) return;
    const audio = audioRef.current;
    const handler = () => {
      if (mode === PLAY_MODES.RANDOM) {
        let next;
        do {
          next = Math.floor(Math.random() * tracks.length);
        } while (next === index && tracks.length > 1);
        setIndex(next);
      } else if (mode === PLAY_MODES.LOOP_ALL) {
        const next = (index + 1) % tracks.length;
        setIndex(next);
      }
    };
    audio.addEventListener("ended", handler);
    return () => audio.removeEventListener("ended", handler);
  }, [mode, index, tracks]);

  // Update audio src when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (currentTrackUrl) {
      audio.src = currentTrackUrl;
      if (enabled && volume > 0) {
        audio.play().catch((err) => {
          console.error("Audio playback failed:", err);
        });
      }
    }
  }, [currentTrackUrl]);

  // Persist current track URL
  useEffect(() => {
    if (currentTrackUrl) {
      localStorage.setItem("bgm-current-url", currentTrackUrl);
    }
  }, [currentTrackUrl]);

  // Update loop mode
  useEffect(() => {
    audioRef.current.loop = isLoopOne;
  }, [isLoopOne]);

  // Update volume and handle pause/resume during volume adjustment
  useEffect(() => {
    localStorage.setItem("bgm-volume", volume.toString());
    const audio = audioRef.current;

    if (volume <= 0.001) {
      audio.pause();
    } else {
      audio.volume = volume;
      if (enabled && audio.paused && currentTrackUrl) {
        audio.play().catch((err) => {
          console.error("Audio playback failed:", err);
        });
      }
    }
  }, [volume, enabled, currentTrackUrl]);

  // Fade in/out when enabling/disabling
  useEffect(() => {
    const audio = audioRef.current;
    let fadeInterval;

    const fadeTo = (target) => {
      clearInterval(fadeInterval);
      fadeInterval = setInterval(() => {
        const diff = target - audio.volume;
        if (Math.abs(diff) < 0.01) {
          audio.volume = target;
          clearInterval(fadeInterval);
          if (target === 0) audio.pause();
        } else {
          audio.volume += diff * 0.2;
        }
      }, 100);
    };

    if (enabled) {
      if (currentTrackUrl && volume > 0) {
        if (audio.paused && audio.currentTime > 0) {
          fadeTo(volume);
          audio.play().catch((err) => {
            console.error("Audio playback failed:", err);
          });
        } else {
          audio.volume = 0;
          audio.play().catch((err) => {
            console.error("Audio playback failed:", err);
          });
          fadeTo(volume);
        }
      }
    } else {
      fadeTo(0);
    }

    localStorage.setItem("bgm-enabled", enabled.toString());
    return () => clearInterval(fadeInterval);
  }, [enabled, currentTrackUrl]);

  // Pause when tab is hidden, unless persistAudio is true
  useEffect(() => {
    const audio = audioRef.current;
    const handleVisibility = () => {
      if (persistAudio) return; // Skip if persistAudio is true
      if (document.hidden) {
        audio.pause();
      } else if (enabled && volume > 0 && currentTrackUrl) {
        audio.play().catch((err) => {
          console.error("Audio playback failed:", err);
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, volume, currentTrackUrl, persistAudio]);

  // Try autoplay on first load
  useEffect(() => {
    const audio = audioRef.current;
    const tryAutoplay = () => {
      if (!audio || !enabled || !currentTrackUrl || volume === 0) return;
      if (!audio.paused || audio.currentTime > 0) return;

      const resumeAudio = () => {
        audio.play().catch((err) => {
          console.error("Audio playback failed:", err);
        });
        window.removeEventListener("click", resumeAudio);
      };

      window.addEventListener("click", resumeAudio);
    };

    tryAutoplay();
  }, [enabled, currentTrackUrl, volume]);

  return (
    <BgmContext.Provider
      value={{
        audioRef,
        enabled,
        setEnabled,
        volume,
        setVolume,
        currentTrackUrl,
        setCurrentTrackUrl,
        isLoopOne,
        setIsLoopOne,
        tracks,
        setTracks,
        index,
        setIndex,
        mode,
        setMode,
        PLAY_MODES,
        persistAudio,
        setPersistAudio,
      }}
    >
      {children}
    </BgmContext.Provider>
  );
};

export const useBgm = () => useContext(BgmContext);