import React from "react";

const UpgradePanel = ({ isRareUpgrade, upgradeOptions, handleUpgrade }) => {
  return (
    <div className="mb-4">
      <h2 className="font-semibold">
        {isRareUpgrade ? "Choose a Rare Upgrade:" : "Choose an Upgrade:"}
      </h2>
      <div className="space-y-2">
        {upgradeOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handleUpgrade(option)}
            className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
          >
            {option.name}: {option.format(option.value)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UpgradePanel;