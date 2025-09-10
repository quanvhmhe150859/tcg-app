import { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useTranslation } from "react-i18next";

export default function CardSaveLoad() {
  const { t } = useTranslation();

  // Mode: true = free spin, false = paid spin
  const [freeMode, setFreeMode] = useState(true);
  const [cards, setCards] = useState([]);

  // Load mode & cards từ localStorage khi khởi động
  useEffect(() => {
    const storedMode = localStorage.getItem("spinMode");
    if (storedMode) setFreeMode(storedMode === "free");

    const storedCards = localStorage.getItem("cards");
    if (storedCards) setCards(JSON.parse(storedCards));
  }, []);

  // Toggle mode và lưu vào localStorage
  const toggleMode = () => {
    const newMode = !freeMode;
    setFreeMode(newMode);
    localStorage.setItem("spinMode", newMode ? "free" : "ticket");
  };

  // Save localStorage cards -> file .txt (Base64)
  const saveLocalCardsToFile = () => {
    const stored =
      localStorage.getItem("cards") ||
      JSON.stringify({ pokemon: [], yugioh: [] });
    const encoded = btoa(stored);
    const blob = new Blob([encoded], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "saved_data_tcg.txt";
    link.click();
  };

  // Load file .txt -> localStorage
  const loadCardsFromFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const decoded = atob(event.target.result);
        const loadedCards = JSON.parse(decoded);

        // đảm bảo luôn có key pokemon và yugioh
        const normalized = {
          pokemon: loadedCards.pokemon || [],
          yugioh: loadedCards.yugioh || [],
        };

        localStorage.setItem("cards", JSON.stringify(normalized));

        // Nếu muốn hiển thị cả 2 loại thì setCards(normalized)
        // Nếu chỉ hiển thị 1 game (vd Pokémon) thì setCards(normalized.pokemon)
        setCards(normalized);

        alert(t("loadSuccessfully") + "!");
      } catch (err) {
        console.error("Lỗi load file:", err);
        alert(t("invalidFileFormat") + "!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <h3 className="font-bold mb-2">{t("saveLoadCollection")}</h3>
      <div>
        <span className="font-semibold">{t("rollMode")}: </span>
        <button
          onClick={toggleMode}
          data-tooltip-id="roll-mode-tooltip"
          data-tooltip-content={freeMode ? t("cardsWillNotBeSavedToYourCollection") : t("cardsWillBeSavedToYourCollection")}
        >
          {freeMode ? t("freeSpin") : t("ticketSpin")}
        </button>
        <Tooltip id="roll-mode-tooltip" place="top" effect="solid" />
      </div>

      <div className="mt-4">
        <button className="mr-4" onClick={saveLocalCardsToFile}>
          {t("saveFile")}
        </button>

        <button onClick={() => document.getElementById("file-upload").click()}>
          {t("loadFile")}
        </button>
        <input
          id="file-upload"
          type="file"
          accept=".txt"
          onChange={loadCardsFromFile}
          className="hidden"
        />
      </div>

      {/* <div>
        <h3 className="font-semibold mb-2">Cards hiện tại:</h3>
        {cards.length === 0 ? (
          <p className="text-gray-500">Chưa có thẻ nào</p>
        ) : (
          <ul className="list-disc list-inside max-h-40 overflow-y-auto border p-2 rounded bg-white">
            {cards.map((c, idx) => (
              <li key={idx}>
                {c.cardID} x {c.quantity}
              </li>
            ))}
          </ul>
        )}
      </div> */}
    </>
  );
}
