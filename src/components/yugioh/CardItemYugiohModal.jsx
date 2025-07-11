import React from "react";
import styles from "./CardItemYugiohModal.module.css";

const CardItemYugiohModal = ({ isOpen, onClose, card }) => {
  if (!isOpen) return null;

  const bigImageUrl = `${import.meta.env.VITE_API_BASE_URL}/images/yugioh/${card.cardId}.jpg`;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <img src={bigImageUrl} alt={card.name} className={styles.modalImage} />
        <button className={styles.closeButton} onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
};

export default CardItemYugiohModal;
