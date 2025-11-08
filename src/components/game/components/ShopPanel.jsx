import React from "react";
import { statIcons } from "../constants/stats"; // 🔹 Import stat icons

const ShopPanel = ({
  shopOptions,
  boughtOptions,
  player,
  handlePurchase,
  rerollPrice,
  handleReroll,
  handleExitShop,
}) => {
  return (
    <div>
      <h2 className="font-semibold mt-4 mb-2">Shop:</h2>
      <div className="space-y-2">
        {shopOptions.map((option, index) => {
          let icon = "";
          // Lấy icon nếu có trong statIcons, nếu không thì bỏ trống
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
              onClick={() => handlePurchase(option, index)}
              className={`w-full px-4 py-2 rounded text-white ${
                boughtOptions.includes(index) || player.gold < option.price
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {/* 🔹 Nếu màn hình to → hiện tên, nhỏ → hiện icon */}
              <span className="sm:inline hidden">{option.name}: </span>
              <span className="sm:hidden">{icon} </span>
              {option.format(option.value)} | {option.price} 💰
            </button>
          );
        })}

        {/* Nút Reroll */}
        <button
          onClick={handleReroll}
          className={`w-full px-4 py-2 mt-2 rounded text-white ${
            player.gold < rerollPrice ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span>Reroll Shop</span> | {rerollPrice} 💰
        </button>

        {/* Nút Exit */}
        <button
          onClick={handleExitShop}
          className="w-full px-4 py-2 mt-2 text-white rounded"
        >
          <span>Exit Shop</span>
        </button>
      </div>
    </div>
  );
};

export default ShopPanel;
