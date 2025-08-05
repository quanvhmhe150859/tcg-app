import { applyStatusEffects } from "../utils/gameUtils";

// Phase 3: Enemy Turn
export const enemyTurn = (
  stats,
  enemy,
  turn,
  getRandomInt,
  applyDamage,
  didDodge,
  roundLog,
  checkDefeatedPhase,
  defeatArgs
) => {
  let newStats = { ...stats };
  let newEnemy = { ...enemy };
  const {
    updatedTarget: updatedEnemy,
    stunned,
    log: effectLog,
  } = applyStatusEffects(stats.effects, newEnemy, turn.current);
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
  const defeatedResult = checkDefeatedPhase(
    newStats,
    newEnemy,
    roundLog,
    defeatArgs
  );
  return { newStats, newEnemy, stunned: false, defeatedResult };
};