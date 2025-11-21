// src/components/battle/EquipmentPanel.jsx
import React from "react";

const EquipmentPanel = ({ player, onEquipClick }) => {
  const getEquipIcon = (slot) => {
    const item = player.equipment?.[slot];
    return item?.icon || null;
  };

  const getTooltip = (slot) => {
    const item = player.equipment?.[slot];
    if (!item) return "Empty slot";

    const stats = item.stats
      ? Object.entries(item.stats)
          .map(([key, value]) => `${key}: +${value}`)
          .join(" • ")
      : "";
    return `${item.name}${stats ? `\n${stats}` : ""}`.trim();
  };

  // Thêm nền theo rarity
  const getRarityBackground = (rarity = "common") => {
    const map = {
      common: "!bg-gray-500",
      uncommon: "!bg-green-500",
      rare: "!bg-blue-500",
      epic: "!bg-purple-500",
      legendary: "!bg-orange-500",
    };
    return map[rarity] || map.common;
  };

  return (
    <>
      <p className="font-semibold mt-6 mb-2 border-t border-gray-500 pt-3">
        Equipment
      </p>

      <div className="bg-game-secondary rounded-lg p-4">
        {/* MÀN HÌNH LỚN (>= 1024px) */}
        <div className="hidden lg:flex items-center justify-center gap-6">
          <div className="flex flex-col justify-center gap-4">
            <EquipSlot slot="weapon1" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
            <EquipSlot slot="weapon2" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
          </div>

          <div className="flex flex-col items-center gap-4">
            <EquipSlot slot="helmet" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
            <EquipSlot slot="armor" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />

            <div className="flex items-center gap-4">
              <EquipSlot slot="gloves" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
              <EquipSlot slot="belt" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
              <EquipSlot slot="boots" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4">
            <EquipSlot slot="necklace" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
            <EquipSlot slot="ring1" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
            <EquipSlot slot="ring2" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
          </div>
        </div>

        {/* MÀN HÌNH NHỎ (< 1024px) */}
        <div className="grid lg:hidden grid-cols-2 gap-x-8 gap-y-6 max-w-md mx-auto">
          <div className="flex flex-col items-center gap-4">
            <EquipSlot slot="helmet" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
            <EquipSlot slot="armor" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
            <EquipSlot slot="gloves" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
            <EquipSlot slot="belt" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
            <EquipSlot slot="boots" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />

            <div className="border-t border-gray-600 w-20 my-3" />

            <EquipSlot slot="weapon1" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
            <EquipSlot slot="weapon2" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
          </div>

          <div className="flex flex-col items-center gap-4">
            <EquipSlot slot="necklace" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
            <EquipSlot slot="ring1" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
            <EquipSlot slot="ring2" {...{ getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }} />
          </div>
        </div>
      </div>
    </>
  );
};

// Component con có thêm nền rarity
const EquipSlot = ({ slot, getEquipIcon, getTooltip, onEquipClick, getRarityBackground, player }) => {
  const item = player.equipment?.[slot];
  const icon = item?.icon || null;
  const hasItem = !!icon;
  const rarity = item?.rarity || "common";
  const bgClass = hasItem ? getRarityBackground(rarity) : "";

  return (
    <button
      onClick={() => onEquipClick?.(slot)}
      className={`
        relative w-14 h-10 sm:w-16 sm:h-12 rounded-lg border-2 overflow-hidden
        transition-all duration-300 flex items-center justify-center
        ${hasItem
          ? `${bgClass} bg-opacity-30 border-purple-400 hover:scale-110`
          : ""
        }
        ${!onEquipClick ? "cursor-default" : "cursor-pointer"}
      `}
      title={hasItem ? getTooltip(slot).replace(/\n/g, " • ") : "Empty slot"}
    >
      {hasItem ? (
        <>
          {/* Nền mờ theo rarity */}
          <div className={`absolute inset-0 ${bgClass} bg-opacity-40`} />
          <img src={icon} alt={slot} className="relative z-10 w-full h-full object-cover" />
        </>
      ) : (
        <span className="text-gray-600 text-3xl font-bold select-none">+</span>
      )}

      {hasItem && (
        <div className="absolute inset-0 rounded-lg pointer-events-none animate-pulse"></div>
      )}
    </button>
  );
};

export default EquipmentPanel;