import React, { useState, useEffect } from "react";
import CardItemYugioh from "./CardItemYugioh";
import Select from "react-select";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../common/RandomCards.module.css";
import RollButtonGroup from "../common/RollButtonGroup";
import customSelectStyles from "../../utils/customSelectStyles";
import { Tooltip } from "react-tooltip";
import {
  getAllCardSets,
  getCardsFromSet,
  getCardsByRarities,
  rollWithWeight,
} from "../../utils/yugiohApiHelpers";

const DEFAULT_OPTIONS = [
  { value: "", label: "🌐 Tất cả" },
  { value: "__random_pack__", label: "🔀 Pack ngẫu nhiên" },
];

const defaultSet = DEFAULT_OPTIONS[0];

const YugiohRoll = () => {
  const [allSets, setAllSets] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedSet, setSelectedSet] = useState(defaultSet);
  const [cards, setCards] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [noResultWarning, setNoResultWarning] = useState(false);
  const [inputValue, setInputValue] = useState("");

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
}, []);


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

  const handleRoll = async (count = 1) => {
  setIsRolling(true);
  setNoResultWarning(false);

  let actualSet = selectedSet?.value;

  // 🔀 Nếu là pack ngẫu nhiên
  if (actualSet === "__random_pack__") {
    const filtered = allSets.filter(
      (s) => s.value !== "__random_pack__" && s.value !== ""
    );
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    actualSet = random.value;
    console.log("Pack ngẫu nhiên chọn:", actualSet);
  }

  try {
    let result = [];

    if (!actualSet) {
      // 🌐 Tất cả (sử dụng roll theo weight)
      const raw = localStorage.getItem("rarityWeightsYugioh");
      if (!raw) throw new Error("Không có dữ liệu rarityWeightsYugioh");

      const weights = JSON.parse(raw);
      const rolledRarities = Array.from({ length: count }, () =>
        rollWithWeight(weights)
      );

      result = await getCardsByRarities(rolledRarities);
    } else {
      // 📦 Deck cụ thể
      result = await getCardsFromSet(count, actualSet);
    }

    if (!result || result.length === 0) {
      setNoResultWarning(true);
      setCards([]);
    } else {
      setCards(result);
    }

    await new Promise((res) => setTimeout(res, 500));
  } catch (err) {
    console.error("Lỗi khi roll:", err);
    setNoResultWarning(true);
    setCards([]);
  } finally {
    setIsRolling(false);
  }
};


  const totalPrice = cards
    .reduce((sum, card) => sum + (card?.price ?? 0), 0)
    .toFixed(2);

  return (
    <div className={styles.container}>
      <div className={styles.rollContainer}>
        <h1 className="text-4xl font-bold mt-4 mb-8">
          <span className="hidden md:inline">🃏 </span>
          Yu-Gi-Oh! Card Roll
        </h1>

        {/* Dropdown chọn pack */}
        <div
          className={styles.comboControls}
          data-tooltip-id="select-pack-tooltip"
          data-tooltip-content="🔍 Nhập từ 3 ký tự để tìm pack..."
        >
          <Select
            className="w-full"
            options={filteredOptions}
            value={selectedSet}
            onChange={(option) => setSelectedSet(option || defaultSet)}
            onInputChange={handleInputChange}
            placeholder="🔍 Nhập từ 3 ký tự để tìm pack..."
            isSearchable
            isDisabled={isRolling}
            styles={customSelectStyles}
            noOptionsMessage={() =>
              inputValue.length < 3
                ? "Nhập ít nhất 3 ký tự để tìm pack"
                : "Không tìm thấy pack nào"
            }
          />
          <Tooltip id="select-pack-tooltip" place="top" />
        </div>

        <RollButtonGroup handleRoll={handleRoll} isRolling={isRolling} />
      </div>

      {isRolling && (
        <div className={styles.spinnerContainer}>
          <span className="spinner" />
          <span>⏳ Đang roll card, vui lòng chờ...</span>
        </div>
      )}

      {!isRolling && noResultWarning && (
        <p className={styles.warningMessage}>
          ⚠️ Không có thẻ nào phù hợp với lựa chọn hiện tại.
        </p>
      )}

      {!isRolling && cards.length > 0 && (
        <p className={styles.totalPrice}>💰 Tổng giá trị : ${totalPrice}</p>
      )}

      <div className={styles.cardList}>
        <AnimatePresence>
          {cards.filter(Boolean).map((card, index) => (
            <motion.div
              key={`${card.cardId}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CardItemYugioh card={card} index={index} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default YugiohRoll;
