import React, { useEffect, useState } from "react";
import { allRaritiesYugioh } from "../../utils/constants";

const LOCAL_KEY = "rarityWeightsYugioh";
const TOTAL_WEIGHT = 10000;

const AllowedRaritiesYugiohWeight = () => {
  const [weights, setWeights] = useState({});
  const [fixedFirstPercent, setFixedFirstPercent] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}");
    setWeights(stored);
  }, []);

  const onChangeWeight = (rarity, value) => {
    const maxValue = 9999; // Max 4 digits
    setWeights((prev) => ({
      ...prev,
      [rarity]: isNaN(value) ? 0 : Math.min(value, maxValue),
    }));
  };

  const handleFixedPercentChange = (value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = 0;
    num = Math.min(Math.max(num, 0), 100);
    setFixedFirstPercent(num.toFixed(2));
  };

  const handleSave = () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(weights));
    alert("Saved rarity weights!");
  };

  const getRandomWeights = (keys, fixedFirstPercent) => {
    const count = keys.length;
    const randoms = [];

    let fixedValue = 0;
    let available = TOTAL_WEIGHT;

    const isFixed = fixedFirstPercent !== null && fixedFirstPercent !== "" && !isNaN(fixedFirstPercent);

    if (isFixed) {
      fixedValue = Math.round(Math.min(Math.max(+fixedFirstPercent, 0), 100) / 100 * TOTAL_WEIGHT);
      available = TOTAL_WEIGHT - fixedValue;
    }

    for (let i = 0; i < (isFixed ? count - 1 : count); i++) {
      randoms.push(Math.random());
    }

    const sum = randoms.reduce((a, b) => a + b, 0);
    const unrounded = randoms.map((v) => (v / sum) * available);
    const rounded = unrounded.map((v) => Math.floor(v));
    let diff = available - rounded.reduce((a, b) => a + b, 0);

    for (let i = 0; i < diff; i++) {
      rounded[i % rounded.length]++;
    }

    const result = {};
    if (isFixed) {
      result[keys[0]] = fixedValue;
      keys.slice(1).forEach((key, i) => {
        result[key] = rounded[i];
      });
    } else {
      keys.forEach((key, i) => {
        result[key] = rounded[i];
      });
    }

    return result;
  };

  const handleRandom = () => {
    const fixed = fixedFirstPercent === "" ? null : parseFloat(fixedFirstPercent);
    const random = getRandomWeights(allRaritiesYugioh, fixed);
    setWeights(random);
  };

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">
        Yu-Gi-Oh! Rarity Weights (Total = {total})
      </h3>

      <div className="flex items-center gap-2">
        <label>Fixed % for First Rarity:</label>
        <input
          type="number"
          step="0.01"
          min={0}
          max={100}
          value={fixedFirstPercent}
          onChange={(e) => handleFixedPercentChange(e.target.value)}
          className="border p-1 rounded w-24"
        />
        <button onClick={handleRandom} className="bg-blue-500 text-white px-2 py-1 rounded">
          Randomize
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {allRaritiesYugioh.map((rarity) => {
          const weight = weights[rarity] ?? 0;
          const percent = total > 0 ? ((weight / total) * 100).toFixed(2) : "0.00";
          return (
            <div key={rarity} className="flex justify-between items-center gap-2 border p-2 rounded">
              <div className="flex-1">{rarity}</div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={weight}
                  min={0}
                  max={9999}
                  step={1}
                  className="border p-1 w-24 text-right rounded"
                  onChange={(e) => onChangeWeight(rarity, +e.target.value)}
                />
                <span className="text-sm text-gray-500">{percent}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded">
        Save
      </button>
    </div>
  );
};

export default AllowedRaritiesYugiohWeight;
