import { applyStatusEffects } from "../utils/gameUtils";

// Phase 1: Start Turn
export const startTurn = (stats, turn, roundLog) => {
  roundLog.push({ text: `Turn ${turn.current}`, type: "normal" });
  let newStats = { ...stats };
  if (newStats.regen > 0) {
    newStats.health += newStats.regen;
    roundLog.push({ text: `Player regenerates ${newStats.regen} HP.`, type: "heal" });
  }
  return newStats;
};

// Phase 2: Player Turn
export const playerTurn = (stats, enemy, getRandomInt, applyDamage, roundLog, checkDefeatedPhase, defeatArgs) => {
  let newStats = { ...stats };
  let newEnemy = { ...enemy };
  let baseDmg = getRandomInt(stats.minAttack, stats.maxAttack);
  const isCrit = Math.random() * 100 < stats.critChance;
  if (isCrit) baseDmg *= 2;
  const beforeHP = newEnemy.health;
  newEnemy = applyDamage(newEnemy, baseDmg);
  const actualDamage = beforeHP - newEnemy.health;
  roundLog.push({
    text: `Player hits ${newEnemy.name}: ${actualDamage}(${baseDmg}) damage.`,
    type: isCrit ? "crit" : "normal",
  });
  const heal = Math.floor((actualDamage * stats.lifeSteal) / 100);
  if (heal > 0) {
    newStats.health += heal;
    roundLog.push({ text: `Player heals for ${heal} HP with life steal.`, type: "heal" });
  }

  // ✅ Gọi check defeated sau player attack
  const defeatedResult = checkDefeatedPhase(newStats, newEnemy, roundLog, defeatArgs);
  return { newStats, newEnemy, defeatedResult };
};

// Phase 3: Enemy Turn
export const enemyTurn = (stats, enemy, turn, getRandomInt, applyDamage, didDodge, roundLog, checkDefeatedPhase, defeatArgs) => {
  let newStats = { ...stats };
  let newEnemy = { ...enemy };
  const { updatedTarget: updatedEnemy, stunned, log: effectLog } = applyStatusEffects(stats.effects, newEnemy, turn.current);
  newEnemy = updatedEnemy;
  roundLog.push(...effectLog);
  if (stunned) {
    return { newStats, newEnemy, stunned: true, defeatedResult: null };
  }
  const enemyDmg = getRandomInt(newEnemy.minAttack, newEnemy.maxAttack);
  if (didDodge(newStats.dodge)) {
    roundLog.push({ text: "Player dodged the attack!", type: "heal" });
  } else {
    const beforeHP = newStats.health;
    newStats = applyDamage(newStats, enemyDmg);
    const actualDamage = beforeHP - newStats.health;
    roundLog.push({
      text: `${newEnemy.name} hits player: ${actualDamage}(${enemyDmg}) damage.`,
      type: "normal",
    });
  }

  // ✅ Gọi check defeated sau enemy attack
  const defeatedResult = checkDefeatedPhase(newStats, newEnemy, roundLog, defeatArgs);
  return { newStats, newEnemy, stunned: false, defeatedResult };
};

// Phase 4: Check Defeated (tách riêng)
export const checkDefeatedPhase = (
  stats,
  enemy,
  roundLog,
  {
    level,
    turn,
    setLevel,
    setPendingUpgrades,
    setGameOver,
    setAutoBattle,
    upgradeOptions,
    bossEffectOptions
  }
) => {
  if (enemy.health <= 0) {
    turn.current = 1;
    roundLog.push({ text: `${enemy.name} is defeated!`, type: "defeat" });

    const goldGained = enemy.goldReward || 0;
    stats.gold = (stats.gold || 0) + goldGained;
    roundLog.push({
      text: `You gained ${goldGained} 💰.`,
      type: "gold"
    });

    const nextLevel = level + 1;
    setLevel(nextLevel);

    const upgrades = enemy.isBoss
      ? bossEffectOptions.sort(() => 0.5 - Math.random()).slice(0, 3)
      : upgradeOptions
          .filter((opt) => {
            if (opt.key === "minAttack" && stats.minAttack >= stats.maxAttack) return false;
            return true;
          })
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);

    setPendingUpgrades(upgrades);
    return { defeated: "enemy" };
  }

  if (stats.health <= 0) {
    turn.current = 1;
    roundLog.push({ text: "Player is defeated. Game Over.", type: "defeat" });
    setGameOver(true);
    setAutoBattle(false);
    return { defeated: "player" };
  }

  return { defeated: null };
};

// Phase 5: End Turn (chưa làm gì cả)
export const endTurnPhase = () => {
  // để trống, có thể dùng sau để xử lý relics "end of turn"
};
