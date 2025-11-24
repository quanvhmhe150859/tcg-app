import React, { useState } from "react";
import { statIcons } from "../constants/stats";

const StatsPanel = ({ entity, showNormalStats, showRareStats }) => {
  // Render stat
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

  return (
    <div>
      {/* Normal Stats */}
      {showNormalStats && (
        <div className="p-1 mb-2">
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
        <div className="mb-2">
          <div className="bg-game-secondary p-1 rounded">
            {renderStat("Burn", entity.rareStats.burn)}
            {renderStat("Poison", entity.rareStats.poison)}
            {renderStat("Thorn", entity.rareStats.thorn)}
            {renderStat("Counterattack", entity.rareStats.counterattack, true)}
            {renderStat("Stun Chance", entity.rareStats.stunChance, true)}
            {renderStat("Swiftness", entity.rareStats.swiftness, true)}
            {renderStat("Shield", entity.rareStats.shield)}
            {renderStat("Barrier", entity.rareStats.barrier)}
            {renderStat("Cooldown", entity.rareStats.cooldownReduction)}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
