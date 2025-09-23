import { addLog, checkGameOver, startTurn } from "./utils";

export const checkHealth = (entity, entityName, currentTurnLogs) => {
  if (entity.health <= 0) {
    // addLog(`${entityName} has been defeated!`, "defeated", currentTurnLogs);
    return false;
  }
  return true;
};

export const applyDodge = (defender, attackerName, currentTurnLogs) => {
  if (Math.random() < Math.min(defender.dodge, 0.6)) {
    addLog(
      `${attackerName === "Player" ? "Enemy" : "Player"} dodges the attack!`,
      "dodge",
      currentTurnLogs
    );
    return true;
  }
  return false;
};

export const calculateCrit = (attacker, baseDamage) => {
  const isCritical = Math.random() < attacker.critChance;
  return {
    damage: isCritical ? Math.floor(baseDamage * attacker.critDamage) : baseDamage,
    isCritical
  };
};

export const applyArmor = (defender, preArmorDamage) => {
  return Math.floor(preArmorDamage * (100 / (100 + defender.armor)));
};

export const applyThorn = (attacker, defender, attackerName, currentTurnLogs) => {
  if (defender.rareStats.thorn > 0) {
    const thornDamage = defender.rareStats.thorn;
    attacker.health = Math.max(0, attacker.health - thornDamage);
    addLog(
      `${attackerName} takes ${thornDamage} thorn damage from ${
        attackerName === "Player" ? "Enemy" : "Player"
      }!`,
      "thorn",
      currentTurnLogs
    );
    return checkHealth(attacker, attackerName, currentTurnLogs);
  }
  return true;
};

export const applyLifeSteal = (attacker, attackerName, finalDamage, currentTurnLogs) => {
  if (attacker.lifeSteal > 0 && finalDamage > 0) {
    const healthRestored = Math.floor(finalDamage * attacker.lifeSteal);
    if (healthRestored > 0) {
      attacker.health += healthRestored;
      addLog(
        `${attackerName} restores ${healthRestored} health via life steal!`,
        "lifeSteal",
        currentTurnLogs
      );
      return true;
    }
  }
  return false;
};

export const applyStun = (attacker, defenderEffects, attackerName, currentTurnLogs) => {
  if (Math.random() < attacker.rareStats.stunChance) {
    defenderEffects.stunned = true;
    addLog(
      `${attackerName === "Player" ? "Enemy" : "Player"} is stunned!`,
      "stun",
      currentTurnLogs
    );
    return true;
  }
  return false;
};

export const applyBurnEffect = (attacker, defenderEffects) => {
  if (attacker.rareStats.burn > 0) {
    defenderEffects.burnDot = attacker.rareStats.burn;
    return true;
  }
  return false;
};

export const applyPoisonEffect = (attacker, defenderEffects) => {
  if (attacker.rareStats.poison > 0 && defenderEffects.poisonBase === 0) {
    defenderEffects.poisonBase = attacker.rareStats.poison;
    defenderEffects.poisonDot = attacker.rareStats.poison;
    return true;
  }
  return false;
};

export const applyCounterattack = (
  attacker,
  defender,
  attackerName,
  currentTurnLogs,
  attackerEffects,
  defenderEffects,
  isCounterattack = false
) => {
  if (
    !isCounterattack &&
    defender.rareStats.counterattack > 0 &&
    Math.random() < defender.rareStats.counterattack &&
    !defenderEffects.stunned
  ) {
    addLog(
      `${attackerName === "Player" ? "Enemy" : "Player"} counterattacks!`,
      "counterattack",
      currentTurnLogs
    );
    attackPhase(
      defender,
      attacker,
      attackerName === "Player" ? "Enemy" : "Player",
      currentTurnLogs,
      defenderEffects,
      attackerEffects,
      true
    );
    return checkHealth(attacker, attackerName, currentTurnLogs);
  }
  return true;
};

