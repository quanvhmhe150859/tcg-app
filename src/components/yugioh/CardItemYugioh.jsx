import React, { useState } from "react";
import styles from "./CardItemYugioh.module.css";
import RarityDot from "./RarityDot";
import { Tooltip as ReactTooltip } from "react-tooltip";
import CardItemYugiohModal from "./CardItemYugiohModal";

const YugiohCardItem = ({ card }) => {
  const [showModal, setShowModal] = useState(false);
  const image = card.imageUrl;
  const tooltipId = `tooltip-${card.id}`;
  const rarity = card.rarity || "Unknown";
  const price = card.price ?? 0;

  return (
    <div className={styles.cardItem}>
      <div className={styles.yugiohCard} onClick={() => setShowModal(true)}>
        {image && (
          <img src={image} alt={card.name} className={styles.cardImage} />
        )}
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
