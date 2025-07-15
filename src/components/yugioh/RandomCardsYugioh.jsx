import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import YugiohCardItem from "./CardItemYugioh";
import Select from "react-select";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../common/RandomCards.module.css";
import RollButtonGroup from "../common/RollButtonGroup";

const YugiohRoll = () => {
  const [archetypes, setArchetypes] = useState([]);
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [cards, setCards] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [noResultWarning, setNoResultWarning] = useState(false);

  useEffect(() => {
    const fetchArchetypes = async () => {
      try {
        const res = await api.get("/api/CardsYugioh/archetypes");
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
    setNoResultWarning(false);
    try {
      const res = await api.get("/api/CardsYugioh/cards", {
        params: {
          limit: count,
          archetype: selectedArchetype?.value,
        },
      });

      const result = Array.isArray(res.data) ? res.data.slice(0, 10) : [];

      if (!result || result.length === 0) {
        setNoResultWarning(true);
        setCards([]);
      } else {
        setCards(result);
      }

      await new Promise((res) => setTimeout(res, 500));
    } catch (err) {
      console.error("Roll lỗi:", err);
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

      {/* Roll Buttons */}
      <RollButtonGroup handleRoll={handleRoll} isRolling={isRolling} />

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
              <YugiohCardItem card={card} index={index} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default YugiohRoll;