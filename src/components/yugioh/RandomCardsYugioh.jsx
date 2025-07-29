import React, { useState, useEffect } from "react";
import CardItemYugioh from "./CardItemYugioh";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../common/RandomCards.module.css";
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

const DEFAULT_OPTIONS = [
  { value: "", label: "🌐 All Pack" },
  { value: "__random_pack__", label: "🔀 Random Pack" },
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

  const [typeOptions, setTypeOptions] = useState([]);
  const [selectedType, setSelectedType] = useState(""); // "" = All types

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
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("allowedTypesYugioh");
    if (raw) {
      try {
        const types = JSON.parse(raw);
        const options = [
          { value: "", label: "All Types" },
          ...types.map((t) => ({ value: t, label: t })),
        ];
        setTypeOptions(options);
      } catch (err) {
        console.error("Không thể parse typesYugioh:", err);
      }
    }
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

      const raw = localStorage.getItem("rarityWeightsYugioh");
      if (!raw) throw new Error("Không có dữ liệu rarityWeightsYugioh");

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

      // Roll rarity theo weight (dù là pack hay all)
      const rolledRarities = Array.from({ length: count }, () =>
        rollWithWeight(filteredWeights)
      );

      // Gọi API roll bài
      result = await getCardsByRarities(
        rolledRarities,
        selectedType || null,
        actualSet || null
      );

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
  const placeholder = defaultSet.label;

  return (
    <div className={styles.container}>
      <div className={styles.rollContainer}>
        <h1 className="text-4xl font-bold mt-4 mb-8">
          <span className="hidden md:inline">🃏 </span>
          Yu-Gi-Oh! Card
        </h1>

        {/* Dropdown chọn pack */}
        <div
          className={styles.comboControls}
          data-tooltip-id="select-pack-tooltip"
          data-tooltip-content="🔍 Nhập từ 3 ký tự để tìm pack..."
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
                ? "Nhập ít nhất 3 ký tự để tìm pack"
                : "Không tìm thấy pack nào"
            }
            placeholder={placeholder}
          />

          <Tooltip id="select-pack-tooltip" place="top" />

          {selectedSet?.value === "" && (
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
