import { addLog } from "./utils";
import { SPECIALS } from "./constants/specials";

// Hàm kiểm tra và giới hạn hồi máu không vượt quá maxHealth
const limitHealth = (entity) => {
  entity.currentHealth = Math.min(entity.currentHealth, entity.maxHealth);
};

// Hàm nhận sát thương chung
const receiveDamage = (
  entity,
  damage,
  entityName,
  damageType,
  currentTurnLogs
) => {
  let finalDamage = damage;

  // Áp dụng giáp cho sát thương attack
  if (damageType.includes("attack")) {
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
    case "attackCritical":
      logMessage = `${entityName} takes ${finalDamage} (${damage}) damage! (Critical Hit)`;
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
      logMessage = `${entityName} takes ${finalDamage} (${damage}) damage!`;
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
      isCritical ? "attackCritical" : "attack",
      currentTurnLogs
    )
  ) {
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

export const playerSpecialTurn = (
  specialId,
  newPlayer,
  newEnemy,
  currentTurnLogs
) => {
  const specialData = SPECIALS.find((s) => s.id === specialId);
  if (!specialData) return;

  addLog(`Player uses ${specialData.name}!`, "special", currentTurnLogs);

  switch (specialData.id) {
    // 1. Flame Burst
    case 1:
      const flameDamage = Math.floor(newPlayer.minAttack * specialData.power);
      receiveDamage(newEnemy, flameDamage, "Enemy", "attack", currentTurnLogs);
      // newEnemy.effects.burnDot = Math.floor(0.01 * specialData.power * newEnemy.maxHealth);
      break;

    // 2. Aqua Shield (AUTO)
    case 2:
      newPlayer.effects.shield = Math.floor(
        newPlayer.maxHealth * specialData.power
      );
      break;

    // 3. Thunder Strike
    case 3:
      const thunderDamage = Math.floor(newPlayer.minAttack * specialData.power);
      receiveDamage(
        newEnemy,
        thunderDamage,
        "Enemy",
        "attack",
        currentTurnLogs
      );
      if (Math.random() < 0.4) {
        newEnemy.effects.isStuned = true;
        addLog("Enemy is stunned for 1 turn!", "stun", currentTurnLogs);
      }
      break;

    // 4. Healing Light
    case 4:
      const healAmount = Math.floor(newPlayer.maxHealth * specialData.power);
      newPlayer.currentHealth = Math.min(
        newPlayer.currentHealth + healAmount,
        newPlayer.maxHealth
      );
      addLog(`Player heals for ${healAmount} HP!`, "heal", currentTurnLogs);
      break;

    // 5. Poison Cloud
    // case 5:
    //   newEnemy.effects.poisonBase = newEnemy.maxHealth * specialData.power;
    //   newEnemy.effects.poisonDot = newEnemy.maxHealth * specialData.power;
    //   addLog("Enemy is poisoned for 4 turns!", "poison", currentTurnLogs);
    //   break;

    // 6. Battle Roar
    // case 6:
    //   newPlayer.effects.attackBuff = specialData.power;
    //   newPlayer.effects.attackBuffTurns = 3;
    //   newPlayer.minAttack *= 1 + specialData.power;
    //   newPlayer.maxAttack *= 1 + specialData.power;
    //   break;

    // 7. Stone Skin
    // case 7:
    //   newPlayer.effects.armorBuff = specialData.power;
    //   newPlayer.effects.armorBuffTurns = 2;
    //   newPlayer.armor *= 1 + specialData.power;
    //   break;

    // 8. Shadow Step
    // case 8:
    //   newPlayer.effects.dodgeNext = true;
    //   newPlayer.effects.attackBuffNextTurn = specialData.power;
    //   addLog(
    //     "Player dodges next attack and gains attack buff!",
    //     "dodge",
    //     currentTurnLogs
    //   );
    //   break;

    // 9. Frost Nova
    case 9:
      const frostDamage = Math.floor(newPlayer.minAttack * specialData.power);
      receiveDamage(newEnemy, frostDamage, "Enemy", "attack", currentTurnLogs);
      // newEnemy.effects.slow = 0.3;
      // newEnemy.effects.slowTurns = 2;
      break;

    // 10. Divine Blessing
    // case 10:
    //   // Xóa tất cả debuff
    //   newPlayer.effects = {
    //     ...newPlayer.effects,
    //     burnDot: 0,
    //     poisonDot: 0,
    //     poisonBase: 0,
    //     isStuned: false,
    //     slow: 0,
    //     burnTurns: 0,
    //     poisonTurns: 0,
    //     slowTurns: 0,
    //   };
    //   newPlayer.effects.armorBuff = specialData.power;
    //   newPlayer.effects.armorBuffTurns = 3;
    //   newPlayer.armor *= 1 + specialData.power;
    //   break;

    // 11. Death Mark
    // case 11:
    //   newEnemy.effects.deathMark = specialData.power;
    //   newEnemy.effects.deathMarkTurns = 3;
    //   addLog("Enemy is marked for extra damage!", "debuff", currentTurnLogs);
    //   break;

    // 12. Blazing Tornado
    case 12:
      const tornadoDamage = Math.floor(newPlayer.minAttack * specialData.power);
      receiveDamage(
        newEnemy,
        tornadoDamage,
        "Enemy",
        "attack",
        currentTurnLogs
      );
      // if (Math.random() < 0.3) {
      //   newEnemy.effects.burnDot = 0.05 * newEnemy.maxHealth;
      // }
      break;

    // 13. Spirit Drain
    case 13:
      const drainHP = Math.floor(newEnemy.maxHealth * 0.2);
      newEnemy.currentHealth = Math.max(0, newEnemy.currentHealth - drainHP);
      newPlayer.currentHealth += drainHP;
      limitHealth(newPlayer);
      addLog(
        `Player drains ${drainHP} HP from enemy!`,
        "lifesteal",
        currentTurnLogs
      );
      break;

    // 14. Iron Will
    // case 14:
    //   newPlayer.effects.immunity = 2;
      // newPlayer.effects.armorBuff = specialData.power;
      // newPlayer.effects.armorBuffTurns = 2;
      // newPlayer.armor *= 1 + specialData.power;
      // break;

    // 15. Arcane Overload
    // case 15:
    //   newPlayer.effects.magicBuff = specialData.power;
    //   newPlayer.effects.magicBuffTurns = 1;
    //   newPlayer.minAttack *= 1 + specialData.power;
    //   newPlayer.maxAttack *= 1 + specialData.power;
    //   // Phản chấn
    //   const backlash = Math.floor(newPlayer.maxHealth * 0.1);
    //   newPlayer.currentHealth -= backlash;
    //   addLog(
    //     `Player takes ${backlash} backlash damage!`,
    //     "damage",
    //     currentTurnLogs
    //   );
      // break;

    // 16. Venom Fang
    case 16:
      const venomDamage = Math.floor(newPlayer.minAttack * specialData.power);
      receiveDamage(newEnemy, venomDamage, "Enemy", "attack", currentTurnLogs);
      // if (Math.random() < 0.2) {
      //   newEnemy.effects.poisonBase = newEnemy.maxHealth * 0.05; // 5% HP
      //   newEnemy.effects.poisonDot = newEnemy.maxHealth * 0.05;
      //   newEnemy.effects.poisonTurns = 3;
      //   addLog("Enemy is poisoned!", "poison", currentTurnLogs);
      // }
      break;

    // 17. Celestial Heal
    // case 17:
    //   const teamHeal = Math.floor(newPlayer.maxHealth * specialData.power);
    //   newPlayer.currentHealth = Math.min(
    //     newPlayer.currentHealth + teamHeal,
    //     newPlayer.maxHealth
    //   );
    //   // Xóa 1 debuff ngẫu nhiên
    //   const debuffs = ["burnDot", "poisonDot", "isStuned"];
    //   const randomDebuff = debuffs[Math.floor(Math.random() * debuffs.length)];
    //   if (newPlayer.effects[randomDebuff] > 0) {
    //     newPlayer.effects[randomDebuff] = 0;
    //     addLog(`Removed ${randomDebuff}!`, "buff", currentTurnLogs);
    //   }
    //   addLog(`Player team heals for ${teamHeal} HP!`, "heal", currentTurnLogs);
    //   break;

    default:
      addLog(`Coming soon special ${specialId}!`, "error", currentTurnLogs);
  }

  // Kiểm tra enemy chết sau special
  return checkHealth(newEnemy, "Enemy", currentTurnLogs);
};
