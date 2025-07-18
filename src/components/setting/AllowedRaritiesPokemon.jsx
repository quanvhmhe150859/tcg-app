import React from "react";
import "./AdminSettings.css"; // dùng lại style toggle-button

const AllowedRaritiesPokemon = ({ rarities, selected, onToggle }) => {
  return (
    <div className="section">
      <h3 className="text-2xl font-bold mb-2">Allowed Rarities</h3>
      <div className="toggle-group">
        {rarities.map((rarity) => (
          <button
            key={rarity}
            className={`toggle-button ${selected.includes(rarity) ? "selected" : ""}`}
            onClick={() => onToggle(rarity)}
          >
            {rarity}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AllowedRaritiesPokemon;
