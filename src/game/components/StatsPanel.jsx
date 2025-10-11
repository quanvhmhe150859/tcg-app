import React from "react";
import { statIcons } from "../constants/statIcons";

const StatsPanel = ({ entity, name, showNormalStats, showRareStats }) => {
  // 🔹 Render stat
  const renderStat = (statName, value, isPercentage = false) => {
    const icon = statIcons[statName]?.icon || "";
    const displayValue = isPercentage ? `${(value * 100).toFixed(0)}%` : value;

    return (
      <div className="flex justify-between text-sm">
        <span>
          <span className="sm:inline hidden">{statName}</span>
          <span className="sm:hidden">{icon}</span>:
        </span>
        <span>{displayValue}</span>
      </div>
    );
  };

  // 🔹 Thanh máu
  const renderHealthBar = (currentHealth, maxHealth) => {
    const healthPercentage = Math.max(0, (currentHealth / maxHealth) * 100);
    const lostHealthPercentage = 100 - healthPercentage;
    return (
      <div className="w-full rounded h-4 flex overflow-hidden relative">
        <div
          className="bg-green-500 h-full"
          style={{ width: `${healthPercentage}%` }}
        ></div>
        <div
          className="bg-red-500 h-full"
          style={{ width: `${lostHealthPercentage}%` }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center text-sm text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          {statIcons["Health"]?.icon} {currentHealth} / {maxHealth}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="font-semibold">{name} Stats:</h2>

      {/* Health luôn hiện chữ đầy đủ */}
      <div className="p-1 relative">
        {renderHealthBar(entity.currentHealth, entity.maxHealth)}
      </div>

      {/* Normal Stats */}
      {showNormalStats && (
        <div className="p-1 mt-2">
          {renderStat("Regeneration", entity.regeneration)}
          {renderStat("Armor", entity.armor)}
          <div className="flex justify-between text-sm">
            <span>
              <span className="sm:inline hidden">Attack</span>
              <span className="sm:hidden">{statIcons["Attack"].icon}</span>:
            </span>
            <span>
              {entity.minAttack} - {entity.maxAttack}
            </span>
          </div>
          {renderStat("Crit Chance", entity.critChance, true)}
          {renderStat("Crit Damage", entity.critDamage, true)}
          {renderStat("Life Steal", entity.lifeSteal, true)}
          {renderStat("Dodge", entity.dodge < 0.6 ? entity.dodge : 0.6, true)}
        </div>
      )}

      {/* Rare Stats */}
      {showRareStats && (
        <div className="mt-2">
          <div className="bg-game-secondary p-1 rounded">
            {renderStat("Burn", entity.rareStats.burn)}
            {renderStat("Poison", entity.rareStats.poison)}
            {renderStat("Thorn", entity.rareStats.thorn)}
            {renderStat("Counterattack", entity.rareStats.counterattack, true)}
            {renderStat("Stun Chance", entity.rareStats.stunChance, true)}
            {renderStat("Swiftness", entity.rareStats.swiftness, true)}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
