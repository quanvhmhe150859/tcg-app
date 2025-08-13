import { useOrientation } from "../context/OrientationContext";
import { useTranslation } from "react-i18next";

export default function ControlButtons() {
  const { t } = useTranslation();

  const { orientation, setOrientation } = useOrientation();

  return (
    <div className="section">
  <h3 className="text-center">{t("position")} {t("floatingActionButtons")}</h3>
  <div className="flex justify-center gap-4 mt-2 w-full">
    {/* Nút dọc */}
    <button
      onClick={() => setOrientation("vertical")}
      className={`p-2 border rounded-lg flex-1 max-w-[150px] ${
        orientation === "vertical" ? "selected-tab shadow-lg shadow-purple-400" : ""
      }`}
    >
      <img
        src="/icons/vertical.png"
        alt="Dọc"
        className="w-8 h-8 object-contain mx-auto"
      />
    </button>

    {/* Nút ngang */}
    <button
      onClick={() => setOrientation("horizontal")}
      className={`p-2 border rounded-lg flex-1 max-w-[150px] ${
        orientation === "horizontal" ? "selected-tab shadow-lg shadow-purple-400" : ""
      }`}
    >
      <img
        src="/icons/horizontal.png"
        alt="Ngang"
        className="w-8 h-8 object-contain mx-auto"
      />
    </button>
  </div>
</div>

  );
}
