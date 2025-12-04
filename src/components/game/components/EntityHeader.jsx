import React, { useState, useEffect } from "react";
import { statIcons } from "../constants/stats";
import { effectIcons } from "../constants/effects";

const EntityHeader = ({ name, entity }) => {
  const [isHealthBarHovered, setIsHealthBarHovered] = useState(false);
  const [isLowHealth, setIsLowHealth] = useState(false);
  const [hoveredEffectIndex, setHoveredEffectIndex] = useState(null); // Theo dõi effect đang hover

  // Kiểm tra máu thấp (< 30%)
  useEffect(() => {
    const healthRatio = entity.currentHealth / entity.maxHealth;
    setIsLowHealth(healthRatio <= 0.3);
  }, [entity.currentHealth, entity.maxHealth]);

  // === Thanh máu (giữ nguyên hiệu ứng mượt + nhấp nháy khi thấp máu) ===
  const renderHealthBar = (currentHealth, maxHealth, shield = 0, barrier = 0) => {
    if (barrier > 0 && !isHealthBarHovered) {
      return (
        <div className="w-full rounded h-4 flex overflow-hidden relative bg-blue-500">
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
            {statIcons["Barrier"]?.icon || "[Barrier]"} × {barrier}
          </div>
        </div>
      );
    }

    const totalWithShield = maxHealth + shield;
    const healthPercent = Math.max(0, (currentHealth / totalWithShield) * 100);
    const shieldPercent = Math.max(0, (shield / totalWithShield) * 100);
    const lostPercent = Math.max(0, 100 - healthPercent - shieldPercent);

    return (
      <div
        className={`
          w-full rounded h-4 flex overflow-hidden relative
          ${isLowHealth ? "animate-pulse ring-2 ring-red-500 ring-opacity-70 shadow-lg shadow-red-500/50" : ""}
        `}
      >
        <div
          className="bg-green-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${healthPercent}%` }}
        />
        {shield > 0 && (
          <div
            className="bg-gray-300 h-full transition-all duration-300 ease-out"
            style={{ width: `${shieldPercent}%` }}
          />
        )}
        <div
          className="bg-red-500/70 h-full transition-all duration-300 ease-out"
          style={{ width: `${lostPercent}%` }}
        />
        <div
          className={`
            absolute inset-0 flex items-center justify-center text-sm font-bold text-white
            drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]
            ${isLowHealth ? "text-red-200 animate-pulse" : ""}
          `}
        >
          {statIcons["Health"]?.icon || "[HP]"} {currentHealth + shield} / {maxHealth}
        </div>
      </div>
    );
  };

  // === Render Buff/Debuff với hiệu ứng ẩn số duration khi hover ===
  const renderEffect = (effect, isBuff = false, index) => {
    const icon = statIcons[effect.name]?.icon || effectIcons[effect.name]?.icon || "[Effect]";
    const isDamage = effect.isDamage === true;
    const duration =
      effect.duration !== undefined && effect.duration !== null
        ? Math.ceil(effect.duration)
        : null;

    const title = isDamage
      ? `${effect.name}: ${effect.damage} damage/turn`
      : duration !== null
      ? `${effect.name}: ${duration} turn${duration > 1 ? "s" : ""}`
      : effect.name;

    const isHovered = hoveredEffectIndex === index;

    return (
      <div
        key={`${effect.name}-${effect.damage || effect.duration || index}`}
        className={`
          relative flex items-center justify-center w-6 h-6 rounded border-2 
          text-[10px] font-bold text-white shadow-sm
          transition-all duration-200
          ${isBuff ? "bg-green-600 border-green-700" : "bg-red-600 border-red-700"}
          ${isHovered ? "scale-125 z-10 shadow-lg" : "scale-100"}
        `}
        title={title}
        onMouseEnter={() => setHoveredEffectIndex(index)}
        onMouseLeave={() => setHoveredEffectIndex(null)}
      >
        <span className="text-base leading-none">{icon}</span>

        {/* Số duration - ẩn khi hover */}
        {duration !== null && !isDamage && (
          <span
            className={`
              absolute -bottom-1 left-1/2 -translate-x-1/2 
              text-[8px] font-bold bg-black/70 px-1 rounded
              transition-opacity duration-200
              ${isHovered ? "	opacity-0" : "opacity-100"}
            `}
          >
            {duration}
          </span>
        )}
      </div>
    );
  };

  // === Xử lý tất cả hiệu ứng ===
  const effects = entity.effects || {};
  const buffs = entity.buffs || [];
  const debuffs = entity.debuffs || [];

  const effectDebuffs = [];
  if (effects.burnDot > 0) effectDebuffs.push({ name: "Burn", damage: effects.burnDot, isDamage: true });
  if (effects.poisonDot > 0) effectDebuffs.push({ name: "Poison", damage: effects.poisonDot, isDamage: true });
  if (effects.isStuned === true) effectDebuffs.push({ name: "Stun Chance", duration: 0 });

  const allBuffs = buffs.map(b => ({ ...b, isBuff: true }));
  const allDebuffs = [...debuffs.map(d => ({ ...d, isBuff: false })), ...effectDebuffs];

  // Gộp tất cả và đánh index để theo dõi hover
  const allEffects = [...allBuffs, ...allDebuffs];

  const hasAnyEffect = allEffects.length > 0;

  return (
    <div className="z-300">
      <h2 className="font-semibold text-lg">{name} Stats:</h2>

      {/* Thanh máu */}
      <div
        className="p-1"
        onMouseEnter={() => setIsHealthBarHovered(true)}
        onMouseLeave={() => setIsHealthBarHovered(false)}
      >
        {renderHealthBar(
          entity.currentHealth,
          entity.maxHealth,
          effects.shield || 0,
          effects.barrier || 0
        )}
      </div>

      {/* Buffs & Debuffs */}
      <div className="px-1 flex items-start flex-wrap gap-1 min-h-8">
        {hasAnyEffect ? (
          allEffects.map((effect, index) =>
            renderEffect(
              effect,
              effect.isBuff,
              index // Truyền index để theo dõi hover riêng lẻ
            )
          )
        ) : (
          <div className="h-8" />
        )}
      </div>
    </div>
  );
};

export default EntityHeader;