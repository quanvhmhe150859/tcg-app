// src/components/battle/InventoryPanel.jsx
import React, { useState, useRef, useEffect } from "react";

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
  return map[stat] || stat.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
};

const formatDiff = (stat, diff) => {
  const percentStats = ["critChance", "dodge", "lifeSteal", "critDamage", "thorn"];
  const value = Math.abs(diff);
  const formatted = percentStats.includes(stat) ? `${value}%` : value;
  return diff > 0 ? `+${formatted}` : `-${formatted}`;
};

const InventoryPanel = ({ player, onEquipItem, onDestroyItem }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const wrapperRef = useRef(null);

  const equippedIds = new Set(
    Object.values(player?.equipment || {})
      .filter(Boolean)
      .map((eq) => eq.id)
  );

  const inventoryItems = (player?.inventory || []).filter(
    (item) => item.slot && item.icon && !equippedIds.has(item.id)
  );

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

  const getSlotDisplayName = (slot) => {
    const map = {
      weapon1: "Weapon 1", weapon2: "Weapon 2",
      helmet: "Helmet", armor: "Armor", gloves: "Gloves",
      belt: "Belt", boots: "Boots", necklace: "Necklace",
      ring1: "Ring 1", ring2: "Ring 2",
    };
    return map[slot] || slot;
  };

  const getAvailableSlots = (item) => {
    const key = item.slot.replace(/1|2$/, "");
    const dual = { weapon: ["weapon1", "weapon2"], ring: ["ring1", "ring2"] };
    return dual[key] || [item.slot];
  };

  const calculateDiffs = (item) => {
    const panels = [];
    for (const slot of getAvailableSlots(item)) {
      const equipped = player.equipment?.[slot];
      if (!equipped) continue;

      const newStats = item.stats || {};
      const oldStats = equipped.stats || {};

      const diffs = Object.keys({ ...oldStats, ...newStats })
        .map((stat) => {
          const diff = (newStats[stat] ?? 0) - (oldStats[stat] ?? 0);
          return diff !== 0 ? { stat, diff } : null;
        })
        .filter(Boolean);

      if (diffs.length > 0) panels.push({ slot, diffs });
    }
    return panels.length > 0 ? panels : null;
  };

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    setSelectedItem(selectedItem?.id === item.id ? null : item);
  };

  const closeMenu = () => setSelectedItem(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSelectedItem(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const diffPanels = selectedItem ? calculateDiffs(selectedItem) : null;
  const availableSlots = selectedItem ? getAvailableSlots(selectedItem) : [];

  return (
    <div ref={wrapperRef} className="relative">

      <p className="font-semibold mt-6 mb-2 border-t border-gray-500 pt-3">
        Inventory ({inventoryItems.length}/10)
      </p>

      <div className="bg-game-secondary rounded-lg p-4 h-[98px]">
        {inventoryItems.length === 0 ? (
          <div className="text-center text-gray-500 italic py-6">
            Inventory is empty
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <div className="flex gap-3 py-2 min-w-max ml-1 mr-1">
              {inventoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={(e) => handleItemClick(e, item)}
                  className={`relative flex-shrink-0 w-16 h-12 rounded-lg border-4 overflow-hidden transition-all duration-300 hover:scale-110 ${getRarityBackground(
                    item.rarity
                  )} ${selectedItem?.id === item.id ? "ring-4 ring-cyan-400 ring-inset" : ""}`}
                  title={item.name}
                >
                  <img src={item.icon} alt={item.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MOBILE: NÚT EQUIP/REPLACE XẾP DỌC */}
      {isMobile && selectedItem && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-3 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-1000">
          {diffPanels?.map((panel, idx) => (
            <div key={idx} className="bg-gray-950 border-2 border-cyan-600 rounded-lg pl-4 pr-4 shadow-2xl pointer-events-none animate-in slide-in-from-bottom">
              <div className="text-cyan-400 text-xs font-bold mb-2 border-b border-cyan-900 pb-1">
                vs {getSlotDisplayName(panel.slot)}
              </div>
              <div className="text-sm font-medium">
                {panel.diffs.map(({ stat, diff }) => (
                  <div key={stat} className="flex justify-between">
                    <span className="text-gray-400">{formatStatName(stat)}</span>
                    <span className={diff > 0 ? "text-green-400" : "text-red-400"}>
                      {formatDiff(stat, diff)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl animate-in slide-in-from-bottom">
            <div className="pl-5 pr-5 border-b border-gray-800">
              <p className="font-bold text-lg text-white">{selectedItem.name}</p>
              <div className="text-sm text-gray-300">Lv.{selectedItem.itemLevel}</div>
            </div>

            {selectedItem.stats && Object.keys(selectedItem.stats).length > 0 && (
              <div className="pl-5 pr-5 text-sm border-b border-gray-800">
                {Object.entries(selectedItem.stats).map(([stat, val]) => (
                  <div key={stat} className="flex justify-between text-gray-300">
                    <span>{formatStatName(stat)}</span>
                    <span className="text-green-400 font-medium">
                      +{val}{["critChance","dodge","lifeSteal","critDamage","thorn"].includes(stat) ? "%" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 space-y-3">
              {/* NÚT EQUIP/REPLACE - XẾP DỌC */}
              {availableSlots.map((slot) => {
                const equipped = player.equipment?.[slot];
                return (
                  <button
                    key={slot}
                    onClick={() => {
                      onEquipItem?.(selectedItem, slot);
                      setSelectedItem(null);
                    }}
                    className="w-full px-6 py-5 rounded-lg bg-gradient-to-b from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-lg shadow-lg transition transform active:scale-95"
                  >
                    {equipped ? `Replace ${getSlotDisplayName(slot)}` : `Equip to ${getSlotDisplayName(slot)}`}
                  </button>
                );
              })}

              {/* Destroy + Cancel - XẾP NGANG */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onDestroyItem?.(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="px-5 py-5 rounded-lg bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg shadow-lg transition transform active:scale-95"
                >
                  Destroy
                </button>
                <button
                  onClick={closeMenu}
                  className="px-5 py-5 rounded-lg bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold text-lg shadow-lg transition transform active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP: GIỮ NGUYÊN STYLE ĐẸP */}
      {!isMobile && selectedItem && (
        <>
          <div className="absolute z-50 mt-3 mx-4 left-0 max-w-md bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl" style={{ top: "100%" }}>
            <div className="p-5 border-b border-gray-800">
              <p className="font-bold text-lg text-white">{selectedItem.name}</p>
              <div className="text-sm text-gray-300">Lv.{selectedItem.itemLevel}</div>
            </div>

            {selectedItem.stats && Object.keys(selectedItem.stats).length > 0 && (
              <div className="p-5 space-y-1 text-sm border-b border-gray-800">
                {Object.entries(selectedItem.stats).map(([stat, val]) => (
                  <div key={stat} className="flex justify-between text-gray-300">
                    <span>{formatStatName(stat)}</span>
                    <span className="text-green-400 font-medium">
                      +{val}{["critChance","dodge","lifeSteal","critDamage","thorn"].includes(stat) ? "%" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-5 space-y-3">
              {availableSlots.map((slot) => {
                const equipped = player.equipment?.[slot];
                return (
                  <button
                    key={slot}
                    onClick={() => {
                      onEquipItem?.(selectedItem, slot);
                      setSelectedItem(null);
                    }}
                    className="w-full px-6 py-4 rounded-lg bg-gradient-to-b from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-lg shadow-lg transition transform hover:scale-105"
                  >
                    {equipped ? `Replace ${getSlotDisplayName(slot)}` : `Equip to ${getSlotDisplayName(slot)}`}
                  </button>
                );
              })}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onDestroyItem?.(selectedItem);
                    setSelectedItem(null);
                  }}
                  className="flex-1 px-6 py-4 rounded-lg bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg shadow-lg transition transform hover:scale-105"
                >
                  Destroy Item
                </button>
              </div>
            </div>
          </div>

          {diffPanels && (
            <div className="absolute z-50 space-y-4" style={{ top: "calc(100% + 12px)", left: "100%", marginLeft: "16px", width: "280px" }}>
              {diffPanels.map((panel, idx) => (
                <div key={idx} className="bg-gray-950 border-2 border-cyan-600 rounded-lg p-4 shadow-2xl pointer-events-none">
                  <div className="text-cyan-400 text-xs font-bold mb-2 border-b border-cyan-900 pb-1">
                    vs {getSlotDisplayName(panel.slot)}
                  </div>
                  <div className="space-y-2 text-sm font-medium">
                    {panel.diffs.map(({ stat, diff }) => (
                      <div key={stat} className="flex justify-between">
                        <span className="text-gray-400">{formatStatName(stat)}</span>
                        <span className={diff > 0 ? "text-green-400" : "text-red-400"}>
                          {formatDiff(stat, diff)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InventoryPanel;