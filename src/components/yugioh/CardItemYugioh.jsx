import React from "react";
import styles from "./CardItemYugioh.module.css";

const YugiohCardItem = ({ card }) => {
  const image = card.imageUrl;
  const price = card.price ?? 0;
  const rarity = card.rarity || "Unknown";
  const sets = card.sets || [];

  return (
    <div className={styles.cardItem}>
      {image && (
        <img src={image} alt={card.name} className={styles.cardImage} />
      )}
      <div className={styles.cardInfo}>
        <h4 className={styles.cardName}>{card.name}</h4>
        <p>
          📦 Set: {card.setName} ({card.setCode})
        </p>
        <p>⭐ Rarity: {card.rarity}</p>
        <p>💰 Price: ${card.price?.toFixed(2) ?? "0.00"}</p>
      </div>
    </div>
  );
};

export default YugiohCardItem;
