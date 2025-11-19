import React from "react";
import { statIcons } from "../constants/stats"; // 🔹 Import stat icons

const UpgradePanel = ({ isRareUpgrade, upgradeOptions, handleUpgrade }) => {
  return (
    <div className="mt-4">
      <h2 className="font-semibold">
        {isRareUpgrade ? "Choose a Rare Upgrade:" : "Choose an Upgrade:"}
      </h2>
      <div className="option-list-spacing space-y-2">
        {upgradeOptions.map((option, index) => {
          let icon = "";
          // Xử lý icon giống hệt ShopPanel
          if (option.name.includes("Attack"))
            if (option.name.includes("Min")) icon = "🗡️";
            else icon = statIcons["Attack"]?.icon;
          else if (option.name.includes("Health"))
            if (option.name.includes("Current")) icon = "❤️‍🩹";
            else icon = statIcons["Health"]?.icon;
          else icon = statIcons[option.name]?.icon || "";

          return (
            <button
              key={index}
              onClick={() => handleUpgrade(option)}
              className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
            >
              {/* 🔹 Hiển thị tên trên màn lớn, icon trên màn nhỏ */}
              <span className="sm:inline hidden">{option.name}: </span>
              <span className="sm:hidden">{icon} </span>
              {option.format(option.value)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default UpgradePanel;