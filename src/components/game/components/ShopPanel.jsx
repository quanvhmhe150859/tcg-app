import React from "react";
import { statIcons } from "../constants/stats";

const ShopPanel = ({
  shopOptions,
  boughtOptions,
  player,
  handlePurchase,
  rerollPrice,        // giá gốc (có thể tăng dần)
  handleReroll,
  handleExitShop,
}) => {
  // Tính giá reroll thực tế để hiển thị
  const isShopCleared = boughtOptions.length >= shopOptions.length && shopOptions.length > 0;
  const displayRerollPrice = isShopCleared ? 0 : rerollPrice;

  return (
    <div>
      <h2 className="font-semibold mt-4 mb-2">Shop:</h2>
      <div className="option-list-spacing space-y-2">
        {shopOptions.map((option, index) => {
          let icon = "";
          if (option.name.includes("Attack"))
            if (option.name.includes("Min")) icon = "🗡️";
            else icon = statIcons["Attack"]?.icon;
          else if (option.name.includes("Health"))
            if (option.name.includes("Current")) icon = "❤️‍🩹";
            else icon = statIcons["Health"]?.icon;
          else icon = statIcons[option.name]?.icon || "";

          const isBought = boughtOptions.includes(index);
          const canAfford = player.gold >= option.price;

          return (
            <button
              key={index}
              onClick={() => handlePurchase(option, index)}
              disabled={isBought || !canAfford}
              className={`w-full px-4 py-2 rounded text-white transition-all ${
                isBought || !canAfford
                  ? "opacity-50 cursor-not-allowed bg-gray-700"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              <span className="sm:inline hidden">{option.name}: </span>
              <span className="sm:hidden">{icon} </span>
              {option.format(option.value)} | {option.price} 💰
            </button>
          );
        })}

        {/* Nút Reroll – hiển thị giá 0 nếu mua hết */}
        <button
          onClick={handleReroll}
          disabled={player.gold < displayRerollPrice}
          className={`w-full px-4 py-2 mt-2 rounded text-white font-medium transition-all ${
            player.gold < displayRerollPrice
              ? "opacity-50 cursor-not-allowed bg-gray-700"
              : "bg-purple-600 hover:bg-purple-500"
          }`}
        >
          Reroll Shop | {displayRerollPrice} 💰
        </button>

        {/* Nút Exit */}
        <button
          onClick={handleExitShop}
          className="w-full px-4 py-2 mt-2 text-white rounded"
        >
          Exit Shop
        </button>
      </div>
    </div>
  );
};

export default ShopPanel;