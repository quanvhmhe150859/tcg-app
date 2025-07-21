import React, { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import { allTypesPokemon, allTypesYugioh } from "../../utils/constants";
import "./AdminSettings.css";

const AllowedTypesSelector = forwardRef(({ type = "pokemon" }, ref) => {
  const config = {
    pokemon: {
      title: "Allowed Types",
      allTypes: allTypesPokemon,
      localKey: "allowedTypesPokemon",
    },
    yugioh: {
      title: "Allowed Types",
      allTypes: allTypesYugioh,
      localKey: "allowedTypesYugioh",
    },
  };

  const { title, allTypes, localKey } = config[type] || config.pokemon;

  const [selectedTypes, setSelectedTypes] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(localKey) || "[]");
    setSelectedTypes(stored);
  }, [localKey]);

  useImperativeHandle(ref, () => ({
    save: () => {
      localStorage.setItem(localKey, JSON.stringify(selectedTypes));
    },
  }));

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="section">
      <h3>{title}</h3>
      <div className="toggle-group">
        {allTypes.map((type) => (
          <button
            key={type}
            className={`toggle-button ${selectedTypes.includes(type) ? "selected" : ""}`}
            onClick={() => toggleType(type)}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
});

export default AllowedTypesSelector;
