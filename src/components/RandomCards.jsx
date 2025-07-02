import React, { useEffect, useState } from "react";
import axios from "axios";
import CardItem from "./CardItem";
import { AnimatePresence, motion } from "framer-motion";
import "./Spinner.css";

const RandomCards = () => {
  const [cards, setCards] = useState([]);
  const [types, setTypes] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [allowedTypes, setAllowedTypes] = useState([]);
  const [allowedRarities, setAllowedRarities] = useState([]);

  const [selectedType, setSelectedType] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("");
  const [loading, setLoading] = useState(false);
  const [rollMode, setRollMode] = useState("combo"); // combo | all

  useEffect(() => {
    axios
      .get("https://api.pokemontcg.io/v2/types")
      .then((res) => setTypes(res.data.data))
      .catch(console.error);

    axios
      .get("https://api.pokemontcg.io/v2/rarities")
      .then((res) => setRarities(res.data.data))
      .catch(console.error);

    const savedTypes = JSON.parse(localStorage.getItem("allowedTypes") || "[]");
    const savedRarities = JSON.parse(
      localStorage.getItem("allowedRarities") || "[]"
    );

    setAllowedTypes(savedTypes);
    setAllowedRarities(savedRarities);
  }, []);

  const getMarketPrice = (card) => {
    const priceObj = card.tcgplayer?.prices;
    if (!priceObj) return 0;
    const firstPrice = Object.values(priceObj)[0];
    return firstPrice?.market || 0;
  };

  const rollFromQuery = async (query, count = 1) => {
    try {
      setLoading(true);
      const meta = await axios.get(
        `https://api.pokemontcg.io/v2/cards?q=${query}&pageSize=1`
      );
      const total = meta.data.totalCount;
      const totalPages = Math.ceil(total / 250);
      const results = [];

      for (let i = 0; i < count; i++) {
        const randomPage = Math.floor(Math.random() * totalPages) + 1;
        const res = await axios.get(
          `https://api.pokemontcg.io/v2/cards?q=${query}&pageSize=250&page=${randomPage}`
        );
        const pageCards = res.data.data;
        const picked = pageCards[Math.floor(Math.random() * pageCards.length)];
        results.push(picked);
      }

      setCards(results);
    } catch (err) {
      console.error("Roll lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoll = async (count = 1) => {
    if (loading) return;

    if (rollMode === "combo") {
      if (!selectedType && !selectedRarity) {
        alert("Bạn cần chọn ít nhất 1 trong Type hoặc Rarity");
        return;
      }

      const parts = [];
      if (selectedType) parts.push(`types:${selectedType}`);
      if (selectedRarity) parts.push(`rarity:"${selectedRarity}"`);
      const finalQuery = parts.join(" ");
      await rollFromQuery(finalQuery, count);
    } else if (rollMode === "all") {
      await rollFromQuery("set.id:*", count);
    }
  };

  const filteredTypes = types.filter((t) => allowedTypes.includes(t));
  const filteredRarities = rarities.filter((r) => allowedRarities.includes(r));

  const hasValidType = filteredTypes.length > 0;
  const hasValidRarity = filteredRarities.length > 0;

  useEffect(() => {
    const noValidType = filteredTypes.length === 0;
    const noValidRarity = filteredRarities.length === 0;

    if (rollMode === "combo" && noValidType && noValidRarity) {
      setRollMode("all"); // chuyển sang chế độ 'all' nếu combo không dùng được
    }
  }, [filteredTypes, filteredRarities, rollMode]);

  const totalPrice = cards
    .reduce((sum, c) => sum + getMarketPrice(c), 0)
    .toFixed(2);

  const modes = [
    ...(hasValidType || hasValidRarity
      ? [
          {
            id: "combo",
            label: "🔥 Theo Type + Rarity",
            tooltip: "Chọn loại Pokémon và độ hiếm để roll chính xác hơn",
          },
        ]
      : []),
    {
      id: "all",
      label: "🌐 Tất cả",
      tooltip: "Roll ngẫu nhiên từ toàn bộ thẻ trong bộ sưu tập",
    },
  ];

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🎴 Pokémon Card Roll</h2>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
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
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem",
            flexWrap: "wrap",
          }}
        >
          {hasValidType && (
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              disabled={loading}
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
              disabled={loading}
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
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => handleRoll(1)} disabled={loading}>
          🎲 Roll 1
        </button>
        <button onClick={() => handleRoll(10)} disabled={loading}>
          🎲 Roll 10
        </button>
      </div>

      {loading && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <span className="spinner" />
          <span>⏳ Đang roll card, vui lòng chờ...</span>
        </div>
      )}

      {!loading && cards.length > 0 && (
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
          💰 Tổng giá trị (market): ${totalPrice}
        </p>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
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
