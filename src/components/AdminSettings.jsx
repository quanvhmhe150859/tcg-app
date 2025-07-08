import React, { useEffect, useState } from "react";
import { allTypes, allRarities } from "../utils/constants";
import "./AdminSettings.css";
import ImportData from "./ImportData";

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
      <h2>Admin Settings</h2>

      <div className="section">
        <h3>Allowed Types</h3>
        <div className="toggle-group">
          {allTypes.map((type) => (
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
        <h3>Allowed Rarities</h3>
        <div className="toggle-group">
          {allRarities.map((rarity) => (
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
        <ImportData />
      </div>
    </div>
  );
};

export default AdminSettings;
