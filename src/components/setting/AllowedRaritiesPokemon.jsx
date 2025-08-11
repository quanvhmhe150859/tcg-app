import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { allRaritiesPokemon } from "../../utils/constants";
import "./AdminSettings.css";
import { useTranslation } from "react-i18next";

const LOCAL_KEY = "allowedRaritiesPokemon";

const AllowedRaritiesPokemon = forwardRef((_, ref) => {
  const { t } = useTranslation();

  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    setSelected(stored);
  }, []);

  useImperativeHandle(ref, () => ({
    save: () => {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(selected));
    },
  }));

  const toggleRarity = (rarity) => {
    setSelected((prev) =>
      prev.includes(rarity) ? prev.filter((r) => r !== rarity) : [...prev, rarity]
    );
  };

  return (
    <div className="section">
      <h3>Rarities {t("allowed")}</h3>
      <div className="toggle-group">
        {allRaritiesPokemon.map((rarity) => (
          <button
            key={rarity}
            className={`toggle-button ${selected.includes(rarity) ? "selected" : ""}`}
            onClick={() => toggleRarity(rarity)}
          >
            {rarity}
          </button>
        ))}
      </div>
    </div>
  );
});

export default AllowedRaritiesPokemon;
