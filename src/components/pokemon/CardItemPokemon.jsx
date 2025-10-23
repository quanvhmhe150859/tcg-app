import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";
import "../styles/CardItem.css";
import "./rarityEffects.css";
import { getRarityStylePokemon } from "../../utils/getRarityStylePokemon";
import CardItemPokemonModal from "./CardItemPokemonModal";

const CardItemPokemon = ({ card, index, isFlipped = true, onCardFlip, isApiFailed }) => {
  const [showModal, setShowModal] = useState(false);
  const smallUrl = `${import.meta.env.VITE_API_BASE_URL}/api/images/pokemon/${
    card.id
  }.png`;
  const backCardUrl = "/default-pokemon.png";
  const rarityStyle = getRarityStylePokemon(card.rarity);
  const rarityClass = rarityStyle.className || "";

  const handleCardClick = () => {
    if (isFlipped) {
      setShowModal(true); // Nếu đã lật, mở modal
    } else {
      onCardFlip(); // Lật lá bài
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`card-container`}
    >
      <div className={`image-container ${rarityClass}`} onClick={handleCardClick}>
        <motion.img
          src={isFlipped ? (isApiFailed ? card.cardImage.smallUrl : smallUrl) : backCardUrl}
          alt={isFlipped ? card.name : "Card Back"}
          className="card-image pokemon"
          initial={{ rotateY: isFlipped ? 180 : 0 }}
          animate={{ rotateY: isFlipped ? 360 : 0 }}
          transition={{ duration: 0.3 }}
        />
        {isFlipped && <span className="zoom-icon">🔍</span>}
      </div>

      {isFlipped && (
        <>
          <h4
            className="card-info-line"
            data-tooltip-id={`tooltip-${card.id}-name`}
            data-tooltip-content={card.name}
          >
            {card.name}
          </h4>
          <Tooltip id={`tooltip-${card.id}-name`} place="top" />

          <p className="card-info-line rarity-line">
            <span
              className="rarity-value"
              data-tooltip-id={`tooltip-${card.id}-rarity`}
              data-tooltip-content={card.rarity || "Unknown"}
              style={rarityStyle}
            >
              {card.rarity || "Unknown"}
            </span>
          </p>
          <Tooltip id={`tooltip-${card.id}-rarity`} place="top" />

          {card.quantity !== undefined && card.quantity > 0 && (
            <p className="card-info-line quantity-line">
              <span className="quantity-value">x{card.quantity}</span>
            </p>
          )}
        </>
      )}

      <CardItemPokemonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        card={card}
        isApiFailed={isApiFailed}
      />
    </motion.div>
  );
};

export default CardItemPokemon;