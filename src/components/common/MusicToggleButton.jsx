import { useBgm } from "../context/BgmContext";

export default function MusicToggleButton() {
  const { enabled, setEnabled } = useBgm();

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className="floating-button"
      title={enabled ? "Switch to Mute" : "Switch to Unmute"}
    >
      {enabled ? "🔊" : "🔇"}
    </button>
  );
}
