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
  return (
    map[stat] ||
    stat.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())
  );
};

const formatDiff = (stat, diff) => {
  const percentStats = [
    "critChance",
    "dodge",
    "lifeSteal",
    "critDamage",
  ];
  const value = Math.abs(diff);
  const formatted = percentStats.includes(stat) ? `${value}%` : value;
  return diff > 0 ? `+${formatted}` : `-${formatted}`;
};

// THỨ TỰ ƯU TIÊN HIỂN THỊ TRONG BẢNG SO SÁNH
const STAT_ORDER = [
  "maxHealth",
  "regeneration",
  "armor",
  "minAttack",
  "maxAttack",
  "critChance",
  "critDamage",
  "lifeSteal",
  "dodge",
  "luck",
  "thorn",
];

const InventoryPanel = ({ player, onEquipItem, onDestroyItem }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const wrapperRef = useRef(null);

  const [position, setPosition] = useState("down");

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
      weapon1: "Weapon 1",
      weapon2: "Weapon 2",
      helmet: "Helmet",
      armor: "Armor",
      gloves: "Gloves",
      belt: "Belt",
      boots: "Boots",
      necklace: "Necklace",
      ring1: "Ring 1",
      ring2: "Ring 2",
    };
    return map[slot] || slot;
  };

  const getAvailableSlots = (item) => {
    const key = item.slot.replace(/1|2$/, "");
    const dual = { weapon: ["weapon1", "weapon2"], ring: ["ring1", "ring2"] };
    return dual[key] || [item.slot];
  };

  // BẢNG SO SÁNH - SẮP XẾP THEO THỨ TỰ ĐẸP
  const calculateDiffs = (item) => {
    const panels = [];
    for (const slot of getAvailableSlots(item)) {
      const equipped = player.equipment?.[slot];
      if (!equipped) continue;

      const newStats = item.stats || {};
      const oldStats = equipped.stats || {};
      const diffMap = {};

      // Ưu tiên theo thứ tự đã định
      STAT_ORDER.forEach((stat) => {
        const newVal = newStats[stat] ?? 0;
        const oldVal = oldStats[stat] ?? 0;
        const diff = newVal - oldVal;
        if (diff !== 0) {
          diffMap[stat] = diff;
        }
      });

      // Các stat còn lại (nếu có stat mới trong tương lai)
      [
        ...new Set([...Object.keys(newStats), ...Object.keys(oldStats)]),
      ].forEach((stat) => {
        if (!STAT_ORDER.includes(stat)) {
          const newVal = newStats[stat] ?? 0;
          const oldVal = oldStats[stat] ?? 0;
          const diff = newVal - oldVal;
          if (diff !== 0 && !(stat in diffMap)) {
            diffMap[stat] = diff;
          }
        }
      });

      const diffs = Object.keys(diffMap).map((stat) => ({
        stat,
        diff: diffMap[stat],
      }));

      if (diffs.length > 0) {
        panels.push({ slot, diffs });
      }
    }
    return panels.length > 0 ? panels : null;
  };

  const handleItemClick = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();

    // Kiểm tra khoảng không phía dưới nút
    const spaceBelow = window.innerHeight - rect.bottom;

    if (spaceBelow < 425) {
      setPosition("up"); // thiếu không gian → hiển thị lên trên
    } else {
      setPosition("down");
    }

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

  const isPercentStat = (key) =>
    ["critChance", "dodge", "lifeSteal", "critDamage"].includes(key);

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

  return (
    <div ref={wrapperRef} className="relative">
      <p className="font-semibold py-2 px-4">
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
                  )} ${
                    selectedItem?.id === item.id
                      ? "ring-2 ring-cyan-400 ring-inset"
                      : ""
                  }`}
                  title={item.name}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MOBILE: Tooltip dính đáy */}
      {isMobile && selectedItem && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col gap-3 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
          {/* Bảng so sánh */}
          {diffPanels?.map((panel, idx) => (
            <div
              key={idx}
              className="bg-gray-950 border-2 border-cyan-600 rounded-lg pl-4 pr-4 shadow-2xl pointer-events-none animate-in slide-in-from-bottom"
            >
              <div className="text-cyan-400 text-xs font-bold mb-2 border-b border-cyan-900 pb-1">
                vs {getSlotDisplayName(panel.slot)}
              </div>
              <div className="text-sm font-medium">
                {panel.diffs.map(({ stat, diff }) => (
                  <div key={stat} className="flex justify-between">
                    <span className="text-gray-400">
                      {formatStatName(stat)}
                    </span>
                    <span
                      className={diff > 0 ? "text-green-400" : "text-red-400"}
                    >
                      {formatDiff(stat, diff)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Thông tin item */}
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl animate-in slide-in-from-bottom">
            <div className="pl-5 pr-5 pt-4 border-b border-gray-800">
              <p className="font-bold text-lg text-white">
                {selectedItem.name}
              </p>
              <div className="text-sm text-gray-300">
                Lv.{selectedItem.itemLevel} • {selectedItem.rarity}
              </div>
            </div>

            {/* Affixes - từng dòng riêng biệt */}
            {selectedItem.affixes && selectedItem.affixes.length > 0 && (
              <div className="px-5 py-3 space-y-1 text-sm border-b border-gray-800">
                {selectedItem.affixes.map((affix, idx) => (
                  <div key={idx} className="flex justify-between text-gray-300">
                    <span>{formatStatName(affix.key)}</span>
                    <span className="text-green-400 font-medium">
                      +{affix.value}
                      {isPercentStat(affix.key) ? "%" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 space-y-3">
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
                    {equipped
                      ? `Replace ${getSlotDisplayName(slot)}`
                      : `Equip to ${getSlotDisplayName(slot)}`}
                  </button>
                );
              })}

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

      {/* DESKTOP: Tooltip đẹp */}
      {!isMobile && selectedItem && (
        <>
          <div
            className={`eq-container absolute z-301 mx-4 left-0 max-w-md bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl 
               ${position === "down" ? "top-full" : "bottom-full"}`}
            // style={{ top: "100%" }}
          >
            <div className="eq-header p-5 border-b border-gray-800">
              <p className="eq-text font-bold text-lg">
                {selectedItem.name}
              </p>
              <p className="eq-stat-text text-sm">
                <span className="">
                  Lv.{selectedItem.itemLevel}
                </span>
                <span className="mx-2">•</span>
                <span
                  className={`font-medium ${getRarityTextColor(
                    selectedItem.rarity
                  )}`}
                >
                  {selectedItem.rarity.charAt(0).toUpperCase() +
                    selectedItem.rarity.slice(1)}
                </span>
              </p>
            </div>

            {selectedItem.affixes && selectedItem.affixes.length > 0 && (
              <div className="eq-header p-5 space-y-1 text-sm">
                {selectedItem.affixes.map((affix, idx) => (
                  <div key={idx} className="eq-stat-text flex justify-between">
                    <span>{formatStatName(affix.key)}</span>
                    <span className="eq-stat-text-plus font-medium">
                      +{affix.value}
                      {isPercentStat(affix.key) ? "%" : ""}
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
                    {equipped
                      ? `Replace ${getSlotDisplayName(slot)}`
                      : `Equip to ${getSlotDisplayName(slot)}`}
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

          {/* Bảng so sánh bên phải */}
          {diffPanels && (
            <div
              className={`absolute z-50 space-y-4 ${
                position === "down" ? "top-full" : "bottom-full"
              }`}
              style={{
                // top: "calc(100% + 12px)",
                left: "100%",
                marginLeft: "16px",
                width: "280px",
              }}
            >
              {diffPanels.map((panel, idx) => (
                <div
                  key={idx}
                  className="eq-container bg-gray-950 border-2 border-cyan-600 rounded-lg p-4 shadow-2xl pointer-events-none"
                >
                  <div className="eq-header text-cyan-400 text-xs font-bold mb-2 border-b border-cyan-900 pb-1">
                    vs {getSlotDisplayName(panel.slot)}
                  </div>
                  <div className="space-y-2 text-sm font-medium">
                    {panel.diffs.map(({ stat, diff }) => (
                      <div key={stat} className="flex justify-between">
                        <span className="eq-stat-text">
                          {formatStatName(stat)}
                        </span>
                        <span
                          className={
                            diff > 0
                              ? "eq-stat-text-plus"
                              : "eq-stat-text-minus"
                          }
                        >
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
