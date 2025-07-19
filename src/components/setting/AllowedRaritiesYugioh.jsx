import React from "react";
import "./AdminSettings.css";

const AllowedRaritiesYugioh = ({
  rarities,
  percentages,
  onChangePercentage,
  fixedFirstPercent,
  setFixedFirstPercent,
  onRandom,
}) => {
  const reversed = [...rarities].reverse();

  // Tính max hợp lệ cho mỗi rarity (dựa vào các rarity ở trên nó)
  const getMax = (index) => {
    const above = reversed.slice(0, index);
    return 100 - above.reduce((sum, r) => sum + (percentages[r] || 0), 0);
  };

  return (
    <div className="section">
      <h3>Yu-Gi-Oh! Rarity Drop Rates (%)</h3>
      <div className="rarity-list">
        {reversed.map((rarity, index) => {
          const currentValue = percentages[rarity] || 0;
          const maxValue = getMax(index);

          return (
            <div key={rarity} className="flex items-center gap-4 min-h-[48px]">
              <label className="w-48 font-medium">{rarity}</label>
              <input
                type="number"
                value={currentValue}
                max={maxValue}
                min={0}
                step={0.01}
                className="border p-1 w-20 rounded text-right"
                onChange={(e) =>
                  onChangePercentage(
                    rarity,
                    Math.min(+e.target.value, maxValue)
                  )
                }
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-center items-center gap-3 mt-4">
        <button onClick={onRandom}>🎲 Random %</button>

        <div className="flex items-center gap-2">
          <label className="font-medium">Common:</label>
          <input
            type="number"
            step="1"
            min="0"
            max="100"
            value={fixedFirstPercent}
            onChange={(e) => setFixedFirstPercent(e.target.value)}
            className="border rounded py-1 w-24 text-right"
          />
          <label className="font-medium">%</label>
        </div>
      </div>
    </div>
  );
};

export default AllowedRaritiesYugioh;
