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

// Format đúng: chỉ thêm % khi cần, không thừa dấu +
const formatDiff = (stat, diff) => {
  const percentStats = [
    "critChance",
    "dodge",
    "lifeSteal",
    "critDamage",
    "thorn",
  ];
  const value = Math.abs(diff);
  const formatted = percentStats.includes(stat) ? `${value}%` : value;
  return diff > 0 ? `+${formatted}` : `-${formatted}`;
};

const InventoryPanel = ({ player, onEquipItem, onDestroyItem }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [calculatedDiffPanels, setCalculatedDiffPanels] = useState(null); // đổi tên cho rõ
  const menuRef = useRef(null);

  const equippedIds = new Set(
    Object.values(player?.equipment || {})
      .filter(Boolean)
      .map(eq => eq.id)
  );

  const inventoryItems = (player?.inventory || []).filter(
    item => item.slot && item.icon && !equippedIds.has(item.id)
  );

  useEffect(() => {
    const handleClickOutside = e => {
      if (
        (menuRef.current && !menuRef.current.contains(e.target))
      ) {
        setContextMenu(null);
        setCalculatedDiffPanels(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    const menuX = rect.right + 12;
    const menuY = rect.top;

    setContextMenu({ item, x: menuX, y: menuY });
    setCalculatedDiffPanels(null);

    const availableSlots = getAvailableSlots(item);
    const tempPanels = [];

    availableSlots.forEach((slot) => {
      const equippedItem = player.equipment?.[slot];
      if (!equippedItem) return;

      const newStats = item.stats || {};
      const oldStats = equippedItem.stats || {};

      const diffs = Object.keys({ ...oldStats, ...newStats })
        .map(stat => {
          const oldVal = oldStats[stat] ?? 0;
          const newVal = newStats[stat] ?? 0;
          const diff = newVal - oldVal;
          return diff !== 0 ? { stat, diff } : null;
        })
        .filter(Boolean);

      if (diffs.length > 0) {
        tempPanels.push({
          diffs,
          slot,
        });
      }
    });

    setCalculatedDiffPanels(tempPanels.length > 0 ? tempPanels : null);
  };

    // Vị trí bảng so sánh: CỐ ĐỊNH bên phải + xếp DỌC (bảng 2 dưới bảng 1)
  useEffect(() => {
    if (!contextMenu || !calculatedDiffPanels || !menuRef.current) return;

    const menuRect = menuRef.current.getBoundingClientRect();
    const menuRight = menuRect.right;
    const menuTop = menuRect.top;

    const GAP_H = 16;   // cách menu 16px
    const GAP_V = 12;   // cách nhau giữa các bảng

    const finalPanels = calculatedDiffPanels.map((panel, index) => ({
      ...panel,
      x: menuRight + GAP_H,                           // luôn bên phải
      y: menuTop + index * (190 + GAP_V),             // bảng 2 xuống dưới bảng 1 (190px là chiều cao trung bình)
      flipped: false,
    }));

    setCalculatedDiffPanels(finalPanels);
  }, [contextMenu]);

  return (
    <div>
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
            <div className="flex gap-3 py-2 min-w-max ml-1">
              {inventoryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={(e) => handleItemClick(e, item)}
                  className={`relative flex-shrink-0 w-16 h-12 rounded-lg border-4 overflow-hidden transition-all duration-300 hover:scale-110 ${getRarityBackground(
                    item.rarity
                  )}`}
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

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl py-3 min-w-64"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-5 py-3 border-b border-gray-800">
            <p className="font-bold text-lg text-white">
              {contextMenu.item.name}
            </p>
          </div>

          {contextMenu.item.stats &&
            Object.keys(contextMenu.item.stats).length > 0 && (
              <div className="px-5 py-3 space-y-1 text-sm border-b border-gray-800">
                {Object.entries(contextMenu.item.stats).map(([stat, val]) => (
                  <div
                    key={stat}
                    className="flex justify-between text-gray-300"
                  >
                    <span>{formatStatName(stat)}</span>
                    <span className="text-green-400 font-medium">
                      +{val}
                      {[
                        "critChance",
                        "dodge",
                        "lifeSteal",
                        "critDamage",
                        "thorn",
                        "luck",
                      ].includes(stat)
                        ? "%"
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

          <div className="py-2 space-y-1">
            {getAvailableSlots(contextMenu.item).map((slot) => {
              const equipped = player.equipment?.[slot];
              return (
                <button
                  key={slot}
                  onClick={() => {
                    onEquipItem?.(contextMenu.item, slot);
                    setContextMenu(null);
                    setCalculatedDiffPanels(null);
                  }}
                  className="w-full px-5 py-2.5 text-left text-green-400 hover:bg-green-900 hover:text-white transition font-semibold"
                >
                  {equipped
                    ? `Replace ${getSlotDisplayName(slot)}`
                    : `Equip to ${getSlotDisplayName(slot)}`}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              onDestroyItem?.(contextMenu.item);
              setContextMenu(null);
              setCalculatedDiffPanels(null);
            }}
            className="w-full px-5 py-2.5 text-left text-red-400 hover:bg-red-900 hover:text-white transition font-semibold border-t border-gray-800"
          >
            Destroy Item
          </button>
        </div>
      )}

      {/* Nhiều bảng so sánh - Khoảng cách chuẩn 16px */}
      {calculatedDiffPanels && calculatedDiffPanels.map((panel, idx) => (
        <div
          key={idx}
          className="fixed z-50 bg-gray-950 border-2 border-cyan-600 rounded-lg p-4 min-w-64 shadow-2xl pointer-events-none"
          style={{
            top: panel.y,
            left: panel.x,
          }}
        >
          <div className="text-cyan-400 text-xs font-bold mb-2 border-b border-cyan-900 pb-1">
            vs {getSlotDisplayName(panel.slot)}
          </div>
          <div className="space-y-2 text-sm font-medium">
            {panel.diffs.map(({ stat, diff }) => (
              <div key={stat} className="flex justify-between items-center">
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
  );
};

export default InventoryPanel;
