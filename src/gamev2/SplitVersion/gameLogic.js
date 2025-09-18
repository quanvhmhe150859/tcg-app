import { addLog, checkGameOver, startTurn } from "./utils";

export const attackPhase = (attacker, defender, attackerName, currentTurnLogs, attackerEffects, defenderEffects) => {
  if (Math.random() < Math.min(defender.dodge, 0.6)) {
    addLog(
      `${attackerName === "Player" ? "Enemy" : "Player"} dodges the attack!`,
      "dodge",
      currentTurnLogs
    );
    return true;
  }

  const baseDamage = Math.floor(Math.random() * (attacker.maxAttack - attacker.minAttack + 1)) + attacker.minAttack;
  const isCritical = Math.random() < attacker.critChance;
  const preArmorDamage = isCritical ? Math.floor(baseDamage * attacker.critDamage) : baseDamage;
  const finalDamage = Math.floor(preArmorDamage * (100 / (100 + defender.armor)));
  defender.health = Math.max(0, defender.health - finalDamage);
  addLog(
    `${attackerName} deals ${finalDamage} (${preArmorDamage}) damage to ${
      attackerName === "Player" ? "Enemy" : "Player"
    }!${isCritical ? " (Critical Hit)" : ""}`,
    isCritical ? "attackCritical" : "",
    currentTurnLogs
  );

  if (attacker.lifeSteal > 0 && finalDamage > 0) {
    const healthRestored = Math.floor(finalDamage * attacker.lifeSteal);
    if (healthRestored > 0) {
      attacker.health += healthRestored;
      addLog(
        `${attackerName} restores ${healthRestored} health via life steal!`,
        "lifeSteal",
        currentTurnLogs
      );
    }
  }

  if (Math.random() < attacker.rareStats.stunChance) {
    defenderEffects.stunned = true;
    addLog(`${attackerName === "Player" ? "Enemy" : "Player"} is stunned!`, "stun", currentTurnLogs);
  }

  if (attacker.rareStats.burn > 0) {
    defenderEffects.burnDot = attacker.rareStats.burn;
  }
  if (attacker.rareStats.poison > 0 && defenderEffects.poisonBase === 0) {
    defenderEffects.poisonBase = attacker.rareStats.poison;
    defenderEffects.poisonDot = attacker.rareStats.poison;
  }

  return defender.health > 0;
};

export const applyBurn = (entity, entityName, currentTurnLogs, effects) => {
  if (effects.burnDot > 0) {
    const damage = effects.burnDot;
    entity.health = Math.max(0, entity.health - damage);
    addLog(`${entityName} takes ${damage} burn damage!`, "burn", currentTurnLogs);
    if (entity.health <= 0) {
      return false;
    }
  }
  return true;
};

export const applyPoison = (entity, entityName, currentTurnLogs, effects) => {
  if (effects.poisonDot > 0) {
    const damage = effects.poisonDot;
    entity.health = Math.max(0, entity.health - damage);
    addLog(`${entityName} takes ${damage} poison damage!`, "poison", currentTurnLogs);
    effects.poisonDot += effects.poisonBase;
    if (entity.health <= 0) {
      return false;
    }
  }
  return true;
};

export const playerTurn = (newPlayer, newEnemy, currentTurnLogs, localPlayerEffects, localEnemyEffects) => {
  if (!applyBurn(newPlayer, "Player", currentTurnLogs, localPlayerEffects)) {
    return false;
  }

  if (newPlayer.regeneration > 0) {
    newPlayer.health += newPlayer.regeneration;
    addLog(`Player regenerates ${newPlayer.regeneration} health!`, "regeneration", currentTurnLogs);
  }

  if (localPlayerEffects.stunned) {
    addLog(`Player is stunned and misses the turn!`, "stun", currentTurnLogs);
    localPlayerEffects.stunned = false;
  } else {
    attackPhase(newPlayer, newEnemy, "Player", currentTurnLogs, localPlayerEffects, localEnemyEffects);
  }

  if (!applyPoison(newPlayer, "Player", currentTurnLogs, localPlayerEffects)) {
    return false;
  }

  return newEnemy.health > 0;
};

export const enemyTurn = (newPlayer, newEnemy, currentTurnLogs, localPlayerEffects, localEnemyEffects) => {
  if (!applyBurn(newEnemy, "Enemy", currentTurnLogs, localEnemyEffects)) {
    return;
  }

  if (newEnemy.regeneration > 0) {
    newEnemy.health += newEnemy.regeneration;
    addLog(`Enemy regenerates ${newEnemy.regeneration} health!`, "regeneration", currentTurnLogs);
  }

  if (localEnemyEffects.stunned) {
    addLog(`Enemy is stunned and misses the turn!`, "stun", currentTurnLogs);
    localEnemyEffects.stunned = false;
  } else {
    attackPhase(newEnemy, newPlayer, "Enemy", currentTurnLogs, localEnemyEffects, localPlayerEffects);
  }

  applyPoison(newEnemy, "Enemy", currentTurnLogs, localEnemyEffects);
};