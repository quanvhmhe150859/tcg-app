import React, { useEffect, useState } from "react";
import CardItemPokemon from "./CardItemPokemon";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../styles/RandomCards.module.css";
import { allTypesPokemon, allRaritiesPokemon } from "../../utils/constants";
import RollButtonGroup from "../common/RollButtonGroup";
import { getPokemonCards } from "./pokemonApiHelpers";
import { addCardsToLocalStorage } from "../../utils/storageUtils";
import { spendTicketsIfNeeded, refundTickets } from "../../utils/ticketUtils";
import { useTickets } from "../../context/TicketContext";
import SelectBox from "../common/SelectBox";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";

const RandomCardsPokemon = () => {
  const { t } = useTranslation();

  const [cards, setCards] = useState([]);
  const [flippedStates, setFlippedStates] = useState([]); // State cho trạng thái lật
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

  // Hàm xử lý khi lật lá bài
  const handleCardFlip = (index) => {
    if (flippedStates[index]) {
      return;
    }
    setFlippedStates((prev) => {
      const newStates = [...prev];
      newStates[index] = true;
      return newStates;
    });
  };

  // Hàm lật tất cả lá bài
  const handleFlipAll = () => {
    const newFlippedStates = cards.map(() => true);
    setFlippedStates(newFlippedStates);
  };

  const calcTicketCost = (baseCount = 1) => {
    let extraMultiplier = 0;

    if (selectedSuperType && selectedSuperType !== "") {
      extraMultiplier += 10;
    }

    if (selectedRarity && selectedRarity !== "") {
      const rarityIndex = allRaritiesPokemon.findIndex(
        (r) => r === selectedRarity
      );
      if (rarityIndex >= 0) {
        extraMultiplier += (rarityIndex + 1) * 10;
      }
    }

    if (selectedType && selectedType !== "") {
      extraMultiplier += 10;
    }

    return baseCount * (extraMultiplier > 0 ? extraMultiplier : 1);
  };

  const handleRoll = async (baseCount = 1) => {
    setFlippedStates(Array(baseCount).fill(false)); // Reset trạng thái lật
    const ticketCost = calcTicketCost(baseCount);

    if (
      !spendTicketsIfNeeded(ticketCost, spinMode, tickets, updateTickets, t)
    ) {
      return;
    }

    const updatedTickets = tickets - ticketCost;
    setIsRolling(true);
    setNoResultWarning(false);

    try {
      let result = await getPokemonCards({
        count: baseCount,
        type: selectedType,
        rarity: selectedRarity,
        superType: selectedSuperType,
      });
      let isDemo = false;

      if (!result || result.length === 0) {
        isDemo = true;
        setNoResultWarning(true);
        toast.success(t("showingDemoCardInstead"));
        toast.error(t("noMatchingCardFoundOrAnErrorOccurred"));
        // Nếu API trả về rỗng, lấy dữ liệu từ file demoPokemon.json
        const response = await fetch("/demo/demoPokemon.json");
        const demoData = await response.json();
        result = demoData.slice(0, baseCount);
        refundTickets(ticketCost, spinMode, updatedTickets, updateTickets);
      }

      await new Promise((res) => setTimeout(res, 500));
      setCards(result);
      setFlippedStates(Array(result.length).fill(false)); // Khởi tạo trạng thái úp

      addCardsToLocalStorage(result, "pokemon", spinMode, isDemo);
    } catch (err) {
      setNoResultWarning(true);
      refundTickets(ticketCost, spinMode, updatedTickets, updateTickets);
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

        <RollButtonGroup
          handleRoll={handleRoll}
          isRolling={isRolling}
          spinMode={spinMode}
          ticketOptions={[calcTicketCost(1), calcTicketCost(1) * 10]}
        />
        <div className="flex justify-center mt-2">
          {!isRolling &&
            cards.length > 0 &&
            !flippedStates.every((state) => state) && (
              <button
                onClick={handleFlipAll}
                disabled={flippedStates.every((state) => state)} // Vô hiệu hóa nếu tất cả đã lật
                className="toggle-button"
              >
                {t("openAllCards")}
              </button>
            )}
        </div>
      </div>

      {isRolling && (
        <div className={styles.spinnerContainer}>
          <span className="spinner" />
          <span>
            ⏳ {t("rollingCard")}, {t("pleaseWait")}...
          </span>
        </div>
      )}

      {/* {!isRolling && noResultWarning && (
        <p className="m-4">⚠️ {t("noMatchingCardFoundOrAnErrorOccurred")}. </p>
      )} */}

      <div className={styles.cardList}>
        {noResultWarning && (
          <div
            className="absolute inset-0 bg-[url('/demo/sample-watermark.png')] opacity-10 bg-repeat bg-[length:100px_100px] pointer-events-none w-full h-full z-10"
            style={{ backgroundSize: "100px 100px" }}
          ></div>
        )}
        <AnimatePresence>
          {cards.filter(Boolean).map((card, index) => (
            <motion.div
              key={`${card.id}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CardItemPokemon
                card={card}
                index={index}
                isFlipped={flippedStates[index] || false}
                onCardFlip={() => handleCardFlip(index)}
                isApiFailed={noResultWarning}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RandomCardsPokemon;
