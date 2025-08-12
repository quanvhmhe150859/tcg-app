import { useBgm } from "../context/BgmContext";

export default function MusicToggleButton() {
  const { enabled, setEnabled } = useBgm();

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className="floating-button"
      style={{ top: "135px" }}
      title={enabled ? "Switch to Mute" : "Switch to Unmute"}
    >
      {enabled ? "🔊" : "🔇"}
    </button>
  );
}
