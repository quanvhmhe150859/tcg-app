import React, { useState, useRef } from "react";
import "./AdminSettings.css";
import ImportDataPokemon from "./ImportDataPokemon";
import ImportDataYugioh from "./ImportDataYugioh";
import AllowedTypesSelector from "./AllowedTypesSelector";
import AllowedRaritiesPokemon from "./AllowedRaritiesPokemon";
import AllowedRaritiesYugiohWeight from "./AllowedRaritiesYugiohWeight";

const AdminSettings = () => {
  const [tab, setTab] = useState("general");

  const yugiohTypes = useRef();
  const pokemonTypes = useRef();
  const yugiohRaritites = useRef();
  const pokemonRarities = useRef();

  const handleSave = () => {
    if (tab === "yugioh") {
      yugiohTypes.current?.save();
      yugiohRaritites.current?.save();
    }

    if (tab === "pokemon") {
      pokemonTypes.current?.save();
      pokemonRarities.current?.save();
    }

    alert("All settings saved!");
  };

  return (
    <div className="admin-settings">
      <h1 className="text-4xl font-bold mt-4 mb-8">
        <span className="hidden md:inline">🛠️ </span>
        Settings
      </h1>

      {/* Tab Buttons */}
      <div className="mb-6 flex gap-4 justify-center">
        <button
          className={tab === "general" ? "selected-tab" : ""}
          onClick={() => setTab("general")}
        >
          General
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
        <AllowedTypesSelector ref={pokemonTypes} type="pokemon" />
        <AllowedRaritiesPokemon ref={pokemonRarities} />
      </div>

      {/* Yu-Gi-Oh Tab */}
      <div className={`tab-content ${tab === "yugioh" ? "open" : "closed"}`}>
        <AllowedTypesSelector ref={yugiohTypes} type="yugioh" />
        <AllowedRaritiesYugiohWeight ref={yugiohRaritites} />
      </div>

      {/* Import Data Tab */}
      <div className={`tab-content ${tab === "general" ? "open" : "closed"}`}>
        <div className="section">
          <h3>Import Data</h3>
          <ImportDataPokemon />
          <ImportDataYugioh />
        </div>
      </div>

      {tab !== "general" && <button onClick={handleSave}>Save</button>}
    </div>
  );
};

export default AdminSettings;
