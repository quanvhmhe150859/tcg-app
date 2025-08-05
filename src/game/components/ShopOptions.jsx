import React from "react";

export default function ShopOptions({
  items,
  onSelect,
  gold,
  onExit,
  boughtItems,
  handleReroll,
  rerollCost,
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-bold">Shop:</h3>
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(item)}
          disabled={gold < item.cost || boughtItems.includes(item.label)}
          className={`block w-full rounded px-3 py-1 ${
            gold < item.cost || boughtItems.includes(item.label)
              ? "opacity-75 !cursor-not-allowed"
              : ""
          }`}
        >
          {item.label} - 💰{item.cost}
        </button>
      ))}

      <button
        onClick={handleReroll}
        className={`flex-1 rounded px-3 py-1 ${
          gold < rerollCost ? "opacity-75 !cursor-not-allowed" : ""
        }`}
        disabled={gold < rerollCost}
      >
        Reroll ({rerollCost}g)
      </button>

      <button
        onClick={onExit}
        className="block w-full mt-4 bg-red-600 hover:bg-red-700 rounded px-3 py-2 text-center"
      >
        Exit Shop
      </button>
    </div>
  );
}
