import { useBgm } from "../context/BgmContext";
import { useTranslation } from "react-i18next";

export default function MusicToggleButton() {
  const { t } = useTranslation();

  const { enabled, setEnabled } = useBgm();

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className="floating-button"
      title={enabled ? t("switchToMute") : t("switchToUnmute")}
    >
      {enabled ? "🔊" : "🔇"}
    </button>
  );
}
