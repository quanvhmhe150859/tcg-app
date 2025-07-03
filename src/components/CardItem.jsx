// CardItem.jsx

import React from "react";
import { motion } from "framer-motion";
import RarityIcon from "./RarityIcon";
import { Tooltip } from "react-tooltip";
import "./CardItem.css";
import { getRarityStyle } from "./getRarityStyle";

const CardItem = ({ card, index, darkMode }) => {
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
      style={{
        width: "200px",
        background: darkMode ? "#2c2c2c" : "#fff",
        color: darkMode ? "#f5f5f5" : "#000",
        padding: "0.5rem",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        margin: "1rem",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <div className={rarityClass}>
        <img
          src={card.images.small}
          alt={card.name}
          width="100%"
          style={{ borderRadius: "15px", display: "block" }}
        />
      </div>

      <h4
        className="card-info-line"
        data-tooltip-id={`tooltip-${card.id}-name`}
        data-tooltip-content={card.name}
      >
        {card.name}
      </h4>
      <Tooltip id={`tooltip-${card.id}-name`} place="top" />

      <p
        className="card-info-line"
        data-tooltip-id={`tooltip-${card.id}-set`}
        data-tooltip-content={card.set.name}
      >
        <strong>Set:</strong> {card.set.name}
      </p>
      <Tooltip id={`tooltip-${card.id}-set`} place="top" />

      <p className="card-info-line" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
        <strong style={{ flexShrink: 0 }}>Rarity:</strong>
        <RarityIcon rarity={card.rarity} />
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

      <p
        className="card-info-line"
        data-tooltip-id={`tooltip-${card.id}-type`}
        data-tooltip-content={(card.types || []).join(", ")}
      >
        <strong>Type:</strong> {(card.types || []).join(", ")}
      </p>
      <Tooltip id={`tooltip-${card.id}-type`} place="top" />

      <p
        className="card-info-line"
        data-tooltip-id={`tooltip-${card.id}-price`}
        data-tooltip-content={`$${marketPrice}`}
      >
        <strong>Price:</strong> ${marketPrice}
      </p>
      <Tooltip id={`tooltip-${card.id}-price`} place="top" />
    </motion.div>
  );
};

export default CardItem;
