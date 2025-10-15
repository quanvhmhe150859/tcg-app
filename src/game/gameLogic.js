import { addLog, checkGameOver, startTurn } from "./utils";

// Hàm kiểm tra và giới hạn hồi máu không vượt quá maxHealth
const limitHealth = (entity) => {
  entity.currentHealth = Math.min(entity.currentHealth, entity.maxHealth);
};

// Hàm nhận sát thương chung
const receiveDamage = (entity, damage, entityName, damageType, currentTurnLogs) => {
  let finalDamage = damage;

  // Áp dụng giáp cho sát thương attack
  if (damageType === "attack") {
    finalDamage = applyArmor(entity, damage);
  }

  // Kiểm tra barrier (bỏ qua cho poison)
  if (entity.effects.barrier > 0) {
    entity.effects.barrier -= 1;
    addLog(
      `${entityName}'s barrier absorbs the damage!`,
      "barrier",
      currentTurnLogs
    );
    return checkHealth(entity, entityName, currentTurnLogs);
  }

  // Kiểm tra shield (bỏ qua cho poison)
  if (damageType !== "poison" && entity.effects.shield > 0) {
    if (entity.effects.shield >= finalDamage) {
      entity.effects.shield -= finalDamage;
      addLog(
        `${entityName}'s shield absorbs ${finalDamage} damage!`,
        "shield",
        currentTurnLogs
      );
      return checkHealth(entity, entityName, currentTurnLogs);
    } else {
      finalDamage -= entity.effects.shield;
      addLog(
        `${entityName}'s shield absorbs ${entity.effects.shield} damage!`,
        "shield",
        currentTurnLogs
      );
      entity.effects.shield = 0;
    }
  }

  // Trừ sát thương vào máu
  entity.currentHealth = Math.max(0, entity.currentHealth - finalDamage);

  let logMessage;
  switch (damageType) {
    case "attack":
      logMessage = `${entityName} takes ${finalDamage} (${damage}) damage!`;
      break;
    case "burn":
      logMessage = `${entityName} takes ${finalDamage} burn damage!`;
      break;
    case "poison":
      logMessage = `${entityName} takes ${finalDamage} poison damage!`;
      break;
    case "thorn":
      logMessage = `${entityName} takes ${finalDamage} thorn damage!`;
      break;
    default:
      logMessage = `${entityName} takes ${finalDamage} damage!`;
  }

  addLog(logMessage, damageType, currentTurnLogs);
  return checkHealth(entity, entityName, currentTurnLogs);
};

