import React, { useEffect, useState } from "react";
import axios from "axios";
import CardItem from "./CardItem";
import { AnimatePresence, motion } from "framer-motion";
import "./Spinner.css"; // 👉 Chứa animation spinner

const RandomCards = () => {
  const [cards, setCards] = useState([]);
  const [types, setTypes] = useState([]);
  const [rarities, setRarities] = useState([]);
  const [allowedTypes, setAllowedTypes] = useState([]);
  const [allowedRarities, setAllowedRarities] = useState([]);

  const [selectedType, setSelectedType] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("");
  const [activeTab, setActiveTab] = useState("type");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("https://api.pokemontcg.io/v2/types")
      .then(res => setTypes(res.data.data))
      .catch(console.error);

    axios.get("https://api.pokemontcg.io/v2/rarities")
      .then(res => setRarities(res.data.data))
      .catch(console.error);

    const savedTypes = JSON.parse(localStorage.getItem("allowedTypes") || "[]");
    const savedRarities = JSON.parse(localStorage.getItem("allowedRarities") || "[]");

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

      const meta = await axios.get(`https://api.pokemontcg.io/v2/cards?q=${query}&pageSize=1`);
      const total = meta.data.totalCount;
      const totalPages = Math.ceil(total / 250);

      const results = [];

      for (let i = 0; i < count; i++) {
        const randomPage = Math.floor(Math.random() * totalPages) + 1;
        const res = await axios.get(`https://api.pokemontcg.io/v2/cards?q=${query}&pageSize=250&page=${randomPage}`);
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

  const rollAllCards = async (count = 1) => {
    await rollFromQuery("set.id:*", count); // ✅ Roll toàn bộ thẻ
  };

  const handleRoll = async (mode, count = 1) => {
    if (loading) return;
    if (mode === "type") {
      if (!selectedType) return alert("Chọn Type!");
      await rollFromQuery(`types:${selectedType}`, count);
    } else if (mode === "rarity") {
      if (!selectedRarity) return alert("Chọn Rarity!");
      await rollFromQuery(`rarity:"${selectedRarity}"`, count);
    } else {
      await rollAllCards(count);
    }
  };

  const hasValidType = allowedTypes.length > 0;
  const hasValidRarity = allowedRarities.length > 0;

  const filteredTypes = types.filter(t => allowedTypes.includes(t));
  const filteredRarities = rarities.filter(r => allowedRarities.includes(r));

  const totalPrice = cards.reduce((sum, c) => sum + getMarketPrice(c), 0).toFixed(2);

  const tabContent = {
    type: hasValidType ? (
      <>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} disabled={loading}>
          <option value="">-- Chọn type --</option>
          {filteredTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button onClick={() => handleRoll("type", 1)} disabled={loading}>Roll 1</button>
        <button onClick={() => handleRoll("type", 10)} disabled={loading} style={{ marginLeft: "0.5rem" }}>Roll 10</button>
      </>
    ) : <p>⚠️ Không có type nào được phép roll.</p>,

    rarity: hasValidRarity ? (
      <>
        <select value={selectedRarity} onChange={(e) => setSelectedRarity(e.target.value)} disabled={loading}>
          <option value="">-- Chọn rarity --</option>
          {filteredRarities.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button onClick={() => handleRoll("rarity", 1)} disabled={loading}>Roll 1</button>
        <button onClick={() => handleRoll("rarity", 10)} disabled={loading} style={{ marginLeft: "0.5rem" }}>Roll 10</button>
      </>
    ) : <p>⚠️ Không có rarity nào được phép roll.</p>,

    all: (
      <>
        <button onClick={() => handleRoll("all", 1)} disabled={loading}>Roll 1 ngẫu nhiên</button>
        <button onClick={() => handleRoll("all", 10)} disabled={loading} style={{ marginLeft: "0.5rem" }}>Roll 10 ngẫu nhiên</button>
      </>
    ),
  };

  const availableTabs = [
    hasValidType && "type",
    hasValidRarity && "rarity",
    "all"
  ].filter(Boolean);

  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] || "all");
    }
  }, [availableTabs, activeTab]);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🎴 Pokémon Card Roll</h2>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {availableTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ fontWeight: activeTab === tab ? "bold" : "normal" }}
          >
            {tab === "type" ? "🔥 Type" : tab === "rarity" ? "🌟 Rarity" : "🌀 Tất cả"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: "1rem" }}
        >
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>

      {loading && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
          <span className="spinner" />
          <span>⏳ Đang roll card, vui lòng chờ...</span>
        </div>
      )}

      {!loading && cards.length > 0 && (
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>
          💰 Tổng giá trị (market): ${totalPrice}
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "2rem" }}>
        {cards.map((card) => (
          <CardItem key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
};

export default RandomCards;
