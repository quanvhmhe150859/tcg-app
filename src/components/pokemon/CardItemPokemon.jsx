import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tooltip } from "react-tooltip";
import "../common/CardItem.css";
import "./rarityEffects.css";
import { getRarityStyle } from "../../utils/getRarityStyle";
import CardItemPokemonModal from "./CardItemPokemonModal";

const CardItemPokemon = ({ card, index, darkMode }) => {
  const [showModal, setShowModal] = useState(false);
  const smallUrl = `${import.meta.env.VITE_API_BASE_URL}/api/images/pokemon/${
    card.id
  }.png`;

  const rarityStyle = getRarityStyle(card.rarity);
  const rarityClass = rarityStyle.className || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`card-container ${darkMode ? "dark" : "light"}`}
    >
      <div className={`image-container ${rarityClass}`}>
        <img
          src={smallUrl}
          alt={card.name}
          className="card-image pokemon"
          onClick={() => setShowModal(true)}
        />
        <span className="zoom-icon">🔍</span>
      </div>

      <h4
        className="card-info-line"
        data-tooltip-id={`tooltip-${card.id}-name`}
        data-tooltip-content={card.name}
      >
        {card.name}
      </h4>
      <Tooltip id={`tooltip-${card.id}-name`} place="top" />

      <p className="card-info-line rarity-line">
        {/* <strong className="rarity-label">Rarity:</strong> */}
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

      {/*Quantity*/}
      {card.quantity !== undefined && card.quantity > 0 && (
        <p className="card-info-line quantity-line">
          <span className="quantity-value">x{card.quantity}</span>
        </p>
      )}

      {/* Modal tách riêng */}
      <CardItemPokemonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        card={card}
      />
    </motion.div>
  );
};

export default CardItemPokemon;
