// specialsLogic.js
import { addLog } from "./utils";
import { SPECIALS } from "../constants/specials";
import { receiveDamage, checkHealth, limitHealth } from "./gameLogic";
import { resetEffects } from "./initializers";

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
      const poisonAmount = enemy.maxHealth * specialData.power;
      enemy.effects.poisonBase += poisonAmount;
      enemy.effects.poisonDot += poisonAmount;
      addLog(`Enemy is poisoned!`, "poison", currentTurnLogs);
      break;
    }

    // 6. Battle Roar
    case 6: {
      const buffValue = specialData.power;
      player.buffs.push({ name: "Attack", value: buffValue, duration: 3 });
      player.minAttack = Math.floor(player.minAttack * (1 + buffValue));
      player.maxAttack = Math.floor(player.maxAttack * (1 + buffValue));
      break;
    }

    // 7. Stone Skin
    case 7: {
      const buffValue = specialData.power;
      player.buffs.push({ name: "Armor", value: buffValue, duration: 2 });
      player.armor = Math.floor(player.armor * (1 + buffValue));
      break;
    }

    case 8: {
      const buffValue = specialData.power;
      player.buffs.push({ name: "Attack", value: buffValue, duration: 1 });
      player.minAttack = Math.floor(player.minAttack * (1 + buffValue));
      player.maxAttack = Math.floor(player.maxAttack * (1 + buffValue));
      player.buffs.push({ name: "Dodge", value: buffValue, duration: 1 });
      player.dodge = player.dodge + buffValue;
      break;
    }

    // 9. Frost Nova
    case 9: {
      const frostDamage = Math.floor(player.minAttack * specialData.power);
      receiveDamage(enemy, frostDamage, "Enemy", "attack", currentTurnLogs);
      const debuffValue = specialData.power;
      enemy.debuffs.push({ name: "Attack", value: debuffValue, duration: 2 });
      enemy.minAttack = Math.floor(enemy.minAttack * (1 - debuffValue));
      enemy.maxAttack = Math.floor(enemy.maxAttack * (1 - debuffValue));
      addLog(`Enemy's attack decreased!`, "debuff", currentTurnLogs);
      break;
    }

    case 10: {
      player.effects = resetEffects(player);
      player.currentHealth = player.maxHealth;
      player.debuffs.push({ name: "Armor", value: 0.25, duration: 5 });
      player.armor = Math.floor(player.armor * (1 - 0.25));
      break;
    }

    case 11: {
      enemy.debuffs.push({ name: "Death Mark", value: null, duration: 3 });
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
      const buffValue = specialData.power;
      player.buffs.push({ name: "Immune", value: buffValue, duration: 3 });
      player.buffs.push({ name: "Armor", value: buffValue, duration: 2 });
      player.armor = Math.floor(player.armor * (1 + buffValue));
      break;
    }

    case 15: {
      const buffValue = specialData.power;
      player.buffs.push({ name: "Attack", value: buffValue, duration: 1 });
      player.minAttack = Math.floor(player.minAttack * (1 + buffValue));
      player.maxAttack = Math.floor(player.maxAttack * (1 + buffValue));
      player.debuffs.push({ name: "Berserk", value: buffValue, duration: 1 });
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
