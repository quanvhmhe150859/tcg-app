import React, { useEffect, useState } from "react";
import { allTypesPokemon, allRaritiesPokemon } from "../../utils/constants";
import "./AdminSettings.css";
import ImportDataPokemon from "./ImportDataPokemon";
import ImportDataYugioh from "./ImportDataYugioh";

const AdminSettings = () => {
  const [allowedTypes, setAllowedTypes] = useState([]);
  const [allowedRarities, setAllowedRarities] = useState([]);

  useEffect(() => {
    const storedTypes = JSON.parse(localStorage.getItem("allowedTypes")) || [];
    const storedRarities =
      JSON.parse(localStorage.getItem("allowedRarities")) || [];
    setAllowedTypes(storedTypes);
    setAllowedRarities(storedRarities);
  }, []);

  const handleToggleType = (type) => {
    setAllowedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleToggleRarity = (rarity) => {
    setAllowedRarities((prev) =>
      prev.includes(rarity)
        ? prev.filter((r) => r !== rarity)
        : [...prev, rarity]
    );
  };

  const handleSave = () => {
    localStorage.setItem("allowedTypes", JSON.stringify(allowedTypes));
    localStorage.setItem("allowedRarities", JSON.stringify(allowedRarities));
    alert("Settings saved!");
  };

  return (
    <div className="admin-settings">
      <h1 className="text-4xl font-bold mt-4 mb-8">
        <span className="hidden md:inline">🛠️ </span>
        Admin Settings
      </h1>

      <div className="section">
        <h3 className="text-2xl font-bold mb-2">Allowed Types</h3>
        <div className="toggle-group">
          {allTypesPokemon.map((type) => (
            <button
              key={type}
              className={`toggle-button ${
                allowedTypes.includes(type) ? "selected" : ""
              }`}
              onClick={() => handleToggleType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <h3 className="text-2xl font-bold mb-2">Allowed Rarities</h3>
        <div className="toggle-group">
          {allRaritiesPokemon.map((rarity) => (
            <button
              key={rarity}
              className={`toggle-button ${
                allowedRarities.includes(rarity) ? "selected" : ""
              }`}
              onClick={() => handleToggleRarity(rarity)}
            >
              {rarity}
            </button>
          ))}
        </div>
      </div>

      <button onClick={handleSave}>Save</button>
      <div>
        <ImportDataPokemon />
        <ImportDataYugioh />
      </div>
    </div>
  );
};

export default AdminSettings;
