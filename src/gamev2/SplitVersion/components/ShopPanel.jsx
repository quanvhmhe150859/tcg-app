import React from "react";

const ShopPanel = ({ shopOptions, boughtOptions, player, handlePurchase, rerollPrice, handleReroll, handleExitShop }) => {
  return (
    <div className="mb-4">
      <h2 className="font-semibold">Shop:</h2>
      <div className="space-y-2">
        {shopOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => handlePurchase(option, index)}
            className={`w-full px-4 py-2 rounded text-white ${
              boughtOptions.includes(index) || player.gold < option.price
                ? "bg-gray-500 opacity-50 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {option.name}: {option.format(option.value)} | Cost: {option.price} gold
          </button>
        ))}
        <button
          onClick={handleReroll}
          className={`w-full px-4 py-2 mt-2 rounded text-white ${
            player.gold < rerollPrice
              ? "bg-gray-500 opacity-50 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
        >
          Reroll Shop | Cost: {rerollPrice} gold
        </button>
        <button
          onClick={handleExitShop}
          className="w-full px-4 py-2 mt-2 bg-green-500 hover:bg-green-600 text-white rounded"
        >
          Exit Shop
        </button>
      </div>
    </div>
  );
};

export default ShopPanel;