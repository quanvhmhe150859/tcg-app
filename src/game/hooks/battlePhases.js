import { applyStatusEffects } from "../utils/gameUtils";

export const startTurn = (stats, turn, roundLog) => {
  roundLog.push({ text: `Turn ${turn.current}`, type: "normal" });
  let newStats = { ...stats };
  if (newStats.regen > 0) {
    newStats.health += newStats.regen;
    roundLog.push({ text: `Player regenerates ${newStats.regen} HP.`, type: "heal" });
  }
  return newStats;
};

export const playerTurn = (stats, enemy, getRandomInt, applyDamage, roundLog) => {
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
  return { newStats, newEnemy };
};

export const enemyTurn = (stats, enemy, turn, getRandomInt, applyDamage, didDodge, roundLog) => {
  let newStats = { ...stats };
  let newEnemy = { ...enemy };
  const { updatedTarget: updatedEnemy, stunned, log: effectLog } = applyStatusEffects(stats.effects, newEnemy, turn.current);
  newEnemy = updatedEnemy;
  roundLog.push(...effectLog);
  if (stunned) {
    return { newStats, newEnemy, stunned: true };
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
  return { newStats, newEnemy, stunned: false };
};

export const checkDefeated = (stats, enemy, level, turn, setLevel, setPendingUpgrades, setGameOver, setAutoBattle, upgradeOptions, bossEffectOptions, roundLog) => {
  if (enemy.health <= 0) {
    turn.current = 1;
    roundLog.push({ text: `${enemy.name} is defeated!`, type: "defeat" });
    const nextLevel = level + 1;
    setLevel(nextLevel);
    if (enemy.isBoss) {
      const shuffledBossEffects = bossEffectOptions
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setPendingUpgrades(shuffledBossEffects);
    } else {
      const shuffled = upgradeOptions
        .filter((opt) => {
          if (opt.key === "minAttack" && stats.minAttack >= stats.maxAttack) return false;
          return true;
        })
        .sort(() => 0.5 - Math.random());
      setPendingUpgrades(shuffled.slice(0, 3));
    }
    return { defeated: "enemy" };
  } else if (stats.health <= 0) {
    turn.current = 1;
    roundLog.push({ text: "Player is defeated. Game Over.", type: "defeat" });
    setGameOver(true);
    setAutoBattle(false);
    return { defeated: "player" };
  }
  return { defeated: null };
};