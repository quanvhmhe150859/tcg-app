import React, { useEffect, useState } from "react";
import api from '../utils/api';
import CardItem from "./CardItem";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./RandomCards.module.css";
import { allTypes, allRarities } from "../utils/constants";

const RandomCards = () => {
  const [cards, setCards] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [rollMode, setRollMode] = useState("all");
  const [selectedType, setSelectedType] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("");
  const [noResultWarning, setNoResultWarning] = useState(false);

  const allowedTypes = JSON.parse(localStorage.getItem("allowedTypes")) || [];
  const allowedRarities = JSON.parse(localStorage.getItem("allowedRarities")) || [];

  const hasValidType = allowedTypes.length > 0;
  const hasValidRarity = allowedRarities.length > 0;

  const filteredTypes = allTypes.filter((type) => allowedTypes.includes(type));
  const filteredRarities = allRarities.filter((rarity) => allowedRarities.includes(rarity));

  const rollCards = async (count = 1) => {
    const rolled = [];
    for (let i = 0; i < count; i++) {
      const randomPage = Math.floor(Math.random() * 80) + 1;
      const response = await api.get(
        `https://api.pokemontcg.io/v2/cards?page=${randomPage}&pageSize=250`
      );
      const cardsList = response.data.data || [];
      if (cardsList.length === 0) continue;
      const randomCard = cardsList[Math.floor(Math.random() * cardsList.length)];
      if (randomCard) rolled.push(randomCard);
    }
    return rolled;
  };

  const rollByCombo = async (count = 1) => {
    const q = [];
    if (selectedType) q.push(`types:\"${selectedType}\"`);
    if (selectedRarity) q.push(`rarity:\"${selectedRarity}\"`);
    const query = q.join(" ");

    const result = [];
    const pageSize = 250;

    // Step 1: get total count
    const res1 = await api.get(
      `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&page=1&pageSize=1`
    );
    const total = res1.data.totalCount || 0;
    if (total === 0) {
      setNoResultWarning(true);
      return [];
    }
    setNoResultWarning(false);

    const totalPages = Math.ceil(total / pageSize);

    for (let i = 0; i < count; i++) {
      const randomPage = Math.floor(Math.random() * totalPages) + 1;
      const res2 = await api.get(
        `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&page=${randomPage}&pageSize=${pageSize}`
      );
      const data = res2.data.data || [];
      if (data.length === 0) continue;
      const random = data[Math.floor(Math.random() * data.length)];
      if (random) result.push(random);
    }
    return result;
  };

  const handleRoll = async (count = 1) => {
    setIsRolling(true);
    let result = [];
    if (rollMode === "combo") {
      result = await rollByCombo(count);
    } else {
      setNoResultWarning(false);
      result = await rollCards(count);
    }
    await new Promise((res) => setTimeout(res, 500));
    setCards(result);
    setIsRolling(false);
  };

  const totalPrice = cards.reduce((sum, card) => {
    const price =
      card?.tcgplayer?.prices?.normal?.market ??
      card?.tcgplayer?.prices?.holofoil?.market ??
      0;
    return sum + price;
  }, 0).toFixed(2);

  const modes = [
    {
      id: "all",
      label: "🌐 Tất cả",
      tooltip: "Roll ngẫu nhiên từ toàn bộ thẻ trong bộ sưu tập",
    },
    ...(hasValidType || hasValidRarity
      ? [
          {
            id: "combo",
            label: "🔥 Theo Type + Rarity",
            tooltip: "Chọn loại Pokémon và độ hiếm để roll chính xác hơn",
          },
        ]
      : []),
  ];

  return (
    <div className={styles.randomCardsContainer}>
      <h2>🎴 Pokémon Card Roll</h2>
      
      {/* Tabs */}
      <div className={styles.tabs}>
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setRollMode(mode.id)}
            title={mode.tooltip}
            className={`roll-tab ${rollMode === mode.id ? "selected-tab" : ""}`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Combo Mode Controls */}
      {rollMode === "combo" && (hasValidType || hasValidRarity) && (
        <div className={styles.comboControls}>
          {hasValidType && (
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={isRolling}
            >
              <option value="">-- Chọn type --</option>
              {filteredTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}

          {hasValidRarity && (
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value)}
              disabled={isRolling}
            >
              <option value="">-- Chọn rarity --</option>
              {filteredRarities.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Roll Buttons */}
      <div className={styles.rollButtons}>
        <button onClick={() => handleRoll(1)} disabled={isRolling}>
          🎲 Roll 1
        </button>
        <button onClick={() => handleRoll(10)} disabled={isRolling}>
          🎲 Roll 10
        </button>
      </div>

      {isRolling && (
        <div className={styles.spinnerContainer}>
          <span className="spinner" />
          <span>⏳ Đang roll card, vui lòng chờ...</span>
        </div>
      )}

      {!isRolling && noResultWarning && (
        <p className={styles.warningMessage}>⚠️ Không có thẻ nào phù hợp với lựa chọn hiện tại.</p>
      )}

      {!isRolling && cards.length > 0 && (
        <p className={styles.totalPrice}>
          💰 Tổng giá trị (market): ${totalPrice}
        </p>
      )}

      <div className={styles.cardList}>
        <AnimatePresence>
          {cards.filter(Boolean).map((card, index) => (
            <motion.div
              key={card?.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CardItem card={card} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RandomCards;
