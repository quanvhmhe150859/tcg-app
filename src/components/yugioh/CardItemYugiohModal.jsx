import React from "react";
import styles from "./CardItemYugiohModal.module.css";

const CardItemYugiohModal = ({ isOpen, onClose, card }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <img src={card.imageUrl} alt={card.name} className={styles.modalImage} />
        <button className={styles.closeButton} onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
};

export default CardItemYugiohModal;