export const attackPhase = (
  attacker,
  defender,
  attackerName,
  currentTurnLogs,
  attackerEffects,
  defenderEffects,
  isCounterattack = false
) => {
  if (applyDodge(defender, attackerName, currentTurnLogs)) {
    return true;
  }

  const baseDamage =
    Math.floor(Math.random() * (attacker.maxAttack - attacker.minAttack + 1)) +
    attacker.minAttack;
  const { damage: preArmorDamage, isCritical } = calculateCrit(attacker, baseDamage);
  const finalDamage = applyArmor(defender, preArmorDamage);

  defender.health = Math.max(0, defender.health - finalDamage);
  addLog(
    `${attackerName} deals ${finalDamage} (${preArmorDamage}) damage to ${
      attackerName === "Player" ? "Enemy" : "Player"
    }!${isCritical ? " (Critical Hit)" : ""}`,
    isCritical ? "attackCritical" : "",
    currentTurnLogs
  );

  if (!checkHealth(defender, attackerName === "Player" ? "Enemy" : "Player", currentTurnLogs)) {
    return false;
  }

  if (!applyThorn(attacker, defender, attackerName, currentTurnLogs)) {
    return false;
  }

  applyLifeSteal(attacker, attackerName, finalDamage, currentTurnLogs);
  applyStun(attacker, defenderEffects, attackerName, currentTurnLogs);
  applyBurnEffect(attacker, defenderEffects);
  applyPoisonEffect(attacker, defenderEffects);
  if (!applyCounterattack(attacker, defender, attackerName, currentTurnLogs, attackerEffects, defenderEffects, isCounterattack)) {
    return false;
  }

  return true;
};

export const applyBurn = (entity, entityName, currentTurnLogs, effects) => {
  if (effects.burnDot > 0) {
    const damage = effects.burnDot;
    entity.health = Math.max(0, entity.health - damage);
    addLog(`${entityName} takes ${damage} burn damage!`, "burn", currentTurnLogs);
    return checkHealth(entity, entityName, currentTurnLogs);
  }
  return true;
};

export const applyPoison = (entity, entityName, currentTurnLogs, effects) => {
  if (effects.poisonDot > 0) {
    const damage = effects.poisonDot;
    entity.health = Math.max(0, entity.health - damage);
    addLog(`${entityName} takes ${damage} poison damage!`, "poison", currentTurnLogs);
    effects.poisonDot += effects.poisonBase;
    return checkHealth(entity, entityName, currentTurnLogs);
  }
  return true;
};

export const applyRegeneration = (entity, entityName, currentTurnLogs) => {
  if (entity.regeneration > 0) {
    entity.health += entity.regeneration;
    addLog(
      `${entityName} regenerates ${entity.regeneration} health!`,
      "regeneration",
      currentTurnLogs
    );
    return true;
  }
  return false;
};

export const checkStun = (effects, entityName, currentTurnLogs) => {
  if (effects.stunned) {
    addLog(`${entityName} is stunned and misses the turn!`, "stun", currentTurnLogs);
    effects.stunned = false;
    return true;
  }
  return false;
};

export const playerTurn = (
  newPlayer,
  newEnemy,
  currentTurnLogs,
  localPlayerEffects,
  localEnemyEffects
) => {
  if (!applyBurn(newPlayer, "Player", currentTurnLogs, localPlayerEffects)) {
    return false;
  }

  applyRegeneration(newPlayer, "Player", currentTurnLogs);

  if (checkStun(localPlayerEffects, "Player", currentTurnLogs)) {
    return newEnemy.health > 0;
  }

  if (!attackPhase(
    newPlayer,
    newEnemy,
    "Player",
    currentTurnLogs,
    localPlayerEffects,
    localEnemyEffects
  )) {
    return false;
  }

  if (!applyPoison(newPlayer, "Player", currentTurnLogs, localPlayerEffects)) {
    return false;
  }

  return newEnemy.health > 0;
};

export const enemyTurn = (
  newPlayer,
  newEnemy,
  currentTurnLogs,
  localPlayerEffects,
  localEnemyEffects
) => {
  if (!applyBurn(newEnemy, "Enemy", currentTurnLogs, localEnemyEffects)) {
    return;
  }

  applyRegeneration(newEnemy, "Enemy", currentTurnLogs);

  if (checkStun(localEnemyEffects, "Enemy", currentTurnLogs)) {
    return;
  }

  attackPhase(
    newEnemy,
    newPlayer,
    "Enemy",
    currentTurnLogs,
    localEnemyEffects,
    localPlayerEffects
  );

  applyPoison(newEnemy, "Enemy", currentTurnLogs, localEnemyEffects);
};