import { useState, useEffect } from "react";
import { Tooltip } from "react-tooltip";
import { useTranslation } from "react-i18next";
import { getTickets, setTickets } from "../../utils/ticketStorage";
import { useTickets } from "../context/TicketContext";

export default function CardSaveLoad() {
  const { t } = useTranslation();

  const { updateTickets } = useTickets();

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

  // Save localStorage cards + tickets -> file .txt (Base64)
  const saveLocalCardsToFile = () => {
    const storedCards =
      localStorage.getItem("cards") ||
      JSON.stringify({ pokemon: [], yugioh: [] });
    const tickets = getTickets();

    const payload = {
      cards: JSON.parse(storedCards),
      tickets,
    };

    const encoded = btoa(JSON.stringify(payload));
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
        const loadedData = JSON.parse(decoded);

        // đảm bảo luôn có cards và tickets
        const normalizedCards = {
          pokemon: loadedData.cards?.pokemon || [],
          yugioh: loadedData.cards?.yugioh || [],
        };
        const normalizedTickets = Number(loadedData.tickets) || 0;

        localStorage.setItem("cards", JSON.stringify(normalizedCards));
        updateTickets(normalizedTickets);

        setCards(normalizedCards);

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

      <div className="flex w-full w-fit sm:mx-auto gap-2 sm:justify-center mt-4 lg:w-1/2">
        <button className="min-w-0 flex-1 flex flex-col items-center" onClick={saveLocalCardsToFile}>
          ⬇️ {t("saveFile")}
        </button>

        <button className="min-w-0 flex-1 flex flex-col items-center" onClick={() => document.getElementById("file-upload").click()}>
          ⬆️ {t("loadFile")}
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
