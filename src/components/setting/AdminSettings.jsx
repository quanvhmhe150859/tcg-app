import React, { useEffect, useState } from "react";
import {
  allTypesPokemon,
  allRaritiesPokemon,
  allTypesYugioh,
} from "../../utils/constants";
import "./AdminSettings.css";
import ImportDataPokemon from "./ImportDataPokemon";
import ImportDataYugioh from "./ImportDataYugioh";
import AllowedTypesSelector from "./AllowedTypesSelector";
import AllowedRaritiesPokemon from "./AllowedRaritiesPokemon";
import AllowedRaritiesYugiohWeight from "./AllowedRaritiesYugiohWeight";

const AdminSettings = () => {
  const [tab, setTab] = useState("import");

  const [allowedTypesPokemon, setAllowedTypesPokemon] = useState([]);
  const [allowedRaritiesPokemon, setAllowedRaritiesPokemon] = useState([]);

  const [allowedTypesYugioh, setAllowedTypesYugioh] = useState([]);

  const [rarityPercentagesYugioh, setRarityPercentagesYugioh] = useState({});

  useEffect(() => {
    const storedTypesPoke =
      JSON.parse(localStorage.getItem("allowedTypesPokemon")) || [];
    const storedRaritiesPoke =
      JSON.parse(localStorage.getItem("allowedRaritiesPokemon")) || [];
    const storedTypesYugi =
      JSON.parse(localStorage.getItem("allowedTypesYugioh")) || [];

    const storedRarityPercentsYugi =
      JSON.parse(localStorage.getItem("rarityPercentagesYugioh")) || {};

    setAllowedTypesPokemon(storedTypesPoke);
    setAllowedRaritiesPokemon(storedRaritiesPoke);
    setAllowedTypesYugioh(storedTypesYugi);
    setRarityPercentagesYugioh(storedRarityPercentsYugi);
  }, []);

  const handleToggleType = (type, isYugioh = false) => {
    if (isYugioh) {
      setAllowedTypesYugioh((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
    } else {
      setAllowedTypesPokemon((prev) =>
        prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
      );
    }
  };

  const handleToggleRarity = (rarity) => {
    setAllowedRaritiesPokemon((prev) =>
      prev.includes(rarity)
        ? prev.filter((r) => r !== rarity)
        : [...prev, rarity]
    );
  };

  const handleSave = () => {
    localStorage.setItem(
      "allowedTypesPokemon",
      JSON.stringify(allowedTypesPokemon)
    );
    localStorage.setItem(
      "allowedRaritiesPokemon",
      JSON.stringify(allowedRaritiesPokemon)
    );
    localStorage.setItem(
      "allowedTypesYugioh",
      JSON.stringify(allowedTypesYugioh)
    );

    localStorage.setItem(
      "rarityPercentagesYugioh",
      JSON.stringify(rarityPercentagesYugioh)
    );

    alert("Settings saved!");
  };

  return (
    <div className="admin-settings">
      <h1 className="text-4xl font-bold mt-4 mb-8">
        <span className="hidden md:inline">🛠️ </span>
        Admin Settings
      </h1>

      {/* Tab Buttons */}
      <div className="mb-6 flex gap-4 justify-center">
        <button
          className={tab === "import" ? "selected-tab" : ""}
          onClick={() => setTab("import")}
        >
          Import Data
        </button>
        <button
          className={tab === "pokemon" ? "selected-tab" : ""}
          onClick={() => setTab("pokemon")}
        >
          Pokémon
        </button>
        <button
          className={tab === "yugioh" ? "selected-tab" : ""}
          onClick={() => setTab("yugioh")}
        >
          Yu-Gi-Oh!
        </button>
      </div>

      {/* Pokémon Tab */}
      <div className={`tab-content ${tab === "pokemon" ? "open" : "closed"}`}>
        <AllowedTypesSelector
          title="Allowed Types"
          allTypes={allTypesPokemon}
          selectedTypes={allowedTypesPokemon}
          onToggle={(type) => handleToggleType(type, false)}
        />

        <AllowedRaritiesPokemon
          rarities={allRaritiesPokemon}
          selected={allowedRaritiesPokemon}
          onToggle={handleToggleRarity}
        />

        <button onClick={handleSave}>Save</button>
      </div>

      {/* Yu-Gi-Oh Tab */}
      <div className={`tab-content ${tab === "yugioh" ? "open" : "closed"}`}>
        <AllowedTypesSelector
          title="Allowed Types"
          allTypes={allTypesYugioh}
          selectedTypes={allowedTypesYugioh}
          onToggle={(type) => handleToggleType(type, true)}
        />

        <AllowedRaritiesYugiohWeight />

        <button onClick={handleSave}>Save</button>
      </div>

      {/* Import Data Tab */}
      <div className={`tab-content ${tab === "import" ? "open" : "closed"}`}>
        <div className="section">
          <h3>Import Data</h3>
          <ImportDataPokemon />
          <ImportDataYugioh />
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
