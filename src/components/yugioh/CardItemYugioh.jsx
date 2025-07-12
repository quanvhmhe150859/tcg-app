import React, { useState } from "react";
import styles from "./CardItemYugioh.module.css";
import RarityDot from "./RarityDot";
import { Tooltip as ReactTooltip } from "react-tooltip";
import CardItemYugiohModal from "./CardItemYugiohModal";
import "../pokemon/CardItemPokemon.css";

const YugiohCardItem = ({ card }) => {
  const cardId = card.cardId || card.card_id || "unknown";
  const smallImageUrl = `${
    import.meta.env.VITE_API_BASE_URL
  }/images/yugioh/${cardId}_small.jpg`;

  const [showModal, setShowModal] = useState(false);
  const tooltipId = `tooltip-${card.id}`;
  const rarity = card.rarity || "Unknown";
  const price = card.price ?? 0;

  return (
    <div className={`card-container ${styles.cardItem}`}>
      <div
        className={`imageContainer ${styles.yugiohCard}`}
        onClick={() => setShowModal(true)}
      >
        <img
          src={smallImageUrl}
          alt={card.name}
          className={`card-image ${styles.cardImage}`}
        />
        <span className="zoom-icon">🔍</span>
      </div>

      <div className={styles.cardInfo}>
        <h4
          className={`${styles.cardName} ${styles.ellipsis}`}
          data-tooltip-id={tooltipId}
          data-tooltip-content={card.name}
        >
          {card.name}
        </h4>

        <p
          className={styles.ellipsis}
          data-tooltip-id={tooltipId}
          data-tooltip-content={`${card.setName}`}
        >
          📦 Set: {card.setName}
        </p>

        <p
          className={styles.ellipsis}
          data-tooltip-id={tooltipId}
          data-tooltip-content={`${card.archetype}`}
        >
          🏷️ Archetype: {card.archetype ?? "None"}
        </p>

        <p
          className={styles.ellipsis}
          data-tooltip-id={tooltipId}
          data-tooltip-content={`${rarity}`}
        >
          ⭐ Rarity:
          <RarityDot rarity={card.rarity} code={card.setRarityCode} />
          {rarity}
        </p>

        <p>💰 Price: ${price.toFixed(2)}</p>

        <ReactTooltip id={tooltipId} place="top" />
      </div>

      {/* Modal phóng to ảnh */}
      <CardItemYugiohModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        card={card}
      />
    </div>
  );
};

export default YugiohCardItem;
