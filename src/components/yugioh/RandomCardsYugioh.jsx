import React, { useState, useEffect } from "react";
import CardItemYugioh from "./CardItemYugioh";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../styles/RandomCards.module.css";
import RollButtonGroup from "../common/RollButtonGroup";
import { Tooltip } from "react-tooltip";
import {
  getAllCardSets,
  getCardsRandom,
  getCardsByRarities,
  rollWithWeight,
  getRaritiesInPack,
} from "./yugiohApiHelpers";
import SelectBox from "../common/SelectBox";
import { addCardsToLocalStorage } from "../../utils/storageUtils";
import { spendTicketsIfNeeded, refundTickets } from "../../utils/ticketUtils";
import { useTickets } from "../../context/TicketContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

const RandomCardsYugioh = () => {
  const { t } = useTranslation();

  const DEFAULT_OPTIONS = [
    { value: "", label: "🌐 " + t("all") + " Pack" },
    { value: "__random_pack__", label: "🔀 " + t("random") + " Pack" },
  ];

  const defaultSet = DEFAULT_OPTIONS[0];
  const [allSets, setAllSets] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedSet, setSelectedSet] = useState(defaultSet);
  const [cards, setCards] = useState([]);
  const [flippedStates, setFlippedStates] = useState([]); // State cho trạng thái lật của mỗi lá bài
  const [isRolling, setIsRolling] = useState(false);
  const [noResultWarning, setNoResultWarning] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [totalPrice, setTotalPrice] = useState(0); // Khởi tạo totalPrice = 0
  const [typeOptions, setTypeOptions] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [raw] = useState(localStorage.getItem("allowedRaritiesYugiohWeights"));
  const navigate = useNavigate();

  // Hàm xử lý khi lật lá bài (gộp cả lật và cộng tiền)
  const handleCardFlip = (price, index) => {
    // Kiểm tra nếu lá bài đã lật thì không làm gì
    if (flippedStates[index]) {
      return;
    }

    // Cập nhật trạng thái lật
    setFlippedStates((prev) => {
      const newStates = [...prev];
      newStates[index] = true;
      return newStates;
    });

    // Cập nhật totalPrice
    setTotalPrice((prev) => {
      const newTotal = (parseFloat(prev) + (price || 0)).toFixed(2);
      return newTotal;
    });
  };

  // Hàm lật tất cả lá bài (giữ nguyên)
  const handleFlipAll = () => {
    const newFlippedStates = cards.map(() => true);
    setFlippedStates(newFlippedStates);
    const total = cards
      .reduce((sum, card) => sum + (card.price || 0), 0)
      .toFixed(2);
    setTotalPrice(total);
  };

  useEffect(() => {
    let parsedRaw;
    try {
      parsedRaw = raw ? JSON.parse(raw) : null;
    } catch (e) {
      parsedRaw = null;
    }

    if (
      !parsedRaw ||
      parsedRaw === "null" ||
      (typeof parsedRaw === "string" && parsedRaw.trim() === "") ||
      (typeof parsedRaw === "object" &&
        parsedRaw !== null &&
        Object.keys(parsedRaw).length === 0)
    ) {
      toast.error("Chưa thiết lập Allowed Rarities Yugioh Weights!");
      navigate("/", { state: { defaultTab: "yugioh" } });
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedSet?.value !== "") {
      setSelectedType("");
    }
  }, [selectedSet]);

  useEffect(() => {
    const fetchCardSets = async () => {
      try {
        const options = await getAllCardSets();
        setAllSets(options);
        setFilteredOptions([...DEFAULT_OPTIONS]);
        setSelectedSet(defaultSet);
      } catch (err) {
        console.error("Lỗi khi tải danh sách set:", err);
      }
    };
    fetchCardSets();
  }, [t]);

  useEffect(() => {
    const raw = localStorage.getItem("allowedTypesYugioh");
    if (raw) {
      try {
        const types = JSON.parse(raw);
        const options = [
          { value: "", label: t("all") + " Types" },
          ...types.map((t) => ({ value: t, label: t })),
        ];
        setTypeOptions(options);
      } catch (err) {
        console.error("Không thể parse typesYugioh:", err);
      }
    }
  }, [t]);

  const handleInputChange = (value) => {
    setInputValue(value);
    if (value.length >= 3) {
      const filtered = allSets.filter((opt) =>
        opt.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions([...DEFAULT_OPTIONS, ...filtered]);
    } else {
      setFilteredOptions([...DEFAULT_OPTIONS]);
    }
  };

  const spinMode = localStorage.getItem("spinMode");
  const { tickets, updateTickets } = useTickets();

  const calcTicketCost = (baseCount = 1) => {
    let extraMultiplier = 0;
    if (selectedSet?.value && selectedSet.value === "__random_pack__") {
      extraMultiplier += 30;
    } else if (selectedSet?.value && selectedSet.value !== "") {
      extraMultiplier += 50;
    }
    if (selectedType && selectedType !== "") {
      extraMultiplier += 10;
    }
    return baseCount * (extraMultiplier > 0 ? extraMultiplier : 1);
  };

  const handleRoll = async (baseCount = 1) => {
    setTotalPrice(0); // Reset totalPrice về 0 khi roll mới
    setFlippedStates(Array(baseCount).fill(false)); // Reset trạng thái lật
    const ticketCost = calcTicketCost(baseCount);

    if (
      !spendTicketsIfNeeded(ticketCost, spinMode, tickets, updateTickets, t)
    ) {
      return;
    }

    const updatedTickets = tickets - ticketCost;
    setIsRolling(true);
    setNoResultWarning(false);

    let actualSet = selectedSet?.value;

    try {
      if (actualSet === "__random_pack__") {
        const filtered = allSets.filter(
          (s) => s.value !== "__random_pack__" && s.value !== ""
        );
        const random = filtered[Math.floor(Math.random() * filtered.length)];
        actualSet = random.value;
        console.log("Pack ngẫu nhiên chọn:", actualSet);
      }

      let result = [];
      const fullWeights = JSON.parse(raw);
      let filteredWeights = fullWeights;

      if (actualSet || selectedType) {
        const raritiesInPack = await getRaritiesInPack(
          actualSet || null,
          selectedType || null
        );
        filteredWeights = Object.fromEntries(
          Object.entries(fullWeights).filter(([rarity]) =>
            raritiesInPack.includes(rarity)
          )
        );
        if (Object.keys(filteredWeights).length === 0) {
          throw new Error("Không tìm thấy rarity phù hợp với bộ lọc");
        }
      }

      const rolledRarities = Array.from({ length: baseCount }, () =>
        rollWithWeight(filteredWeights)
      );
      result = await getCardsByRarities(
        rolledRarities,
        selectedType || null,
        actualSet || null
      );

      await new Promise((res) => setTimeout(res, 500));

      if (!result || result.length === 0) {
        setNoResultWarning(true);
        refundTickets(ticketCost, spinMode, updatedTickets, updateTickets);
      } else {
        setCards(result);
        setFlippedStates(Array(result.length).fill(false)); // Khởi tạo trạng thái úp cho tất cả lá bài
      }

      addCardsToLocalStorage(result, "yugioh", spinMode, noResultWarning);
    } catch (err) {
      setNoResultWarning(true);
      toast.success(t("showingDemoCardInstead"));
      toast.error(t("noMatchingCardFoundOrAnErrorOccurred"));
      // Nếu API trả về rỗng, lấy dữ liệu từ file demoPokemon.json
      const response = await fetch("/demo/demoYugioh.json");
      const demoData = await response.json();
      let result = demoData.slice(0, baseCount);
      refundTickets(ticketCost, spinMode, updatedTickets, updateTickets);
      setCards(result);
      setFlippedStates(Array(result.length).fill(false));
    } finally {
      setIsRolling(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.rollContainer}>
        <h1 className="text-4xl font-bold mt-4 mb-8">
          <span className="hidden sm:inline">🃏 </span>
          Yu-Gi-Oh!
          <span className="hidden sm:inline"> Gacha</span>
        </h1>

        <div
          className={styles.comboControls}
          data-tooltip-id="select-pack-tooltip"
          data-tooltip-content={`🔍 ${t("enter3CharatersToSearch")} pack...`}
        >
          <SelectBox
            options={filteredOptions}
            value={selectedSet?.value}
            onChange={(v) =>
              setSelectedSet(
                filteredOptions.find((opt) => opt.value === v) || defaultSet
              )
            }
            isDisabled={isRolling}
            isSearchable
            onInputChange={handleInputChange}
            noOptionsMessage={() =>
              inputValue.length < 3
                ? t("enter3CharatersToSearch") + " pack"
                : t("noPacksFound")
            }
            placeholder={defaultSet.label}
          />

          <Tooltip id="select-pack-tooltip" place="top" />

          {selectedSet?.value === "" && typeOptions.length > 1 && (
            <SelectBox
              options={typeOptions}
              value={selectedType}
              onChange={setSelectedType}
              isDisabled={isRolling}
              isSearchable
              placeholder="All Types"
            />
          )}
        </div>

        <RollButtonGroup
          handleRoll={handleRoll}
          isRolling={isRolling}
          spinMode={spinMode}
          ticketOptions={[calcTicketCost(1), calcTicketCost(10)]}
        />
        <div className="flex justify-center mt-2">
          {!isRolling &&
            cards.length > 0 &&
            !flippedStates.every((state) => state) && (
              <button
                onClick={handleFlipAll}
                disabled={flippedStates.every((state) => state)} // Vô hiệu hóa nếu tất cả đã lật
                className="toggle-button"
              >
                {t("openAllCards")}
              </button>
            )}
        </div>
      </div>

      {isRolling && (
        <div className={styles.spinnerContainer}>
          <span className="spinner" />
          <span>
            ⏳ {t("rollingCard")}, {t("pleaseWait")}...
          </span>
        </div>
      )}

      {/* {!isRolling && noResultWarning && (
        <p className={styles.warningMessage}>
          ⚠️ {t("noMatchingCardFoundOrAnErrorOccurred")}.
        </p>
      )} */}

      {!isRolling && cards.length > 0 && (
        <p className={styles.totalPrice}>
          💰 {t("totalPrice")} : ${totalPrice}
        </p>
      )}

      <div className={styles.cardList}>
        {noResultWarning && (
          <div
            className="absolute inset-0 bg-[url('/demo/sample-watermark.png')] opacity-10 bg-repeat bg-[length:100px_100px] pointer-events-none w-full h-full z-10"
            style={{ backgroundSize: "100px 100px" }}
          ></div>
        )}
        <AnimatePresence>
          {cards.filter(Boolean).map((card, index) => (
            <motion.div
              key={`${card.cardId}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CardItemYugioh
                card={card}
                index={index}
                isFlipped={flippedStates[index] || false}
                type="gacha"
                onCardFlip={() => handleCardFlip(card.price || 0, index)} // ← Chỉ cập nhật totalPrice
                isApiFailed={noResultWarning}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RandomCardsYugioh;
