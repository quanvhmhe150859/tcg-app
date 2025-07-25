import React, { useState } from "react";
import RarityDot from "./RarityDot";
import { Tooltip as ReactTooltip } from "react-tooltip";
import CardItemYugiohModal from "./CardItemYugiohModal";
import "../common/CardItem.css";
import { motion } from "framer-motion";

const CardItemYugioh = ({ card, index }) => {
  const cardId = card.cardId || card.card_id || "unknown";
  const smallImageUrl = `${
    import.meta.env.VITE_API_BASE_URL
  }/images/yugioh/${cardId}_small.jpg`;

  const [showModal, setShowModal] = useState(false);
  const tooltipId = `tooltip-${card.id}`;
  const rarity = card.rarity || "Unknown";
  const price = card.price ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`card-container`}
    >
      <div
        className={`image-container yugioh-card`}
        onClick={() => setShowModal(true)}
      >
        <img
          src={smallImageUrl}
          alt={card.name}
          className={`card-image`}
          style={
            card.frameType === "skill"
              ? { width: "200px", height: "291.79px" }
              : undefined
          }
        />
        <span className="zoom-icon">🔍</span>
      </div>

      <div>
        <h4
          className={`card-info-line`}
          data-tooltip-id={tooltipId}
          data-tooltip-content={card.name}
        >
          {card.name}
        </h4>

        <p
          className={`card-info-line`}
          data-tooltip-id={tooltipId}
          data-tooltip-content={`${card.archetype ?? "None"}`}
        >
          🏷️ Archetype: {card.archetype ?? "None"}
        </p>

        <p
          className={`card-info-line`}
          data-tooltip-id={tooltipId}
          data-tooltip-content={`${card.setName}`}
        >
          📦 Set: {card.setName}
        </p>

        <p
          className={`card-info-line`}
          data-tooltip-id={tooltipId}
          data-tooltip-content={`${rarity}`}
        >
          ⭐ Rarity:
          <RarityDot rarity={card.rarity} code={card.setRarityCode} />
          {rarity}
        </p>

        <p
          className={`card-info-line`}
          data-tooltip-id={tooltipId}
          data-tooltip-content={`${price.toFixed(2)}`}
        >💰 Price: ${price.toFixed(2)}</p>

        <ReactTooltip id={tooltipId} place="top" />
      </div>

      {/* Modal phóng to ảnh */}
      <CardItemYugiohModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        card={card}
      />
    </motion.div>
  );
};

export default CardItemYugioh;
