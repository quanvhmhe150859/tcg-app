import React, { useEffect, useState } from "react";
import CardItem from "./CardItemPokemon";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../common/RandomCards.module.css";
import { allTypesPokemon, allRaritiesPokemon } from "../../utils/constants";
import Button from "../common/Button";
import RollButtonGroup from "../common/RollButtonGroup";
import Select from "react-select";
import customSelectStyles from "../../utils/customSelectStyles";
import { getPokemonCards } from "../../utils/pokemonApiHelpers";

const RandomCards = () => {
  const [cards, setCards] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [rollMode, setRollMode] = useState("all");
  const [selectedType, setSelectedType] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("");
  const [noResultWarning, setNoResultWarning] = useState(false);

  const allowedTypes = JSON.parse(localStorage.getItem("allowedTypesPokemon")) || [];
  const allowedRarities =
    JSON.parse(localStorage.getItem("allowedRaritiesPokemon")) || [];

  const hasValidType = allowedTypes.length > 0;
  const hasValidRarity = allowedRarities.length > 0;

  const filteredTypes = allTypesPokemon.filter((type) => allowedTypes.includes(type));
  const filteredRarities = allRaritiesPokemon.filter((rarity) =>
    allowedRarities.includes(rarity)
  );

  const handleRoll = async (count = 1) => {
  setIsRolling(true);
  setNoResultWarning(false);

  try {
    const result = await getPokemonCards({
      mode: rollMode,
      count,
      type: selectedType,
      rarity: selectedRarity,
    });

    if (!result || result.length === 0) {
      setNoResultWarning(true);
    }

    await new Promise((res) => setTimeout(res, 500));
    setCards(result);
  } catch (err) {
    setNoResultWarning(true);
  } finally {
    setIsRolling(false);
  }
};

  const modes = [
    {
      id: "all",
      label: "🌐 Tất cả",
      tooltip: "Roll ngẫu nhiên từ toàn bộ thẻ trong bộ sưu tập",
    },
    {
      id: "energy",
      label: "⚡ Energy",
      tooltip: "Chỉ roll các thẻ năng lượng (Energy cards)",
    },
    {
      id: "trainer",
      label: "📘 Trainer",
      tooltip: "Chỉ roll các thẻ huấn luyện (Trainer cards)",
    },
    ...(hasValidType || hasValidRarity
      ? [
          {
            id: "combo",
            label: "🔥 Type + Rarity",
            tooltip: "Chọn loại Pokémon và độ hiếm để roll chính xác hơn",
          },
        ]
      : []),
  ];

  const optionsType = [{ label: "All type", value: "" }].concat(
    filteredTypes.map((t) => ({
      label: t,
      value: t,
    }))
  );

  const optionsRarity = [{ label: "All rarity", value: "" }].concat(
    filteredRarities.map((r) => ({
      label: r,
      value: r,
    }))
  );

  return (
    <div className={styles.container}>
      <div className={styles.rollContainer}>
        <h1 className="text-4xl font-bold mt-4 mb-8">
          <span className="hidden md:inline">🎴 </span>
          Pokémon Card Roll
        </h1>
        {/* Tabs */}
        <div className={`${styles.tabs} flex flex-col md:flex-row gap-2 z-[999]`}>
          {modes.map((mode) => (
            <Button
              key={mode.id}
              id={mode.id}
              label={mode.label}
              tooltip={mode.tooltip}
              selected={rollMode === mode.id}
              onClick={() => setRollMode(mode.id)}
            />
          ))}
        </div>

        {/* Combo Mode Controls */}
        {rollMode === "combo" && (hasValidType || hasValidRarity) && (
          <div className={styles.comboControls}>
            {hasValidType && (
              <Select
                className="w-full"
                value={optionsType.find((opt) => opt.value === selectedType)}
                onChange={(selected) => setSelectedType(selected.value)}
                options={optionsType}
                isDisabled={isRolling}
                isSearchable={false}
                styles={customSelectStyles}
              />
            )}

            {hasValidRarity && (
              <Select
                className="w-full"
                value={optionsRarity.find((opt) => opt.value === selectedRarity)}
                onChange={(selected) => setSelectedRarity(selected.value)}
                options={optionsRarity}
                isDisabled={isRolling}
                isSearchable={false}
                styles={customSelectStyles}
              />
            )}
          </div>
        )}

        {/* Roll Buttons */}
        <RollButtonGroup handleRoll={handleRoll} isRolling={isRolling} />
      </div>

      {isRolling && (
        <div className={styles.spinnerContainer}>
          <span className="spinner" />
          <span>⏳ Đang roll card, vui lòng chờ...</span>
        </div>
      )}

      {!isRolling && noResultWarning && (
        <p className="m-4">
          ⚠️ Không có thẻ nào phù hợp với lựa chọn hiện tại.
        </p>
      )}

      <div className={styles.cardList}>
        <AnimatePresence>
          {cards.filter(Boolean).map((card, index) => (
            <motion.div
              key={`${card.id}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CardItem card={card} index={index} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RandomCards;
