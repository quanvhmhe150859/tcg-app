import { addLog } from "./utils";
import { SPECIALS } from "../constants/specials";
import { receiveDamage, checkHealth, limitHealth } from "./gameLogic";
import { resetEffects } from "./initializers";

/**
 * Áp dụng buff cho entity (player hoặc enemy)
 */
export const applyBuff = (
  entity,
  name,
  value, // value là decimal: 0.3 = +30%
  duration,
  currentTurnLogs = null
) => {
  let appliedMin = 0;
  let appliedMax = 0;

  switch (name) {
    case "Attack":
      {
        const oldMin = entity.minAttack || entity.attack || 0;
        const oldMax = entity.maxAttack || entity.attack || 0;

        entity.minAttack = Math.floor(oldMin * (1 + value));
        entity.maxAttack = Math.floor(oldMax * (1 + value));

        appliedMin = entity.minAttack - oldMin;
        appliedMax = entity.maxAttack - oldMax;

        if (currentTurnLogs) {
          addLog(
            `Attack +${Math.round(value * 100)}% !`,
            "buff",
            currentTurnLogs
          );
        }
      }
      break;

    case "Armor":
      {
        const oldArmor = entity.armor || 0;
        entity.armor = Math.floor(oldArmor * (1 + value));
        appliedMin = appliedMax = entity.armor - oldArmor; // armor dùng chung
        if (currentTurnLogs)
          addLog(
            `Armor +${Math.round(value * 100)}% !`,
            "buff",
            currentTurnLogs
          );
      }
      break;

    case "Dodge":
      {
        const oldDodge = entity.dodge || 0;
        entity.dodge = oldDodge + value;
        appliedMin = appliedMax = value; // dodge là % cố định
        if (currentTurnLogs)
          addLog(
            `Dodge chance +${Math.round(value * 100)}%!`,
            "buff",
            currentTurnLogs
          );
      }
      break;

    case "Immune":
      appliedMin = appliedMax = 1;
      if (currentTurnLogs) addLog(`Gained immunity!`, "buff", currentTurnLogs);
      break;

    default:
      if (currentTurnLogs)
        addLog(`${name} buff applied!`, "buff", currentTurnLogs);
  }

  // Lưu cả 2 giá trị đã tăng cho min và max
  entity.buffs.push({
    name,
    value, // % gốc để hiển thị
    appliedMin, // ← chính xác cho minAttack
    appliedMax, // ← chính xác cho maxAttack
    duration,
  });
};

/**
 * Áp dụng debuff cho entity
 */
export const applyDebuff = (
  entity,
  name,
  value, // value là decimal: 0.3 = -30%
  duration,
  currentTurnLogs = null
) => {
  let appliedMin = 0;
  let appliedMax = 0;

  switch (name) {
    case "Attack":
      {
        const oldMin = entity.minAttack || entity.attack || 0;
        const oldMax = entity.maxAttack || entity.attack || 0;

        entity.minAttack = Math.floor(oldMin * (1 - value));
        entity.maxAttack = Math.floor(oldMax * (1 - value));

        appliedMin = oldMin - entity.minAttack; // lưu lại bao nhiêu đã bị giảm
        appliedMax = oldMax - entity.maxAttack;

        if (currentTurnLogs) {
          addLog(
            `Attack -${Math.round(value * 100)}% (${oldMin}-${oldMax} → ${
              entity.minAttack
            }-${entity.maxAttack})!`,
            "debuff",
            currentTurnLogs
          );
        }
      }
      break;

    case "Armor":
      {
        const oldArmor = entity.armor || 0;
        entity.armor = Math.floor(oldArmor * (1 - value));
        appliedMin = appliedMax = oldArmor - entity.armor;

        if (currentTurnLogs) {
          addLog(
            `Armor -${Math.round(value * 100)}% (${oldArmor} → ${
              entity.armor
            })!`,
            "debuff",
            currentTurnLogs
          );
        }
      }
      break;

    case "Death Mark":
      appliedMin = appliedMax = 1; // chỉ đánh dấu
      if (currentTurnLogs)
        addLog(
          `Marked for death! (+50% damage taken)`,
          "debuff",
          currentTurnLogs
        );
      break;

    case "Berserk":
      // Ví dụ: Berserk tăng attack nhưng giảm armor → xử lý riêng nếu cần
      if (currentTurnLogs)
        addLog(`Entered Berserk state!`, "debuff", currentTurnLogs);
      break;

    default:
      if (currentTurnLogs)
        addLog(`${name} debuff applied!`, "debuff", currentTurnLogs);
  }

  // Lưu vào debuffs
  entity.debuffs.push({
    name,
    value, // % gốc để hiển thị
    appliedMin, // giá trị thực tế đã giảm ở min
    appliedMax, // giá trị thực tế đã giảm ở max
    duration,
  });
};

