import React, { useState, useEffect } from "react";
import RarityDot from "./RarityDot";
import { Tooltip as ReactTooltip } from "react-tooltip";
import CardItemYugiohModal from "./CardItemYugiohModal";
import "../styles/CardItem.css";
import { motion } from "framer-motion";

const CardItemYugioh = ({ card, index, isFlipped = true, type, onCardFlip }) => {
  const [showModal, setShowModal] = useState(false);
  const cardId = card.cardId || card.card_id || "unknown";
  const smallImageUrl = `${
    import.meta.env.VITE_API_BASE_URL
  }/api/images/yugioh/${cardId}_small.jpg`;
  const backCardUrl = "/default-yugioh.jpg";
  const rarity = card.rarity || "Unknown";
  const price = card.price ?? 0;
  const tooltipId = `tooltip-${card.id}`;

  const handleCardClick = () => {
    if (isFlipped) {
      setShowModal(true); // Nếu đã lật, mở modal
    } else {
      onCardFlip(); // ← CHỈ GỌI MỘT LẦN: lật bài + cộng tiền
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`card-container`}
    >
      <div className={`image-container yugioh-card`} onClick={handleCardClick}>
        <motion.img
          src={isFlipped ? smallImageUrl : backCardUrl}
          alt={isFlipped ? card.name : "Card Back"}
          className={`card-image`}
          style={{ width: "184px", height: "268.44px" }}
          initial={{ rotateY: isFlipped ? 180 : 0 }}
          animate={{ rotateY: isFlipped ? 360 : 0 }}
          transition={{ duration: 0.3 }}
        />
        {isFlipped && <span className="zoom-icon">🔍</span>}
      </div>

      {isFlipped && (
        <>
          <h4
            className={`card-info-line`}
            data-tooltip-id={tooltipId}
            data-tooltip-content={card.name}
          >
            {card.name}
          </h4>

          {type === "gacha" && (
            <>
              <p
                className={`card-info-line`}
                data-tooltip-id={tooltipId}
                data-tooltip-content={`Archetype: ${card.archetype ?? "None"}`}
              >
                🏷️: {card.archetype ?? "None"}
              </p>

              <p
                className={`card-info-line`}
                data-tooltip-id={tooltipId}
                data-tooltip-content={`Set: ${card.setName}`}
              >
                📦: {card.setName}
              </p>

              <p
                className={`card-info-line`}
                data-tooltip-id={tooltipId}
                data-tooltip-content={`Rarity: ${rarity}`}
              >
                ⭐:
                <RarityDot rarity={card.rarity} code={card.setRarityCode} />
                {rarity}
              </p>
            </>
          )}

          <p
            className={`card-info-line`}
            data-tooltip-id={tooltipId}
            data-tooltip-content={`${price.toFixed(2)} $`}
          >
            💰: {price.toFixed(2)} <span className="text-green-400">$</span>
          </p>

          {card.quantity !== undefined && card.quantity > 0 && (
            <p className="card-info-line quantity-line">
              <span className="quantity-value">x{card.quantity}</span>
            </p>
          )}

          <ReactTooltip id={tooltipId} place="top" />
        </>
      )}

      <CardItemYugiohModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        card={card}
      />
    </motion.div>
  );
};

export default CardItemYugioh;