export const checkHealth = (entity, entityName, currentTurnLogs) => {
  if (entity.currentHealth <= 0) {
    entity.effects = {
      burnDot: 0,
      poisonDot: 0,
      poisonBase: 0,
      isStuned: false,
      shield: 0,
      barrier: 0,
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
    damage: isCritical
      ? Math.floor(baseDamage * attacker.critDamage)
      : baseDamage,
    isCritical,
  };
};

export const applyArmor = (defender, preArmorDamage) => {
  return Math.floor(preArmorDamage * (100 / (100 + defender.armor)));
};

export const applyThorn = (
  attacker,
  defender,
  attackerName,
  currentTurnLogs
) => {
  if (defender.rareStats.thorn > 0) {
    return receiveDamage(
      attacker,
      defender.rareStats.thorn,
      attackerName,
      "thorn",
      currentTurnLogs
    );
  }
  return true;
};

export const applyLifeSteal = (
  attacker,
  attackerName,
  finalDamage,
  currentTurnLogs
) => {
  if (attacker.lifeSteal > 0 && finalDamage > 0) {
    const healthRestored = Math.floor(finalDamage * attacker.lifeSteal);
    if (healthRestored > 0) {
      attacker.currentHealth += healthRestored;
      limitHealth(attacker);
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

export const applyStun = (
  attacker,
  defender,
  attackerName,
  currentTurnLogs
) => {
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

export const applySwiftness = (
  attacker,
  defender,
  attackerName,
  currentTurnLogs,
  isSwiftnessAttack = false
) => {
  if (
    !isSwiftnessAttack &&
    attacker.rareStats.swiftness > 0 &&
    Math.random() < attacker.rareStats.swiftness &&
    !attacker.effects.isStuned
  ) {
    addLog(
      `${attackerName} swiftly attacks again!`,
      "swiftness",
      currentTurnLogs
    );
    attackPhase(attacker, defender, attackerName, currentTurnLogs, true);
    return checkHealth(
      defender,
      attackerName === "Player" ? "Enemy" : "Player",
      currentTurnLogs
    );
  }
  return true;
};

export const attackPhase = (
  attacker,
  defender,
  attackerName,
  currentTurnLogs,
  isCounterattack = false,
  isSwiftnessAttack = false
) => {
  if (applyDodge(defender, attackerName, currentTurnLogs)) {
    return true;
  }

  const baseDamage =
    Math.floor(Math.random() * (attacker.maxAttack - attacker.minAttack + 1)) +
    attacker.minAttack;
  const { damage: preArmorDamage, isCritical } = calculateCrit(
    attacker,
    baseDamage
  );

  if (
    !receiveDamage(
      defender,
      preArmorDamage,
      attackerName === "Player" ? "Enemy" : "Player",
      "attack",
      currentTurnLogs
    )
  ) {
    addLog(
      `${attackerName} deals ${preArmorDamage} damage to ${
        attackerName === "Player" ? "Enemy" : "Player"
      }!${isCritical ? " (Critical Hit)" : ""}`,
      isCritical ? "attackCritical" : "",
      currentTurnLogs
    );
    return false;
  }

  if (!applyThorn(attacker, defender, attackerName, currentTurnLogs)) {
    return false;
  }

  applyLifeSteal(attacker, attackerName, preArmorDamage, currentTurnLogs);

  applyStun(attacker, defender, attackerName, currentTurnLogs);
  applyBurnEffect(attacker, defender);
  applyPoisonEffect(attacker, defender);
  if (
    !applyCounterattack(
      attacker,
      defender,
      attackerName,
      currentTurnLogs,
      isCounterattack
    )
  ) {
    return false;
  }

  return true;
};

export const applyBurn = (entity, entityName, currentTurnLogs) => {
  if (entity.effects.burnDot > 0) {
    return receiveDamage(
      entity,
      entity.effects.burnDot,
      entityName,
      "burn",
      currentTurnLogs
    );
  }
  return true;
};

export const applyPoison = (entity, entityName, currentTurnLogs) => {
  if (entity.effects.poisonDot > 0) {
    const damage = entity.effects.poisonDot;
    const result = receiveDamage(
      entity,
      damage,
      entityName,
      "poison",
      currentTurnLogs
    );
    entity.effects.poisonDot += entity.effects.poisonBase;
    return result;
  }
  return true;
};

export const applyRegeneration = (entity, entityName, currentTurnLogs) => {
  if (entity.regeneration > 0) {
    entity.currentHealth += entity.regeneration;
    limitHealth(entity);
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
    addLog(
      `${entityName} is stunned and misses the turn!`,
      "stun",
      currentTurnLogs
    );
    entity.effects.isStuned = false;
    return true;
  }
  return false;
};

export const playerTurn = (newPlayer, newEnemy, currentTurnLogs) => {
  if (!applyBurn(newPlayer, "Player", currentTurnLogs)) {
    return false;
  }

  applyRegeneration(newPlayer, "Player", currentTurnLogs);

  if (checkStun(newPlayer, "Player", currentTurnLogs)) {
    return newEnemy.currentHealth > 0;
  }

  if (!attackPhase(newPlayer, newEnemy, "Player", currentTurnLogs)) {
    return false;
  }

  if (!applySwiftness(newPlayer, newEnemy, "Player", currentTurnLogs)) {
    return false;
  }

  if (!applyPoison(newPlayer, "Player", currentTurnLogs)) {
    return false;
  }

  return newEnemy.currentHealth > 0;
};

export const enemyTurn = (newPlayer, newEnemy, currentTurnLogs) => {
  if (!applyBurn(newEnemy, "Enemy", currentTurnLogs)) {
    return;
  }

  applyRegeneration(newEnemy, "Enemy", currentTurnLogs);

  if (checkStun(newEnemy, "Enemy", currentTurnLogs)) {
    return;
  }

  attackPhase(newEnemy, newPlayer, "Enemy", currentTurnLogs);

  if (!applySwiftness(newEnemy, newPlayer, "Enemy", currentTurnLogs)) {
    return;
  }

  applyPoison(newEnemy, "Enemy", currentTurnLogs);
};