// Hàm xử lý special riêng biệt
export const applySpecial = (specialId, player, enemy, currentTurnLogs) => {
  const specialData = SPECIALS.find((s) => s.id === specialId);
  if (!specialData) {
    addLog(`Unknown special ID: ${specialId}`, "error", currentTurnLogs);
    return true;
  }

  addLog(`Player uses ${specialData.name}!`, "special", currentTurnLogs);

  switch (specialData.id) {
    // 1. Flame Burst
    case 1: {
      const flameDamage = Math.floor(player.minAttack * specialData.power);
      receiveDamage(enemy, flameDamage, "Enemy", "attack", currentTurnLogs);
      const burnDot = Math.floor(0.01 * specialData.power * enemy.maxHealth);
      enemy.effects.burnDot += burnDot;
      break;
    }

    // 2. Aqua Shield (AUTO)
    case 2: {
      const shieldAmount = Math.floor(player.maxHealth * specialData.power);
      player.effects.shield = shieldAmount;
      addLog(`Player gains ${shieldAmount} shield!`, "shield", currentTurnLogs);
      break;
    }

    // 3. Thunder Strike
    case 3: {
      const thunderDamage = Math.floor(player.minAttack * specialData.power);
      receiveDamage(enemy, thunderDamage, "Enemy", "attack", currentTurnLogs);
      if (Math.random() < 0.4) {
        enemy.effects.isStuned = true;
        addLog("Enemy is stunned for 1 turn!", "stun", currentTurnLogs);
      }
      break;
    }

    // 4. Healing Light
    case 4: {
      const healAmount = Math.floor(player.maxHealth * specialData.power);
      player.currentHealth = Math.min(
        player.currentHealth + healAmount,
        player.maxHealth
      );
      addLog(`Player heals for ${healAmount} HP!`, "heal", currentTurnLogs);
      break;
    }

    // 5. Poison Cloud
    case 5: {
      const poisonAmount = Math.floor(enemy.maxHealth * specialData.power);
      enemy.effects.poisonBase += poisonAmount;
      enemy.effects.poisonDot += poisonAmount;
      addLog(`Enemy is poisoned!`, "poison", currentTurnLogs);
      break;
    }

    // 6. Battle Roar
    case 6: {
      applyBuff(player, "Attack", specialData.power, 3, currentTurnLogs);
      break;
    }

    // 7. Stone Skin
    case 7: {
      applyBuff(player, "Armor", specialData.power, 2, currentTurnLogs);
      break;
    }

    case 8: {
      applyBuff(player, "Attack", specialData.power, 1, currentTurnLogs);
      applyBuff(player, "Dodge", specialData.power, 1, currentTurnLogs);
      break;
    }

    // 9. Frost Nova
    case 9: {
      const frostDamage = Math.floor(player.minAttack * specialData.power);
      receiveDamage(enemy, frostDamage, "Enemy", "attack", currentTurnLogs);
      applyDebuff(enemy, "Attack", specialData.power, 2, currentTurnLogs);
      break;
    }

    case 10: {
      player.effects = resetEffects(player);
      player.currentHealth = player.maxHealth;
      applyDebuff(player, "Armor", 0.25, 5, currentTurnLogs);
      break;
    }

    case 11: {
      applyDebuff(enemy, "Death Mark", null, 3, currentTurnLogs);
      break;
    }

    // 12. Blazing Tornado
    case 12: {
      const tornadoDamage = Math.floor(player.minAttack * specialData.power);
      receiveDamage(enemy, tornadoDamage, "Enemy", "attack", currentTurnLogs);
      if (Math.random() < 0.3) {
        const burnDot = Math.floor(0.05 * enemy.maxHealth);
        enemy.effects.burnDot += burnDot;
        addLog(`Enemy is burning from tornado!`, "burn", currentTurnLogs);
      }
      break;
    }

    // 13. Spirit Drain
    case 13: {
      const drainHP = Math.floor(enemy.maxHealth * 0.2);
      enemy.currentHealth = Math.max(0, enemy.currentHealth - drainHP);
      player.currentHealth += drainHP;
      limitHealth(player);
      addLog(
        `Player drains ${drainHP} HP from enemy!`,
        "lifesteal",
        currentTurnLogs
      );
      break;
    }

    case 14: {
      applyBuff(player, "Immune", specialData.power, 3, currentTurnLogs);
      applyBuff(player, "Armor", specialData.power, 2, currentTurnLogs);
      break;
    }

    case 15: {
      applyBuff(player, "Attack", specialData.power, 1, currentTurnLogs);
      applyDebuff(player, "Berserk", specialData.power, 1, currentTurnLogs);
      break;
    }

    // 16. Venom Fang
    case 16: {
      const venomDamage = Math.floor(player.minAttack * specialData.power);
      receiveDamage(enemy, venomDamage, "Enemy", "attack", currentTurnLogs);
      if (Math.random() < 0.2) {
        const poisonAmount = Math.floor(enemy.maxHealth * 0.05);
        enemy.effects.poisonBase += poisonAmount;
        enemy.effects.poisonDot += poisonAmount;
        addLog(`Enemy is poisoned by venom!`, "poison", currentTurnLogs);
      }
      break;
    }

    case 17: {
      const healAmount = Math.floor(player.maxHealth * specialData.power);
      player.currentHealth = Math.min(
        player.currentHealth + healAmount,
        player.maxHealth
      );
      addLog(`Player heals for ${healAmount} HP!`, "heal", currentTurnLogs);
      player.effects.burnDot = 0;
      player.effects.poisonBase = 0;
      player.effects.poisonDot = 0;
      player.effects.isStuned = false;
      break;
    }

    default:
      addLog(
        `Special "${specialData.name}" is not implemented yet!`,
        "error",
        currentTurnLogs
      );
  }

  // Kiểm tra enemy còn sống không sau special
  return checkHealth(enemy, "Enemy", currentTurnLogs);
};
