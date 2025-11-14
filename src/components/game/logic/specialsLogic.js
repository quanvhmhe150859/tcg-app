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
  value,
  duration,
  currentTurnLogs = null
) => {
  // Thêm buff vào danh sách
  entity.buffs.push({ name, value, duration });

  // Áp dụng hiệu ứng ngay lập tức
  switch (name) {
    case "Attack":
      entity.minAttack = Math.floor(entity.minAttack * (1 + value));
      entity.maxAttack = Math.floor(entity.maxAttack * (1 + value));
      if (currentTurnLogs)
        addLog(
          `Attack increased by ${Math.round(value * 100)}%!`,
          "buff",
          currentTurnLogs
        );
      break;

    case "Armor":
      entity.armor = Math.floor(entity.armor * (1 + value));
      if (currentTurnLogs)
        addLog(
          `Armor increased by ${Math.round(value * 100)}%!`,
          "buff",
          currentTurnLogs
        );
      break;

    case "Dodge":
      entity.dodge += value;
      if (currentTurnLogs)
        addLog(`Dodge chance increased!`, "buff", currentTurnLogs);
      break;

    case "Immune":
      // Có thể đánh dấu immune ở đâu đó nếu cần
      if (currentTurnLogs) addLog(`Gained immunity!`, "buff", currentTurnLogs);
      break;

    default:
      if (currentTurnLogs)
        addLog(`${name} buff applied!`, "buff", currentTurnLogs);
  }
};

/**
 * Áp dụng debuff cho entity
 */
export const applyDebuff = (
  entity,
  name,
  value,
  duration,
  currentTurnLogs = null
) => {
  entity.debuffs.push({ name, value, duration });

  switch (name) {
    case "Attack":
      entity.minAttack = Math.floor(entity.minAttack * (1 - value));
      entity.maxAttack = Math.floor(entity.maxAttack * (1 - value));
      if (currentTurnLogs)
        addLog(
          `Enemy's attack decreased by ${Math.round(value * 100)}%!`,
          "debuff",
          currentTurnLogs
        );
      break;

    case "Armor":
      entity.armor = Math.floor(entity.armor * (1 - value));
      if (currentTurnLogs)
        addLog(
          `Armor reduced by ${Math.round(value * 100)}%!`,
          "debuff",
          currentTurnLogs
        );
      break;

    case "Death Mark":
      if (currentTurnLogs)
        addLog(`Enemy is marked for death!`, "debuff", currentTurnLogs);
      break;

    case "Berserk":
      // Berserk có thể là trạng thái đặc biệt (tăng sát thương nhưng giảm phòng thủ?)
      if (currentTurnLogs)
        addLog(`Entered Berserk state!`, "debuff", currentTurnLogs);
      break;

    default:
      if (currentTurnLogs)
        addLog(`${name} debuff applied!`, "debuff", currentTurnLogs);
  }
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
        const poisonAmount = enemy.maxHealth * 0.05;
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
