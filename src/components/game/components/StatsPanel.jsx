import React, { useState } from "react";
import { statIcons } from "../constants/statIcons";

const StatsPanel = ({ entity, name, showNormalStats, showRareStats }) => {
  const [isHealthBarHovered, setIsHealthBarHovered] = useState(false);

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

  // Thanh máu
  const renderHealthBar = (
    currentHealth,
    maxHealth,
    shield = 0,
    barrier = 0
  ) => {
    if (barrier > 0 && !isHealthBarHovered) {
      return (
        <div className="w-full rounded h-4 flex overflow-hidden relative">
          <div className="bg-blue-500 h-full w-full"></div>
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {statIcons["Barrier"]?.icon} × {barrier}
          </div>
        </div>
      );
    }

    const effectiveHealth = currentHealth + shield;
    const totalCapacity = maxHealth + shield;

    const healthPercentage = Math.max(0, (currentHealth / totalCapacity) * 100);
    const shieldPercentage = Math.max(0, (shield / totalCapacity) * 100);
    const lostHealthPercentage = 100 - healthPercentage - shieldPercentage;

    return (
      <div className="w-full rounded h-4 flex overflow-hidden relative">
        <div
          className="bg-green-500 h-full"
          style={{ width: `${healthPercentage}%` }}
        ></div>

        {shield > 0 && (
          <div
            className="bg-gray-300 h-full"
            style={{ width: `${shieldPercentage}%` }}
          ></div>
        )}

        <div
          className="bg-red-500 h-full"
          style={{ width: `${lostHealthPercentage}%` }}
        ></div>

        <div className="absolute inset-0 flex items-center justify-center text-sm text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
          {statIcons["Health"]?.icon} {currentHealth + shield} / {maxHealth}
        </div>
      </div>
    );
  };

  // Render Buff/Debuff (w-6 h-6)
  const renderEffect = (effect, isBuff = false) => {
    const icon = statIcons[effect.name]?.icon || "Question";
    const isDamage = effect.isDamage === true;
    const duration =
      effect.duration !== undefined && effect.duration !== null
        ? Math.ceil(effect.duration)
        : null;

    // Tooltip: damage hoặc duration
    const title = isDamage
      ? `${effect.name}: ${effect.damage} damage/turn`
      : duration !== null
      ? `${effect.name}: ${duration} turn`
      : effect.name;

    return (
      <div
        key={`${effect.name}-${
          effect.damage || effect.duration || Math.random()
        }`}
        className={`relative flex items-center justify-center w-6 h-6 rounded border-2 text-[10px] font-bold text-white shadow-sm ${
          isBuff ? "bg-green-600 border-green-700" : "bg-red-600 border-red-700"
        }`}
        title={title}
      >
        <span className="text-base leading-none">{icon}</span>

        {/* Chỉ hiện số nếu duration !== null và không phải damage */}
        {duration !== null && !isDamage && (
          <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-[8px] font-bold drop-shadow-md bg-black bg-opacity-60 px-1 rounded">
            {duration}
          </span>
        )}
      </div>
    );
  };

  // === XỬ LÝ TẤT CẢ HIỆU ỨNG ===
  const buffs = entity.buffs || [];
  const debuffs = entity.debuffs || [];

  // Chuyển entity.effects thành debuffs
  const effectDebuffs = [];

  if (entity.effects) {
    // burnDot & poisonDot: chỉ hiển thị icon + title damage
    if (entity.effects.burnDot > 0) {
      effectDebuffs.push({
        name: "Burn",
        duration: null, // null → không hiện số dưới
        damage: entity.effects.burnDot,
        isDamage: true,
      });
    }
    if (entity.effects.poisonDot > 0) {
      effectDebuffs.push({
        name: "Poison",
        duration: null,
        damage: entity.effects.poisonDot,
        isDamage: true,
      });
    }
    // isStuned: true → hiện icon + số 0
    if (entity.effects.isStuned === true) {
      effectDebuffs.push({
        name: "Stun Chance",
        duration: 0,
        isDamage: false,
      });
    }
  }

  // Gộp tất cả
  const allBuffs = buffs.map((b) => ({ ...b, isBuff: true }));
  const allDebuffs = [
    ...debuffs.map((d) => ({ ...d, isBuff: false })),
    ...effectDebuffs,
  ];

  const hasAnyEffect = allBuffs.length > 0 || allDebuffs.length > 0;

  return (
    <div>
      <h2 className="font-semibold">{name} Stats:</h2>

      {/* Health Bar */}
      <div
        className="p-1 relative z-10"
        onMouseEnter={() => setIsHealthBarHovered(true)}
        onMouseLeave={() => setIsHealthBarHovered(false)}
      >
        {renderHealthBar(
          entity.currentHealth,
          entity.maxHealth,
          entity.effects?.shield || 0,
          entity.effects?.barrier || 0
        )}
      </div>

      {/* Khu vực cố định cho Buffs & Debuffs */}
      <div className="min-h-8 px-1 flex items-start flex-wrap gap-1">
        {hasAnyEffect ? (
          <>
            {/* Buffs (xanh lá) */}
            {allBuffs.map((buff, i) => renderEffect(buff, true))}
            {/* Debuffs: damage (không số) + isStuned (số 0) + debuffs thường */}
            {allDebuffs.map((debuff, i) => renderEffect(debuff, false))}
          </>
        ) : (
          <div className="h-6"></div>
        )}
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
