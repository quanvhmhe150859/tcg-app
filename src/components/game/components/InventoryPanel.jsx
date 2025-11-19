// src/components/battle/InventoryPanel.jsx
import React, { useState, useRef, useEffect } from "react";

const InventoryPanel = ({ player, onEquipItem, onDestroyItem }) => {
  const [contextMenu, setContextMenu] = useState(null); // { item, x, y }
  const menuRef = useRef(null);

  // Lấy danh sách item chưa được equip
  const equippedIds = new Set(
    Object.values(player?.equipment || {})
      .filter(Boolean)
      .map((eq) => eq.id)
  );

  const inventoryItems = (player?.inventory || []).filter(
    (item) => item.slot && item.icon && !equippedIds.has(item.id)
  );

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (inventoryItems.length === 0) return null;

  const getRarityBorder = (rarity = "common") => {
    const map = {
      common: "border-gray-500",
      uncommon: "border-green-500",
      rare: "border-blue-500",
      epic: "border-purple-500",
      legendary: "border-orange-500",
    };
    return map[rarity] || map.common;
  };

  // Hiển thị tên slot đẹp và đúng yêu cầu
  const getSlotDisplayName = (slot) => {
    const names = {
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
    return names[slot] || slot;
  };

  // Xác định các slot có thể equip (dành cho weapon & ring)
  const getAvailableSlots = (item) => {
    const slotKey = item.slot.replace(/1|2$/, ""); // "weapon1" → "weapon", "ring2" → "ring"
    const possibleSlots = {
      weapon: ["weapon1", "weapon2"],
      ring: ["ring1", "ring2"],
    };

    if (possibleSlots[slotKey]) {
      return possibleSlots[slotKey];
    }
    // Các slot đơn: helmet, armor,...
    return player.equipment?.[item.slot] ? [] : [item.slot];
  };

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setContextMenu({
      item,
      x: rect.right + 10,
      y: rect.top,
    });
  };

  return (
    <>
      <p className="font-semibold mt-6 mb-2 border-t border-gray-500 pt-3">
        Inventory ({inventoryItems.length})
      </p>

      <div className="bg-black bg-opacity-40 rounded-lg p-4 border border-gray-600">
        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
          {inventoryItems.map((item) => (
            <button
              key={item.id}
              onClick={(e) => handleItemClick(e, item)}
              className={`
                relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-4 overflow-hidden
                transition-all duration-300 shadow-lg hover:scale-110 hover:z-10
                ${getRarityBorder(item.rarity)}
              `}
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

      {/* Context Menu - Dọc, đẹp, chuẩn Windows */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl py-3 min-w-56 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {/* Tên + rarity */}
          <div className="px-5 py-3 border-b border-gray-800">
            <p className="font-bold text-lg text-white">{contextMenu.item.name}</p>
            <p className="text-xs text-gray-400 capitalize">{contextMenu.item.rarity || "common"}</p>
          </div>

          {/* Stats */}
          {contextMenu.item.stats && Object.keys(contextMenu.item.stats).length > 0 && (
            <div className="px-5 py-3 space-y-1 text-sm border-b border-gray-800">
              {Object.entries(contextMenu.item.stats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between text-gray-300">
                  <span>{stat}</span>
                  <span className="text-green-400">+{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Nút Equip - 1 hoặc 2 tùy loại */}
          <div className="py-2">
            {getAvailableSlots(contextMenu.item).map((slot) => (
              <button
                key={slot}
                onClick={() => {
                  onEquipItem?.(contextMenu.item, slot);
                  setContextMenu(null);
                }}
                className="w-full px-5 py-2.5 mt-1 text-left text-green-400 hover:bg-green-900 hover:text-white transition flex items-center justify-between"
              >
                <span>Equip → {getSlotDisplayName(slot)}</span>
                {player.equipment?.[slot] && (
                  <span className="text-xs text-orange-400">(replace)</span>
                )}
              </button>
            ))}

            {getAvailableSlots(contextMenu.item).length === 0 && (
              <div className="px-5 py-2 text-gray-500 text-sm">
                Both slots occupied
              </div>
            )}
          </div>

          {/* Destroy */}
          <div className="border-t border-gray-800 pt-2 mt-2">
            <button
              onClick={() => {
                if (window.confirm(`Permanently destroy ${contextMenu.item.name}?`)) {
                  onDestroyItem?.(contextMenu.item);
                  setContextMenu(null);
                }
              }}
              className="w-full px-5 py-2.5 text-left text-red-400 hover:bg-red-900 hover:text-white transition"
            >
              Destroy Item
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryPanel;