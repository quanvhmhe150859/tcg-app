// src/components/battle/InventoryPanel.jsx
import React, { useState, useRef, useEffect } from "react";

// ĐẶT Ở NGOÀI COMPONENT ĐỂ TẤT CẢ CÁC PHẦN ĐỀU DÙNG ĐƯỢC
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
  return map[stat] || stat.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
};

const formatDiff = (stat, diff) => {
  const percentStats = ["critChance", "dodge", "lifeSteal", "critDamage", "thorn"];
  const value = Math.abs(diff);
  const formatted = percentStats.includes(stat) ? `${value}%` : value;
  return diff > 0 ? `+${formatted}` : `-${formatted}`;
};

const STAT_ORDER = [
  "maxHealth", "regeneration", "armor",
  "minAttack", "maxAttack",
  "critChance", "critDamage", "lifeSteal",
  "dodge", "luck", "thorn",
];

const InventoryPanel = ({ player, onEquipItem, onDestroyItem }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [position, setPosition] = useState("down");
  const wrapperRef = useRef(null);

  const equippedIds = new Set(
    Object.values(player?.equipment || {})
      .filter(Boolean)
      .map(eq => eq.id)
  );

  const inventoryItems = (player?.inventory || []).filter(
    item => item.slot && item.icon && !equippedIds.has(item.id)
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

  // BẢNG SO SÁNH – ĐÃ FIX HOÀN TOÀN (hỗ trợ Two-Handed + tên chỉ số đẹp)
  const calculateDiffs = (item) => {
    const panels = [];
    const newStats = item.stats || {};
    const isTwoHanded = item.type === "twoHanded";

    if (isTwoHanded) {
      const w1 = player.equipment?.weapon1;
      const w2 = player.equipment?.weapon2;
      if (!w1 && !w2) return null;

      const oldTotalStats = {};
      [w1, w2].forEach(eq => {
        if (eq?.stats) {
          Object.entries(eq.stats).forEach(([k, v]) => {
            oldTotalStats[k] = (oldTotalStats[k] || 0) + v;
          });
        }
      });

      const diffMap = {};
      STAT_ORDER.forEach(stat => {
        const diff = (newStats[stat] ?? 0) - (oldTotalStats[stat] ?? 0);
        if (diff !== 0) diffMap[stat] = diff;
      });

      [...new Set([...Object.keys(newStats), ...Object.keys(oldTotalStats)])].forEach(stat => {
        if (!STAT_ORDER.includes(stat)) {
          const diff = (newStats[stat] ?? 0) - (oldTotalStats[stat] ?? 0);
          if (diff !== 0 && !(stat in diffMap)) diffMap[stat] = diff;
        }
      });

      const diffs = Object.keys(diffMap).map(stat => ({ stat, diff: diffMap[stat] }));
      if (diffs.length > 0) {
        panels.push({ slot: "both", label: "vs Both Weapons", diffs });
      }
    } else {
      for (const slot of getAvailableSlots(item)) {
        const equipped = player.equipment?.[slot];
        if (!equipped) continue;

        const oldStats = equipped.stats || {};
        const diffMap = {};

        STAT_ORDER.forEach(stat => {
          const diff = (newStats[stat] ?? 0) - (oldStats[stat] ?? 0);
          if (diff !== 0) diffMap[stat] = diff;
        });

        [...new Set([...Object.keys(newStats), ...Object.keys(oldStats)])].forEach(stat => {
          if (!STAT_ORDER.includes(stat)) {
            const diff = (newStats[stat] ?? 0) - (oldStats[stat] ?? 0);
            if (diff !== 0 && !(stat in diffMap)) diffMap[stat] = diff;
          }
        });

        const diffs = Object.keys(diffMap).map(stat => ({ stat, diff: diffMap[stat] }));
        if (diffs.length > 0) {
          panels.push({ slot, label: `vs ${getSlotDisplayName(slot)}`, diffs });
        }
      }
    }

    return panels.length > 0 ? panels : null;
  };

  const handleItemClick = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setPosition(spaceBelow < 425 ? "up" : "down");
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
  const isPercentStat = (key) => ["critChance", "dodge", "lifeSteal", "critDamage", "thorn"].includes(key);

  return (
    <div ref={wrapperRef} className="relative">
      <p className="font-semibold py-2 px-4">
        Inventory ({inventoryItems.length}/10)
      </p>

      <div className="bg-game-secondary rounded-lg p-4 h-[98px]">
        {inventoryItems.length === 0 ? (
          <div className="text-center text-gray-500 italic py-6">Inventory is empty</div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <div className="flex gap-3 py-2 min-w-max ml-1 mr-1">
              {inventoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={(e) => handleItemClick(e, item)}
                  className={`relative flex-shrink-0 w-16 h-12 rounded-lg border-4 overflow-hidden transition-all duration-300 hover:scale-110 ${getRarityBackground(item.rarity)} ${selectedItem?.id === item.id ? "ring-2 ring-cyan-400 ring-inset" : ""}`}
                  title={item.name}
                >
                  <img src={item.icon} alt={item.name} className="w-full h-full object-cover" />
                  {item.type === "twoHanded" && (
                    <div className="absolute bottom-0 right-0 bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white rounded-tl">2H</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MOBILE */}
      {isMobile && selectedItem && (
        <div className="fixed inset-x-0 bottom-0 z-1003 flex flex-col gap-3 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
          {diffPanels?.map((panel, idx) => (
            <div key={idx} className="bg-gray-950 border-2 border-cyan-600 rounded-lg p-4 shadow-2xl animate-in slide-in-from-bottom">
              <div className="text-cyan-400 text-xs font-bold mb-2 border-b border-cyan-900 pb-1">
                {panel.label}
              </div>
              <div className="text-sm font-medium space-y-1">
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

          {/* Item info + buttons */}
          <div className="bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl animate-in slide-in-from-bottom">
            <div className="px-5 pt-4 border-b border-gray-800">
              <p className="font-bold text-lg text-white">{selectedItem.name}</p>
              <div className="text-sm text-gray-300 pb-4">
                Lv.{selectedItem.itemLevel} • {selectedItem.rarity.charAt(0).toUpperCase() + selectedItem.rarity.slice(1)}
                {selectedItem.type === "twoHanded" && " • Two-Handed"}
              </div>
            </div>

            {selectedItem.affixes?.length > 0 && (
              <div className="px-5 py-3 space-y-1 text-sm border-b border-gray-800">
                {selectedItem.affixes.map((affix, idx) => (
                  <div key={idx} className="flex justify-between text-gray-300">
                    <span>{formatStatName(affix.key)}</span>
                    <span className="text-green-400 font-medium">
                      +{affix.value}{isPercentStat(affix.key) ? "%" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 space-y-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => { onEquipItem?.(selectedItem, slot); setSelectedItem(null); }}
                  className="w-full px-6 py-5 rounded-lg bg-gradient-to-b from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-lg shadow-lg transition active:scale-95"
                >
                  {player.equipment?.[slot]
                    ? `Replace ${getSlotDisplayName(slot)}`
                    : `Equip to ${getSlotDisplayName(slot)}`}
                </button>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => { onDestroyItem?.(selectedItem); setSelectedItem(null); }}
                  className="px-5 py-5 rounded-lg bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg shadow-lg transition active:scale-95">
                  Destroy
                </button>
                <button onClick={closeMenu}
                  className="px-5 py-5 rounded-lg bg-gradient-to-b from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold text-lg shadow-lg transition active:scale-95">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP */}
      {!isMobile && selectedItem && (
        <>
          {/* Tooltip chính */}
          <div className={`eq-container absolute z-301 left-0 max-w-md bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl ${position === "down" ? "top-full" : "bottom-full"}`}>
            <div className="p-5 border-b border-gray-800">
              <p className="font-bold text-lg text-white">{selectedItem.name}</p>
              <p className="text-sm text-gray-300">
                Lv.{selectedItem.itemLevel} •{" "}
                <span className={getRarityTextColor(selectedItem.rarity)}>
                  {selectedItem.rarity.charAt(0).toUpperCase() + selectedItem.rarity.slice(1)}
                </span>
                {selectedItem.type === "twoHanded" && " • Two-Handed"}
              </p>
            </div>

            {selectedItem.affixes?.length > 0 && (
              <div className="p-5 space-y-1 text-sm">
                {selectedItem.affixes.map((affix, idx) => (
                  <div key={idx} className="flex justify-between text-gray-300">
                    <span>{formatStatName(affix.key)}</span>
                    <span className="text-green-400 font-medium">
                      +{affix.value}{isPercentStat(affix.key) ? "%" : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-5 space-y-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => { onEquipItem?.(selectedItem, slot); setSelectedItem(null); }}
                  className="w-full px-6 py-4 rounded-lg bg-gradient-to-b from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold text-lg shadow-lg transition hover:scale-105"
                >
                  {player.equipment?.[slot]
                    ? `Replace ${getSlotDisplayName(slot)}`
                    : `Equip to ${getSlotDisplayName(slot)}`}
                </button>
              ))}

              <button
                onClick={() => { onDestroyItem?.(selectedItem); setSelectedItem(null); }}
                className="w-full px-6 py-4 rounded-lg bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-lg shadow-lg transition hover:scale-105"
              >
                Destroy Item
              </button>
            </div>
          </div>

          {/* BẢNG SO SÁNH BÊN PHẢI – ĐÃ FIX TÊN CHỈ SỐ */}
          {diffPanels && (
            <div className={`absolute z-50 space-y-4 ${position === "down" ? "top-full" : "bottom-full"}`} style={{ left: "100%", marginLeft: "16px", width: "280px" }}>
              {diffPanels.map((panel, idx) => (
                <div key={idx} className="bg-gray-950 border-2 border-cyan-600 rounded-lg p-4 shadow-2xl">
                  <div className="text-cyan-400 text-xs font-bold mb-2 border-b border-cyan-900 pb-1">
                    {panel.label}
                  </div>
                  <div className="space-y-2 text-sm">
                    {panel.diffs.map(({ stat, diff }) => (
                      <div key={stat} className="flex justify-between font-medium">
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