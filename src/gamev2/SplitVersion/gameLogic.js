import { addLog, checkGameOver, startTurn } from "./utils";

// Hàm kiểm tra và giới hạn hồi máu không vượt quá maxHealth
const limitHealth = (entity) => {
  entity.currentHealth = Math.min(entity.currentHealth, entity.maxHealth);
};

export const checkHealth = (entity, entityName, currentTurnLogs) => {
  if (entity.currentHealth <= 0) {
    // addLog(`${entityName} has been defeated!`, "defeated", currentTurnLogs);
    // Reset effects khi entity bị hạ gục
    entity.effects = {
      burnDot: 0,
      poisonDot: 0,
      poisonBase: 0,
      isStuned: false
    };
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
    attacker.currentHealth = Math.max(0, attacker.currentHealth - thornDamage);
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
      attacker.currentHealth += healthRestored;
      limitHealth(attacker); // Giới hạn currentHealth không vượt quá maxHealth
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

export const applyStun = (attacker, defender, attackerName, currentTurnLogs) => {
  if (Math.random() < attacker.rareStats.stunChance) {
    defender.effects.isStuned = true;
    addLog(
      `${attackerName === "Player" ? "Enemy" : "Player"} is stunned!`,
      "stun",
      currentTurnLogs
    );
    return true;
  }
  return false;
};

export const applyBurnEffect = (attacker, defender) => {
  if (attacker.rareStats.burn > 0) {
    defender.effects.burnDot = attacker.rareStats.burn;
    return true;
  }
  return false;
};

export const applyPoisonEffect = (attacker, defender) => {
  if (attacker.rareStats.poison > 0 && defender.effects.poisonBase === 0) {
    defender.effects.poisonBase = attacker.rareStats.poison;
    defender.effects.poisonDot = attacker.rareStats.poison;
    return true;
  }
  return false;
};

export const applyCounterattack = (
  attacker,
  defender,
  attackerName,
  currentTurnLogs,
  isCounterattack = false
) => {
  if (
    !isCounterattack &&
    defender.rareStats.counterattack > 0 &&
    Math.random() < defender.rareStats.counterattack &&
    !defender.effects.isStuned
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

  defender.currentHealth = Math.max(0, defender.currentHealth - finalDamage);
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
  applyStun(attacker, defender, attackerName, currentTurnLogs);
  applyBurnEffect(attacker, defender);
  applyPoisonEffect(attacker, defender);
  if (!applyCounterattack(attacker, defender, attackerName, currentTurnLogs, isCounterattack)) {
    return false;
  }

  return true;
};

export const applyBurn = (entity, entityName, currentTurnLogs) => {
  if (entity.effects.burnDot > 0) {
    const damage = entity.effects.burnDot;
    entity.currentHealth = Math.max(0, entity.currentHealth - damage);
    addLog(`${entityName} takes ${damage} burn damage!`, "burn", currentTurnLogs);
    return checkHealth(entity, entityName, currentTurnLogs);
  }
  return true;
};

export const applyPoison = (entity, entityName, currentTurnLogs) => {
  if (entity.effects.poisonDot > 0) {
    const damage = entity.effects.poisonDot;
    entity.currentHealth = Math.max(0, entity.currentHealth - damage);
    addLog(`${entityName} takes ${damage} poison damage!`, "poison", currentTurnLogs);
    entity.effects.poisonDot += entity.effects.poisonBase;
    return checkHealth(entity, entityName, currentTurnLogs);
  }
  return true;
};

export const applyRegeneration = (entity, entityName, currentTurnLogs) => {
  if (entity.regeneration > 0) {
    entity.currentHealth += entity.regeneration;
    limitHealth(entity); // Giới hạn currentHealth không vượt quá maxHealth
    addLog(
      `${entityName} regenerates ${entity.regeneration} health!`,
      "regeneration",
      currentTurnLogs
    );
    return true;
  }
  return false;
};

export const checkStun = (entity, entityName, currentTurnLogs) => {
  if (entity.effects.isStuned) {
    addLog(`${entityName} is stunned and misses the turn!`, "stun", currentTurnLogs);
    entity.effects.isStuned = false;
    return true;
  }
  return false;
};

export const playerTurn = (
  newPlayer,
  newEnemy,
  currentTurnLogs
) => {
  if (!applyBurn(newPlayer, "Player", currentTurnLogs)) {
    return false;
  }

  applyRegeneration(newPlayer, "Player", currentTurnLogs);

  if (checkStun(newPlayer, "Player", currentTurnLogs)) {
    return newEnemy.currentHealth > 0;
  }

  if (!attackPhase(
    newPlayer,
    newEnemy,
    "Player",
    currentTurnLogs
  )) {
    return false;
  }

  if (!applyPoison(newPlayer, "Player", currentTurnLogs)) {
    return false;
  }

  return newEnemy.currentHealth > 0;
};

export const enemyTurn = (
  newPlayer,
  newEnemy,
  currentTurnLogs
) => {
  if (!applyBurn(newEnemy, "Enemy", currentTurnLogs)) {
    return;
  }

  applyRegeneration(newEnemy, "Enemy", currentTurnLogs);

  if (checkStun(newEnemy, "Enemy", currentTurnLogs)) {
    return;
  }

  attackPhase(
    newEnemy,
    newPlayer,
    "Enemy",
    currentTurnLogs
  );

  applyPoison(newEnemy, "Enemy", currentTurnLogs);
};