// src/components/battle/SkillsAndItemsPanel.jsx
import React from "react";
import { SPECIALS } from "../constants/specials";
import { getSpecialIconPath } from "../configs/specialConfig";
import { getConsumableIconPath } from "../configs/consumableConfig";

const SkillsAndItemsPanel = ({
  player,
  gameOver,
  isAuto,
  showUpgradeOptions,
  showShop,
  handleSpecial,
  handleUseConsumable,
}) => {
  return (
    <>
      <p className="font-semibold py-2 px-4">
        Skills & Items
      </p>

      <div className="flex gap-2 flex-wrap">
        {/* ==================== SPECIAL SKILLS ==================== */}
        {player.specials?.map((special, index) => {
          const specialData = SPECIALS.find((s) => s.id === special.specialId);
          if (!specialData) return null;

          const isOnCooldown = special.currentCooldown > 0;
          const isPassive = specialData.usingType === "auto";

          return (
            <button
              key={`special-${index}`}
              onClick={() => !isPassive && handleSpecial(special.specialId)}
              disabled={
                isOnCooldown ||
                gameOver ||
                showUpgradeOptions ||
                showShop ||
                isAuto ||
                isPassive
              }
              className={`
                relative w-14 h-10 sm:w-16 sm:h-12
                rounded-lg border-2 overflow-hidden
                transition-all duration-200
                ${
                  isOnCooldown
                    ? "opacity-50 grayscale border-gray-500 !cursor-not-allowed"
                    : isPassive
                    ? "border-purple-400 opacity-80"
                    : "border-yellow-400 hover:scale-110 hover:border-yellow-300 shadow-lg"
                }
                ${
                  gameOver ||
                  showUpgradeOptions ||
                  showShop ||
                  isAuto ||
                  isPassive
                    ? "!cursor-not-allowed"
                    : ""
                }
              `}
              title={
                `${specialData.name}${isPassive ? " (Passive)" : ""}\n` +
                `${
                  typeof specialData.effect === "function"
                    ? specialData.effect(specialData.power)
                    : specialData.effect
                }\n` +
                `Cooldown: ${special?.currentCooldown ?? 0}/${specialData.cooldown}`
              }
            >
              <img
                src={getSpecialIconPath(specialData.image)}
                alt={specialData.name}
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "/default.jpg")}
              />
              {isOnCooldown && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 text-white text-xs font-bold">
                  {special.currentCooldown}
                </div>
              )}
            </button>
          );
        })}

        {/* ==================== CONSUMABLES ==================== */}
        {(() => {
          const consumables = player.consumables;

          if (
            !consumables ||
            typeof consumables !== "object" ||
            Array.isArray(consumables)
          ) {
            return null;
          }

          return Object.entries(consumables)
            .map(([id, quantity]) => {
              if (quantity <= 0 && quantity !== false) return null; // ẩn nếu hết (trừ revive có thể hiện 0)

              const parts = id.split("_");
              if (parts.length < 3) return null;

              const type = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
              const value = parts[1];
              const mode = parts[2];
              const displayValue = mode === "percent" ? `${value}%` : value;
              const itemName = `${type} ${displayValue} Potion`;

              const hasQuantity = quantity > 0;

              return (
                <button
                  key={`consumable-${id}`}
                  onClick={() => {
                    if (hasQuantity && !gameOver && !id.includes("revive")) {
                      handleUseConsumable(id);
                    }
                  }}
                  disabled={!hasQuantity || gameOver || id.includes("revive")}
                  className={`
                    relative w-14 h-10 sm:w-16 sm:h-12
                    rounded-lg border-2 overflow-hidden
                    transition-all duration-200
                    ${
                      !hasQuantity
                        ? "opacity-30 grayscale border-gray-600"
                        : "border-cyan-400 hover:scale-110 hover:border-cyan-300 shadow-lg"
                    }
                    ${gameOver || id.includes("revive") ? "!cursor-not-allowed" : ""}
                  `}
                  title={itemName}
                >
                  <img
                    src={getConsumableIconPath(id)}
                    alt={id}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = "/default.jpg")}
                  />

                  {hasQuantity ? (
                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded-tl">
                      {quantity}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white text-xs font-bold">
                      0
                    </div>
                  )}
                </button>
              );
            })
            .filter(Boolean);
        })()}
      </div>
    </>
  );
};

export default SkillsAndItemsPanel;