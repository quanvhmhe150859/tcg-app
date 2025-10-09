// Phase 2: Player Turn
export const playerTurn = (
  stats,
  enemy,
  getRandomInt,
  applyDamage,
  roundLog,
  checkDefeatedPhase,
  defeatArgs
) => {
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
    roundLog.push({
      text: `Player heals for ${heal} HP with life steal.`,
      type: "heal",
    });
  }

  // ✅ Gọi check defeated sau player attack
  const defeatedResult = checkDefeatedPhase(
    newStats,
    newEnemy,
    roundLog,
    defeatArgs
  );
  return { newStats, newEnemy, defeatedResult };
};