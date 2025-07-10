import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import YugiohCardItem from "./CardItemYugioh";
import Select from "react-select";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../common/RandomCards.module.css";

const YugiohRoll = () => {
  const [archetypes, setArchetypes] = useState([]);
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [cards, setCards] = useState([]);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    const fetchArchetypes = async () => {
      try {
        const res = await api.get("/api/YugiohCards/archetypes");
        const options = res.data.map((arch) => ({
          value: arch,
          label: arch,
        }));
        setArchetypes(options);
      } catch (err) {
        console.error("Không thể tải danh sách archetype:", err);
      }
    };
    fetchArchetypes();
  }, []);

  const handleRoll = async (count = 1) => {
    setIsRolling(true);
    try {
      const res = await api.get("/api/YugiohCards/cards", {
        params: {
          limit: count,
          archetype: selectedArchetype?.value,
        },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setCards(data);
    } catch (err) {
      console.error("Lỗi khi roll:", err);
    } finally {
      setTimeout(() => setIsRolling(false), 500);
    }
  };

  const totalPrice = cards
    .reduce((sum, card) => sum + (card?.price ?? 0), 0)
    .toFixed(2);

  return (
    <div className={styles.randomCardsContainer}>
      <h2>🃏 Yu-Gi-Oh! Card Roll</h2>

      <div className={styles.comboControls}>
        <Select
          className={styles.fullWidthSelect}
          options={archetypes}
          isClearable
          placeholder="Tìm kiếm archetype..."
          value={selectedArchetype}
          onChange={(selected) => setSelectedArchetype(selected)}
          isDisabled={isRolling}
        />
      </div>

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

      {!isRolling && cards.length > 0 && (
        <p className={styles.totalPrice}>
          💰 Tổng giá trị : ${totalPrice}
        </p>
      )}

      <div className={styles.cardList}>
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div
              key={`card-${card.id || "noid"}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <YugiohCardItem card={card} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default YugiohRoll;
