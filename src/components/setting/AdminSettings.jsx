import React, { useState, useRef, useEffect } from "react";
import "./AdminSettings.css";
import ImportDataPokemon from "./ImportDataPokemon";
import ImportDataYugioh from "./ImportDataYugioh";
import AllowedTypesSelector from "./AllowedTypesSelector";
import AllowedRaritiesPokemon from "./AllowedRaritiesPokemon";
import AllowedRaritiesYugiohWeight from "./AllowedRaritiesYugiohWeight";
import ControlButtons from "../common/ControlDirectionButtons";
import BgmPlayer from "./BgmPlayer";
import SaveLoadData from "./SaveLoadData";
import ProtectedSection from "./ProtectedSection";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AdminSettings = () => {
  const { t } = useTranslation();

  useEffect(() => {
    document.body.style.minWidth = "672px";

    return () => {
      document.body.style.minWidth = ""; // reset khi rời trang
    };
  }, []);

  const location = useLocation();

  const [tab, setTab] = useState("general");

  useEffect(() => {
    if (location.state?.defaultTab) {
      setTab(location.state.defaultTab);
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.defaultTab && tab === location.state.defaultTab) {
      const timer = setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight - 200,
          behavior: "smooth",
        });
      }, 500); // chờ render 0.5s
      return () => clearTimeout(timer);
    }
  }, [tab, location.state]);

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

    alert(t("allSettingsSaved") + "!");
  };

  return (
    <div className="admin-settings">
      <h1 className="text-4xl font-bold mt-4 mb-8">
        <span className="hidden sm:inline">🛠️ </span>
        {t("settings")}
      </h1>

      {/* Tab Buttons */}
      <div className="mb-6 flex gap-4 justify-center">
        <button
          className={tab === "general" ? "selected-tab" : ""}
          onClick={() => setTab("general")}
        >
          {t("general")}
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

      {/* General Tab */}
      <div className={`tab-content ${tab === "general" ? "open" : "closed"}`}>
        <div className="section">
          <h3 className="text-center">
            {t("position")} {t("floatingActionButtons")}
          </h3>
          <ControlButtons />
        </div>

        <div className="section">
          <BgmPlayer />
        </div>

        <div className="section">
          <SaveLoadData />
        </div>

        <ProtectedSection>
          <div className="section">
            <h3>{t("importData")}</h3>
            <ImportDataPokemon />
            <ImportDataYugioh />
          </div>
        </ProtectedSection>
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

      {tab !== "general" && <button onClick={handleSave}>{t("save")}</button>}
    </div>
  );
};

export default AdminSettings;
