import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect
} from "react";

const BgmContext = createContext(null);

export const BgmProvider = ({ children }) => {
  const audioRef = useRef(new Audio());

  const [enabled, setEnabled] = useState(() => localStorage.getItem("bgm-enabled") === "true");
  const [volume, setVolume] = useState(() => parseFloat(localStorage.getItem("bgm-volume")) || 0.8);
  const [currentTrackUrl, setCurrentTrackUrl] = useState(() => localStorage.getItem("bgm-current-url") || null);
  const [isLoopOne, setIsLoopOne] = useState(false);

  // Cập nhật audio src khi có bài hát
  useEffect(() => {
    const audio = audioRef.current;
    if (currentTrackUrl) {
      audio.src = currentTrackUrl;
      if (enabled && volume > 0) {
        audio.play().catch(() => {});
      }
    }
  }, [currentTrackUrl]);

  // Ghi nhớ bài hiện tại
  useEffect(() => {
    if (currentTrackUrl) {
      localStorage.setItem("bgm-current-url", currentTrackUrl);
    }
  }, [currentTrackUrl]);

  // Cập nhật loop mode
  useEffect(() => {
    audioRef.current.loop = isLoopOne;
  }, [isLoopOne]);

  // Cập nhật volume và xử lý mute nếu = 0
  useEffect(() => {
    localStorage.setItem("bgm-volume", volume.toString());

    const audio = audioRef.current;
    if (volume <= 0.001) {
      audio.pause();
    } else {
      audio.volume = volume;
      if (enabled && audio.paused && currentTrackUrl) {
        audio.play().catch(() => {});
      }
    }
  }, [volume]);

  // Fade in/out khi bật tắt nhạc
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
      audio.volume = 0;
      if (currentTrackUrl && volume > 0) {
        audio.play().catch(() => {});
      }
      fadeTo(volume);
    } else {
      fadeTo(0);
    }

    localStorage.setItem("bgm-enabled", enabled.toString());
    return () => clearInterval(fadeInterval);
  }, [enabled]);

  // Tắt nhạc khi chuyển tab
  useEffect(() => {
    const audio = audioRef.current;

    const handleVisibility = () => {
      if (document.hidden) {
        audio.pause();
      } else if (enabled && volume > 0 && currentTrackUrl) {
        audio.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, volume, currentTrackUrl]);

  // Thử autoplay khi load lần đầu
  useEffect(() => {
    const audio = audioRef.current;

    const tryAutoplay = () => {
      if (!audio || !enabled || !currentTrackUrl || volume === 0) return;
      if (!audio.paused || audio.currentTime > 0) return;

      const resumeAudio = () => {
        audio.play().catch(() => {});
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
      }}
    >
      {children}
    </BgmContext.Provider>
  );
};

export const useBgm = () => useContext(BgmContext);
