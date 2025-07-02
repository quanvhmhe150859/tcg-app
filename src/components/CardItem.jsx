import React from "react";
import { motion } from "framer-motion";
import RarityIcon from "./RarityIcon";

const getRarityStyle = (rarity) => {
  switch ((rarity || "").toLowerCase()) {
    case "common":
      return { background: "#e0e0e0", color: "#000", padding: "2px 6px", borderRadius: "999px" };
    case "uncommon":
      return { background: "#4caf50", color: "#fff", padding: "2px 6px", borderRadius: "999px" };
    case "rare":
      return { background: "#1976d2", color: "#fff", padding: "2px 6px", borderRadius: "999px" };
    case "ultra rare":
    case "rare holo":
    case "rare holo ex":
    case "rare ultra":
      return {
        background: "linear-gradient(90deg, #f50057, #ff9800)",
        color: "#fff",
        padding: "2px 6px",
        borderRadius: "999px",
      };
    default:
      return { background: "#ccc", color: "#000", padding: "2px 6px", borderRadius: "999px" };
  }
};

const CardItem = ({ card, index, darkMode }) => {
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
      <img
        src={card.images.small} // large
        alt={card.name}
        width="100%"
        style={{ borderRadius: "8px" }}
      />
      <h4>{card.name}</h4>
      <p><strong>Set:</strong> {card.set.name}</p>
      <p style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
        <strong>Rarity:</strong>
        <RarityIcon rarity={card.rarity} />
        <span style={getRarityStyle(card.rarity)}>
          {card.rarity || "Unknown"}
        </span>
      </p>
      <p><strong>Type:</strong> {(card.types || []).join(", ")}</p>
      <p><strong>Price:</strong> ${marketPrice}</p>
    </motion.div>
  );
};

export default CardItem;
