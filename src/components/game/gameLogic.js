import { addLog } from "./utils";
import { SPECIALS } from "./constants/specials";

export const startTurn = (turn, level, currentTurnLogs) => {
  addLog(`Turn ${turn}`, "turn", currentTurnLogs);
};

// Hàm kiểm tra và giới hạn hồi máu không vượt quá maxHealth
const limitHealth = (entity) => {
  entity.currentHealth = Math.min(entity.currentHealth, entity.maxHealth);
};

// Hàm giảm duration của buffs/debuffs và khôi phục stats khi hết thời gian
const applyBuffDebuffDecay = (entity, entityName, currentTurnLogs) => {
  // Xử lý buffs
  if (entity.buffs && entity.buffs.length > 0) {
    entity.buffs = entity.buffs.filter(buff => {
      buff.duration -= 1;

      if (buff.duration < 0) {
        // Hủy hiệu ứng khi hết thời gian
        switch (buff.name) {
          case "Attack":
            entity.minAttack = Math.floor(entity.minAttack / (1 + buff.value));
            entity.maxAttack = Math.floor(entity.maxAttack / (1 + buff.value));
            addLog(
              `${entityName}'s attack boost has expired!`,
              "buffExpire",
              currentTurnLogs
            );
            break;
            case "Armor":
            entity.armor = Math.floor(entity.armor / (1 + buff.value));
            addLog(
              `${entityName}'s armor boost has expired!`,
              "buffExpire",
              currentTurnLogs
            );
            break;
        }
        return false; // Xóa buff
      }
      return true; // Giữ buff
    });
  }

  // Xử lý debuffs
  if (entity.debuffs && entity.debuffs.length > 0) {
    entity.debuffs = entity.debuffs.filter(debuff => {
      debuff.duration -= 1;

      if (debuff.duration < 0) {
        // Hủy debuff khi hết thời gian
        switch (debuff.name) {
          case "Attack":
            entity.minAttack = Math.floor(entity.minAttack / (1 - debuff.value));
            entity.maxAttack = Math.floor(entity.maxAttack / (1 - debuff.value));
            addLog(
              `${entityName}'s attack debuff has expired!`,
              "debuffExpire",
              currentTurnLogs
            );
            break;
        }
        return false;
      }
      return true;
    });
  }
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

const checkHealth = (entity, entityName, currentTurnLogs) => {
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

const applyDodge = (defender, attackerName, currentTurnLogs) => {
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

const calculateCrit = (attacker, baseDamage) => {
  const isCritical = Math.random() < attacker.critChance;
  return {
    damage: isCritical
      ? Math.floor(baseDamage * attacker.critDamage)
      : baseDamage,
    isCritical,
  };
};

const applyArmor = (defender, preArmorDamage) => {
  return Math.floor(preArmorDamage * (100 / (100 + defender.armor)));
};

const applyThorn = (
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

const applyLifeSteal = (
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

const applyStun = (
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

const applyBurnEffect = (attacker, defender) => {
  if (attacker.rareStats.burn > 0 && attacker.effects.isBurnAttack) {
    defender.effects.burnDot += attacker.rareStats.burn;
    attacker.effects.isBurnAttack = false;
    return true;
  }
  return false;
};

const applyPoisonEffect = (attacker, defender) => {
  if (attacker.rareStats.poison > 0 && attacker.effects.isPoisonAttack) {
    defender.effects.poisonBase += attacker.rareStats.poison;
    defender.effects.poisonDot += attacker.rareStats.poison;
    attacker.effects.isPoisonAttack = false;
    return true;
  }
  return false;
};

const applyCounterattack = (
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

const applySwiftness = (
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

const attackPhase = (
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

const applyBurn = (entity, entityName, currentTurnLogs) => {
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

const applyPoison = (entity, entityName, currentTurnLogs) => {
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

const applyRegeneration = (entity, entityName, currentTurnLogs) => {
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

const checkStun = (entity, entityName, currentTurnLogs) => {
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
  // Giảm duration buffs/debuffs sau lượt player
  applyBuffDebuffDecay(newPlayer, "Player", currentTurnLogs);

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
  // Giảm duration buffs/debuffs sau lượt enemy
  applyBuffDebuffDecay(newEnemy, "Enemy", currentTurnLogs);

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
      newEnemy.effects.burnDot += Math.floor(0.01 * specialData.power * newEnemy.maxHealth);
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
      break;

    // 5. Poison Cloud
    case 5:
      newEnemy.effects.poisonBase += newEnemy.maxHealth * specialData.power;
      newEnemy.effects.poisonDot += newEnemy.maxHealth * specialData.power;
      break;

    // 6. Battle Roar
    case 6:
      newPlayer.buffs.push({ name: "Attack", value: specialData.power, duration: 3 });
      newPlayer.minAttack = Math.floor(newPlayer.minAttack * (1 + specialData.power));
      newPlayer.maxAttack = Math.floor(newPlayer.maxAttack * (1 + specialData.power));
      break;

    // 7. Stone Skin
    case 7:
      newPlayer.buffs.push({ name: "Armor", value: specialData.power, duration: 2 });
      newPlayer.armor = Math.floor(newPlayer.armor * (1 + specialData.power));
      break;

    // 9. Frost Nova
    case 9:
      const frostDamage = Math.floor(newPlayer.minAttack * specialData.power);
      receiveDamage(newEnemy, frostDamage, "Enemy", "attack", currentTurnLogs);
      newEnemy.debuffs.push({ name: "Attack", value: specialData.power, duration: 2 });
      newEnemy.minAttack = Math.floor(newEnemy.minAttack * (1 - specialData.power));
      newEnemy.maxAttack = Math.floor(newEnemy.maxAttack * (1 - specialData.power));
      break;

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
      if (Math.random() < 0.3) {
        newEnemy.effects.burnDot += 0.05 * newEnemy.maxHealth;
      }
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

    // 16. Venom Fang
    case 16:
      const venomDamage = Math.floor(newPlayer.minAttack * specialData.power);
      receiveDamage(newEnemy, venomDamage, "Enemy", "attack", currentTurnLogs);
      if (Math.random() < 0.2) {
        newEnemy.effects.poisonBase += newEnemy.maxHealth * 0.05;
        newEnemy.effects.poisonDot += newEnemy.maxHealth * 0.05;
      }
      break;

    default:
      addLog(`Coming soon special ${specialId}!`, "error", currentTurnLogs);
  }

  // Kiểm tra enemy chết sau special
  return checkHealth(newEnemy, "Enemy", currentTurnLogs);
};
