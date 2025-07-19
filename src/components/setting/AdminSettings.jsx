import React, { useEffect, useState } from "react";
import {
  allTypesPokemon,
  allRaritiesPokemon,
  allTypesYugioh,
  allRaritiesYugioh,
} from "../../utils/constants";
import "./AdminSettings.css";
import ImportDataPokemon from "./ImportDataPokemon";
import ImportDataYugioh from "./ImportDataYugioh";
import AllowedTypesSelector from "./AllowedTypesSelector";
import AllowedRaritiesPokemon from "./AllowedRaritiesPokemon";
import AllowedRaritiesYugioh from "./AllowedRaritiesYugioh";

const AdminSettings = () => {
  const [tab, setTab] = useState("import");

  const [allowedTypesPokemon, setAllowedTypesPokemon] = useState([]);
  const [allowedRaritiesPokemon, setAllowedRaritiesPokemon] = useState([]);

  const [allowedTypesYugioh, setAllowedTypesYugioh] = useState([]);

  const [rarityPercentagesYugioh, setRarityPercentagesYugioh] = useState({});

  const [fixedFirstPercent, setFixedFirstPercent] = useState("");

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

  const round2 = (num) => Math.round(num * 100) / 100;

  const handleChangeRarityPercentage = (rarity, value) => {
    setRarityPercentagesYugioh((prev) => {
      const newPercentages = { ...prev, [rarity]: round2(value) };
      const reversed = [...allRaritiesYugioh].reverse();
      const currentIndex = reversed.indexOf(rarity);
      let total = Object.values(newPercentages).reduce((a, b) => a + b, 0);
      total = round2(total);

      // CASE 1: Tổng lớn hơn 100 => giảm từ dưới lên
      if (total > 100) {
        let excess = round2(total - 100);
        for (let i = reversed.length - 1; i > currentIndex; i--) {
          const r = reversed[i];
          const current = newPercentages[r] || 0;

          if (current > 0) {
            const reduce = Math.min(current, excess);
            const reduced = round2(current - reduce);
            newPercentages[r] = reduced < 0 ? 0 : reduced;
            excess = round2(excess - reduce);
          }

          if (excess <= 0) break;
        }
      }

      // CASE 2: Tổng nhỏ hơn 100 => cộng vào cái cuối cùng
      if (total < 100) {
        const last = reversed[reversed.length - 1];
        const missing = round2(100 - total);
        newPercentages[last] = round2((newPercentages[last] || 0) + missing);
      }

      return newPercentages;
    });
  };

  const getRandomPercentages = (keys, fixedFirst) => {
    const count = keys.length;
    const randoms = [];

    // ✅ 1. Nếu có fixedFirst
    let fixedValue = 0;
    let available = 100;

    if (fixedFirst != null && !isNaN(fixedFirst)) {
      fixedValue = Math.min(Math.max(+fixedFirst, 0), 100); // clamp 0–100
      available = 100 - fixedValue;
    }

    // ✅ 2. Sinh random cho phần còn lại (N - 1)
    for (let i = 1; i < count; i++) {
      randoms.push(Math.random());
    }

    const sum = randoms.reduce((a, b) => a + b, 0);
    let percentages = randoms.map(
      (v) => Math.round((v / sum) * available * 100) / 100
    );

    // ✅ 3. Tính lại phần còn lại cho đầu tiên nếu không fixed
    let firstValue = fixedValue;
    if (fixedFirst == null || fixedFirst === "") {
      const leftover =
        Math.round((100 - percentages.reduce((a, b) => a + b, 0)) * 100) / 100;
      const maxInOthers = Math.max(...percentages);
      if (leftover < maxInOthers) {
        const maxIndex = percentages.findIndex((v) => v === maxInOthers);
        [percentages[maxIndex], firstValue] = [
          firstValue,
          percentages[maxIndex],
        ];
      } else {
        firstValue = leftover;
      }
    }

    percentages.unshift(firstValue);

    const result = {};
    keys.forEach((key, i) => {
      result[key] = percentages[i];
    });

    return result;
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
        <button
          className={tab === "import" ? "selected-tab" : ""}
          onClick={() => setTab("import")}
        >
          Import Data
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

        <AllowedRaritiesYugioh
          rarities={allRaritiesYugioh}
          percentages={rarityPercentagesYugioh}
          onChangePercentage={handleChangeRarityPercentage}
          fixedFirstPercent={fixedFirstPercent}
          setFixedFirstPercent={setFixedFirstPercent}
          onRandom={() => {
            const fixed =
              fixedFirstPercent === "" ? null : parseFloat(fixedFirstPercent);
            const random = getRandomPercentages(allRaritiesYugioh, fixed);
            setRarityPercentagesYugioh(random);
          }}
        />

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
