import React, { useState } from "react";
import { motion } from "framer-motion";
import RarityIcon from "./RarityIcon";
import { Tooltip } from "react-tooltip";
import "./CardItem.css";
import "./rarityEffects.css";
import { getRarityStyle } from "./getRarityStyle";

const CardItem = ({ card, index, darkMode }) => {
  const [showModal, setShowModal] = useState(false);
  const smallUrl = `${import.meta.env.VITE_API_BASE_URL}/images/${card.id}.png`;
  const hiresUrl = `${import.meta.env.VITE_API_BASE_URL}/images/${
    card.id
  }_hires.png`;

  const rarityStyle = getRarityStyle(card.rarity);
  const rarityClass = rarityStyle.className || "";

  const marketPrice =
    card.tcgplayer?.prices?.normal?.market?.toFixed(2) ||
    card.tcgplayer?.prices?.holofoil?.market?.toFixed(2) ||
    "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`card-container ${darkMode ? "dark" : "light"}`}
    >
      <div className={`imageContainer ${rarityClass}`}>
        {/* <img
          src={card.cardImage.largeUrl}
          alt={card.name}
          className="card-image"
        /> */}
        <img src={smallUrl} alt={card.name} className="card-image" onClick={() => setShowModal(true)}/>
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

      {/* <p
        className="card-info-line"
        data-tooltip-id={`tooltip-${card.id}-set`}
        data-tooltip-content={card.set.name}
      >
        <strong>Set:</strong> {card.set.name}
      </p>
      <Tooltip id={`tooltip-${card.id}-set`} place="top" /> */}

      <p className="card-info-line rarity-line">
        <strong className="rarity-label">Rarity:</strong>
        {/* <RarityIcon rarity={card.rarity} /> */}
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img className="hires-image" src={hiresUrl} alt={card.name} />
            <button
              className="close-button"
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>
          </div>
        </div>
      )}

      {/* <p
        className="card-info-line"
        data-tooltip-id={`tooltip-${card.id}-type`}
        data-tooltip-content={(card.cardTypes || [])
          .map((t) => t.type)
          .join(", ")}
      >
        <strong>Type:</strong>{" "}
        {(card.cardTypes || []).map((t) => t.type).join(", ")}
      </p>
      <Tooltip id={`tooltip-${card.id}-type`} place="top" /> */}

      {/* <p
        className="card-info-line"
        data-tooltip-id={`tooltip-${card.id}-price`}
        data-tooltip-content={`$${marketPrice}`}
      >
        <strong>Price:</strong> ${marketPrice}
      </p>
      <Tooltip id={`tooltip-${card.id}-price`} place="top" /> */}
    </motion.div>
  );
};

export default CardItem;