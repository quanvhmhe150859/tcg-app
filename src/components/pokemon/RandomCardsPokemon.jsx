import React, { useEffect, useState } from "react";
import CardItem from "./CardItemPokemon";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../common/RandomCards.module.css";
import { allTypesPokemon, allRaritiesPokemon } from "../../utils/constants";
import RollButtonGroup from "../common/RollButtonGroup";
import { getPokemonCards } from "./pokemonApiHelpers";
import { addCardsToLocalStorage } from "../../utils/storageUtils";
import { spendTicketsIfNeeded } from "../../utils/ticketUtils";
import { useTickets } from "../context/TicketContext";
import SelectBox from "../common/SelectBox";
import { useTranslation } from "react-i18next";

const RandomCardsPokemon = () => {
  const { t } = useTranslation();

  const [cards, setCards] = useState([]);
  const [isRolling, setIsRolling] = useState(false);

  const [selectedType, setSelectedType] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("");
  const [selectedSuperType, setSelectedSuperType] = useState("");

  const [noResultWarning, setNoResultWarning] = useState(false);

  const allowedTypes =
    JSON.parse(localStorage.getItem("allowedTypesPokemon")) || [];
  const allowedRarities =
    JSON.parse(localStorage.getItem("allowedRaritiesPokemon")) || [];

  const hasValidType = allowedTypes.length > 0;
  const hasValidRarity = allowedRarities.length > 0;

  const filteredTypes = allTypesPokemon.filter((type) =>
    allowedTypes.includes(type)
  );
  const filteredRarities = allRaritiesPokemon.filter((rarity) =>
    allowedRarities.includes(rarity)
  );

  const spinMode = localStorage.getItem("spinMode");
  const { tickets, updateTickets } = useTickets();

  const handleRoll = async (count = 1) => {
    // 🆕 kiểm tra vé trước
    if (!spendTicketsIfNeeded(count, spinMode, tickets, updateTickets, t)) {
      return; // không đủ vé thì thoát
    }

    setIsRolling(true);
    setNoResultWarning(false);

    try {
      const result = await getPokemonCards({
        count,
        type: selectedType,
        rarity: selectedRarity,
        superType: selectedSuperType,
      });

      if (!result || result.length === 0) {
        setNoResultWarning(true);
      }

      await new Promise((res) => setTimeout(res, 500));
      setCards(result);

      // 🆕 Lưu vào localStorage
      addCardsToLocalStorage(result, "pokemon", spinMode);
    } catch (err) {
      setNoResultWarning(true);
    } finally {
      setIsRolling(false);
    }
  };

  const optionsSuperType = [
    { label: "🌐 " + t("all") + " Supertypes", value: "" },
    { label: "🔥 Pokémon", value: "Pokémon" },
    { label: "📘 Trainer", value: "Trainer" },
    { label: "⚡ Energy", value: "Energy" },
  ];

  const optionsRarity = [{ label: t("all") + " Rarity", value: "" }].concat(
    filteredRarities.map((r) => ({
      label: r,
      value: r,
    }))
  );

  const optionsType = [{ label: t("all") + " Type", value: "" }].concat(
    filteredTypes.map((t) => ({
      label: t,
      value: t,
    }))
  );

  useEffect(() => {
    if (selectedSuperType !== "Pokémon") {
      setSelectedType("");
    }
  }, [selectedSuperType]);

  return (
    <div className={styles.container}>
      <div className={styles.rollContainer}>
        <h1 className="text-4xl font-bold mt-4 mb-8">
          <span className="hidden sm:inline">🎴 </span>
          Pokémon
          <span className="hidden sm:inline"> Gacha</span>
        </h1>
        <div className={styles.comboControls}>
          <SelectBox
            options={optionsSuperType}
            value={selectedSuperType}
            onChange={setSelectedSuperType}
            isDisabled={isRolling}
          />

          {hasValidRarity && (
            <SelectBox
              options={optionsRarity}
              value={selectedRarity}
              onChange={setSelectedRarity}
              isDisabled={isRolling}
            />
          )}

          {hasValidType && selectedSuperType === "Pokémon" && (
            <SelectBox
              options={optionsType}
              value={selectedType}
              onChange={setSelectedType}
              isDisabled={isRolling}
            />
          )}
        </div>

        {/* Roll Buttons */}
        <RollButtonGroup handleRoll={handleRoll} isRolling={isRolling} spinMode={spinMode} />
      </div>

      {isRolling && (
        <div className={styles.spinnerContainer}>
          <span className="spinner" />
          <span>
            ⏳ {t("rollingCard")}, {t("pleaseWait")}...
          </span>
        </div>
      )}

      {!isRolling && noResultWarning && (
        <p className="m-4">⚠️ {t("noCardsMatchTheCurrentSelection")}.</p>
      )}

      <div className={styles.cardList}>
        <AnimatePresence>
          {cards.filter(Boolean).map((card, index) => (
            <motion.div
              key={`${card.id}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CardItem card={card} index={index} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RandomCardsPokemon;
