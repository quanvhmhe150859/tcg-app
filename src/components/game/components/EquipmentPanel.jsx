// src/components/battle/EquipmentPanel.jsx
import React, { useState, useRef, useEffect } from "react";

const EquipmentPanel = ({ player }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isOpen, setIsOpen] = useState(true); // Mở mặc định, bạn có thể đổi thành false
  const wrapperRef = useRef(null);

  const onEquipClick = (slot) => {
    const item = player.equipment?.[slot];
    if (item) setSelectedSlot(slot);
  };

  const closeMenu = () => setSelectedSlot(null);
  const toggleOpen = () => setIsOpen(prev => !prev);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSelectedSlot(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatStatName = (stat) => {
    const map = {
      minAttack: "Min Attack",
      maxAttack: "Max Attack",
      critChance: "Crit Chance",
      critDamage: "Crit Damage",
      lifeSteal: "Life Steal",
      maxHealth: "Max Health",
      regeneration: "Regeneration",
      dodge: "Dodge Chance",
      thorn: "Thorn",
      luck: "Luck",
      armor: "Armor",
    };
    return (
      map[stat] ||
      stat.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
    );
  };

  const isPercentStat = (key) =>
    ["critChance", "dodge", "lifeSteal", "critDamage", "thorn"].includes(key);

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

  const getRarityTextColor = (rarity = "common") => {
    const map = {
      common: "text-gray-400",
      uncommon: "text-green-400",
      rare: "text-blue-400",
      epic: "text-purple-400",
      legendary: "text-orange-400",
    };
    return map[rarity] || "text-gray-400";
  };

  const currentItem = selectedSlot ? player.equipment?.[selectedSlot] : null;

  return (
    <div ref={wrapperRef} className="relative">
      {/* Nút Toggle Equipment */}
      <button
        onClick={toggleOpen}
        className="toggle-game-stats justify-center w-full flex items-center justify-between font-semibold hover:text-white transition-colors"
      >
        <span>{isOpen ? "➖" : "➕"} Equipment</span>
      </button>

      {/* Nội dung có thể thu gọn */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-200 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-game-secondary rounded-lg p-4">
          {/* Layout Desktop */}
          <div className="hidden lg:flex items-center justify-center gap-6">
            <div className="flex flex-col justify-center gap-4">
              <EquipSlot slot="weapon1" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              <EquipSlot slot="weapon2" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
            </div>
            <div className="flex flex-col items-center gap-4">
              <EquipSlot slot="helmet" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              <EquipSlot slot="armor" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              <div className="flex items-center gap-4">
                <EquipSlot slot="gloves" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
                <EquipSlot slot="belt" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
                <EquipSlot slot="boots" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4">
              <EquipSlot slot="necklace" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              <EquipSlot slot="ring1" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              <EquipSlot slot="ring2" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
            </div>
          </div>

          {/* Layout Mobile */}
          <div className="grid lg:hidden grid-cols-2 gap-x-8 gap-y-6 max-w-md mx-auto">
            <div className="flex flex-col items-center gap-4">
              <EquipSlot slot="helmet" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              <EquipSlot slot="armor" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              <EquipSlot slot="gloves" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              <EquipSlot slot="belt" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              <EquipSlot slot="boots" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              <div className="border-t border-gray-600 w-20 my-3" />
              <EquipSlot slot="weapon1" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              <EquipSlot slot="weapon2" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
            </div>
            <div className="flex flex-col items-center gap-4">
              <EquipSlot slot="necklace" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              <EquipSlot slot="ring1" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
              <EquipSlot slot="ring2" player={player} onEquipClick={onEquipClick} getRarityBackground={getRarityBackground} />
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip Desktop */}
      {currentItem && !isMobile && (
        <div className="eq-container absolute z-50 top-1/2 -translate-y-1/2 left-full ml-1 w-80 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl p-6">
          {/* ... giữ nguyên phần tooltip desktop */}
          <div className="border-b border-gray-800 pb-4 mb-4">
            <p className="eq-text font-bold text-xl text-white">{currentItem.name}</p>
            <p className="eq-stat-text text-sm">
              <span>Lv.{currentItem.itemLevel}</span>
              <span className="mx-2">•</span>
              <span className={`font-medium ${getRarityTextColor(currentItem.rarity)}`}>
                {currentItem.rarity.charAt(0).toUpperCase() + currentItem.r25arity.slice(1)}
              </span>
            </p>
          </div>
          {currentItem.affixes && currentItem.affixes.length > 0 && (
            <div className="space-y-2 text-sm">
              {currentItem.affixes.map((affix, idx) => (
                <div key={idx} className="eq-stat-text flex justify-between text-gray-300">
                  <span>{formatStatName(affix.key)}</span>
                  <span className="eq-stat-text-plus font-medium">
                    +{affix.value}{isPercentStat(affix.key) ? "%" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tooltip Mobile */}
      {currentItem && isMobile && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl p-6 animate-in slide-in-from-bottom">
            <div className="border-b border-gray-800 pb-4 mb-4">
              <p className="font-bold text-xl text-white">{currentItem.name}</p>
              <p className="text-sm">
                <span className="text-gray-400">Lv.{currentItem.itemLevel}</span>
                <span className="mx-2">•</span>
                <span className={`font-medium ${getRarityTextColor(currentItem.rarity)}`}>
                  {currentItem.rarity.charAt(0).toUpperCase() + currentItem.rarity.slice(1)}
                </span>
              </p>
            </div>
            {currentItem.affixes && currentItem.affixes.length > 0 && (
              <div className="space-y-3 text-sm">
                {currentItem.affixes.map((affix, idx) => (
                  <div key={idx} className="flex justify-between text-gray-300">
                    <span>{formatStatName(affix.key)}</span>
                    <span className="text-green-400 font-medium">
                      +{affix.value}{isPercentStat(affix.key) ? "%" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={closeMenu}
              className="w-full mt-6 py-4 rounded-lg bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold text-lg shadow-lg transition active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// EquipSlot giữ nguyên 100%
const EquipSlot = ({ slot, player, onEquipClick, getRarityBackground }) => {
  const item = player.equipment?.[slot];
  const hasItem = !!item;
  const rarity = item?.rarity || "common";

  return (
    <button
      onClick={() => onEquipClick?.(slot)}
      className={`
        relative w-14 h-10 sm:w-16 sm:h-12 rounded-lg border-2 overflow-hidden
        transition-all duration-300 flex items-center justify-center
        ${hasItem
          ? `${getRarityBackground(rarity)} border-opacity-60 hover:scale-110 shadow-lg`
          : "border-gray-700 bg-gray-800"
        }
        ${hasItem ? "cursor-pointer" : "cursor-default"}
      `}
      title={hasItem ? `${item.name} • Lv.${item.itemLevel} • ${item.rarity}` : "Empty slot"}
    >
      {hasItem ? (
        <>
          <div className={`absolute inset-0 ${getRarityBackground(rarity)} opacity-50`} />
          <img src={item.icon} alt={slot} className="relative z-10 w-full h-full object-cover" />
        </>
      ) : (
        <span className="text-gray-600 text-3xl font-bold select-none">+</span>
      )}
    </button>
  );
};

export default EquipmentPanel;