// src/components/battle/EquipmentPanel.jsx
import React, { useState, useRef, useEffect } from "react";

const EquipmentPanel = ({ player }) => {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const wrapperRef = useRef(null); // ← QUAN TRỌNG: wrapper relative

  const onEquipClick = (slot) => {
    const item = player.equipment?.[slot];
    if (item) setSelectedSlot(slot);
  };

  const closeMenu = () => setSelectedSlot(null);

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
      minAttack: "Min Attack", maxAttack: "Max Attack",
      critChance: "Crit Chance", critDamage: "Crit Damage",
      lifeSteal: "Life Steal", maxHealth: "Max Health",
      regeneration: "Regeneration", dodge: "Dodge Chance",
      thorn: "Thorn", luck: "Luck", armor: "Armor",
    };
    return map[stat] || stat.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
  };

  const isPercentStat = (stat) => ["critChance","dodge","lifeSteal","critDamage","thorn"].includes(stat);

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

  const currentItem = selectedSlot ? player.equipment?.[selectedSlot] : null;

  return (
    <div ref={wrapperRef} className="relative"> {/* <<< QUAN TRỌNG */}

      <p className="font-semibold mt-6 mb-2 border-t border-gray-500 pt-3">
        Equipment
      </p>

      <div className="bg-game-secondary rounded-lg p-4">

        {/* Layout lớn */}
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

        {/* Layout nhỏ */}
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

      {/* MENU DESKTOP: HIỆN NGAY CẠNH BÊN PHẢI KHUNG EQUIPMENT */}
      {currentItem && !isMobile && (
        <div
          className="absolute z-50 top-1/2 -translate-y-1/2 left-full ml-1 w-80 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl p-6"
        >
          <div className="border-b border-gray-800 pb-4 mb-4">
            <p className="font-bold text-xl text-white">{currentItem.name}</p>
            <p className="text-sm text-gray-300">Lv.{currentItem.itemLevel}</p>
          </div>

          {currentItem.stats && Object.keys(currentItem.stats).length > 0 && (
            <div className="space-y-3 text-sm">
              {Object.entries(currentItem.stats).map(([stat, val]) => (
                <div key={stat} className="flex justify-between text-gray-300">
                  <span>{formatStatName(stat)}</span>
                  <span className="text-green-400 font-medium">
                    +{val}{isPercentStat(stat) ? "%" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MOBILE: DÍNH ĐÁY */}
      {currentItem && isMobile && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 bg-gradient-to-t from-black/95 to-transparent z-1000">
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl p-6 animate-in slide-in-from-bottom">
            <div className="border-b border-gray-800 pb-4 mb-4">
              <p className="font-bold text-xl text-white">{currentItem.name}</p>
              <p className="text-sm text-gray-300">Lv.{currentItem.itemLevel}</p>
            </div>

            {currentItem.stats && Object.keys(currentItem.stats).length > 0 && (
              <div className="space-y-3 text-sm">
                {Object.entries(currentItem.stats).map(([stat, val]) => (
                  <div key={stat} className="flex justify-between text-gray-300">
                    <span>{formatStatName(stat)}</span>
                    <span className="text-green-400 font-medium">
                      +{val}{isPercentStat(stat) ? "%" : ""}
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
        ${hasItem ? `${getRarityBackground(rarity)} bg-opacity-30 border-purple-400 hover:scale-110` : "border-gray-700"}
        ${hasItem ? "cursor-pointer" : "cursor-default"}
      `}
      title={hasItem ? `${item.name} • Lv.${item.itemLevel}` : "Empty slot"}
    >
      {hasItem ? (
        <>
          <div className={`absolute inset-0 ${getRarityBackground(rarity)} bg-opacity-40`} />
          <img src={item.icon} alt={slot} className="relative z-10 w-full h-full object-cover" />
        </>
      ) : (
        <span className="text-gray-600 text-3xl font-bold select-none">+</span>
      )}
    </button>
  );
};

export default EquipmentPanel;