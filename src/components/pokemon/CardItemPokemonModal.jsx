import React from "react";
import "../common/styles/CardItem.css";

const CardItemPokemonModal = ({ isOpen, onClose, card }) => {
  if (!isOpen) return null;

  const hiresUrl = `${import.meta.env.VITE_API_BASE_URL}/api/images/pokemon/${card.id}_hires.png`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <img className="hires-image pokemon" src={hiresUrl} alt={card.name} />
        <button className="close-button" onClick={onClose}>
          ✖
        </button>
      </div>
    </div>
  );
};

export default CardItemPokemonModal;
