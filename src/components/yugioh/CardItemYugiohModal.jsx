import React from "react";
import "../common/styles/CardItem.css";

const CardItemYugiohModal = ({ isOpen, onClose, card }) => {
  if (!isOpen) return null;

  const bigImageUrl = `${import.meta.env.VITE_API_BASE_URL}/api/images/yugioh/${card.cardId}.jpg`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={bigImageUrl} alt={card.name} className="hires-image yugioh" />
        <button className="close-button" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
};

export default CardItemYugiohModal;
