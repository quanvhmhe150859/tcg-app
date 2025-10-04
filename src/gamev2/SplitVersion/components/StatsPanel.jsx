import React from "react";

const StatsPanel = ({ entity, name, showNormalStats, showRareStats }) => {
  const renderStat = (statName, value, isPercentage = false) => (
    <div className="flex justify-between text-sm">
      <span>{statName}:</span>
      <span>{isPercentage ? `${(value * 100).toFixed(0)}%` : value}</span>
    </div>
  );

  const renderRareStat = (statName, value, isPercentage = false) => (
    <div className="flex justify-between text-sm">
      <span>{statName}:</span>
      <span>{isPercentage ? `${(value * 100).toFixed(0)}%` : value}</span>
    </div>
  );

  const renderHealthBar = (currentHealth, maxHealth) => {
    const healthPercentage = Math.max(0, (currentHealth / maxHealth) * 100);
    const lostHealthPercentage = 100 - healthPercentage;
    return (
      <div className="w-full rounded h-4 flex overflow-hidden">
        <div
          className="bg-green-500 h-full"
          style={{ width: `${healthPercentage}%` }}
        ></div>
        <div
          className="bg-red-500 h-full"
          style={{ width: `${lostHealthPercentage}%` }}
        ></div>
        <div className="absolute text-center w-full text-sm text-white">
          {currentHealth} / {maxHealth}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="font-semibold">{name} Stats:</h2>
      <div className="p-1 relative">
        {showNormalStats ? (
          <>
            <div className="flex justify-between text-sm">
              <span>Health:</span>
              <span>
                {entity.currentHealth} / {entity.maxHealth}
              </span>
            </div>
            {renderStat("Regeneration", entity.regeneration)}
            {renderStat("Armor", entity.armor)}
            <div className="flex justify-between text-sm">
              <span>Attack:</span>
              <span>
                {entity.minAttack} - {entity.maxAttack}
              </span>
            </div>
            {renderStat("Crit Chance", entity.critChance, true)}
            {renderStat("Crit Damage", entity.critDamage, true)}
            {renderStat("Life Steal", entity.lifeSteal, true)}
            {renderStat("Dodge", entity.dodge < 0.6 ? entity.dodge : 0.6, true)}
          </>
        ) : (
          renderHealthBar(entity.currentHealth, entity.maxHealth)
        )}
      </div>
      <div className="mt-2">
        {showRareStats && (
          <div className="bg-game-secondary">
            {renderRareStat("Burn", entity.rareStats.burn)}
            {renderRareStat("Poison", entity.rareStats.poison)}
            {renderRareStat("Thorn", entity.rareStats.thorn)}
            {renderRareStat(
              "Counterattack",
              entity.rareStats.counterattack,
              true
            )}
            {renderRareStat(
              "Stun Chance",
              entity.rareStats.stunChance,
              true
            )}
            {renderRareStat(
              "Swiftness",
              entity.rareStats.swiftness,
              true
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPanel;