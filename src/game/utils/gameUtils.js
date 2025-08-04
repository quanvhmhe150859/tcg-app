export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getInitialStats = () => ({
  health: 1000,
  regen: 5,
  armor: 5,
  minAttack: 5,
  maxAttack: 15,
  lifeSteal: 5,
  critChance: 5,
  dodge: 5,
  gold: 0,
  effects: { burn: 0, poison: 0, stun: 0 },
});

export const generateEnemy = (level) => {
  const isBoss = level % 10 === 0;
  const scale = Math.pow(level, 1.4);
  const random = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const name = `${isBoss ? "Boss" : "Enemy"} Lv.${level}`;

  const baseHealth = isBoss ? random(200, 250) : random(80, 120);
  const health = isBoss
    ? baseHealth + Math.floor(scale * 10)
    : baseHealth + Math.floor(scale * 3);

  const armor = isBoss
    ? random(level, level * 2)
    : random(Math.floor(level / 2), level);

  const baseMinAtk = isBoss ? random(10, 15) : random(3, 7);
  const minAttack = baseMinAtk + Math.floor(scale * (isBoss ? 0.5 : 0.3));

  const baseMaxAtk = isBoss ? random(20, 30) : random(8, 15);
  const maxAttack = baseMaxAtk + Math.floor(scale * (isBoss ? 1 : 0.7));

  const baseGold = isBoss ? random(40, 60) : random(10, 20);
  const goldReward = baseGold + Math.floor(scale * (isBoss ? 2 : 1));

  return {
    name,
    isBoss,
    health,
    armor,
    minAttack,
    maxAttack,
    goldReward,
  };
};

const upgradeConfig = {
  health: { name: "Health", value: 1000 },
  regen: { name: "Regen", value: 5 },
  minAttack: { name: "Min Attack", value: 5 },
  maxAttack: { name: "Max Attack", value: 5 },
  armor: { name: "Armor", value: 5 },
  dodge: { name: "Dodge", value: 5 },
  critChance: { name: "Crit Chance", value: 5 },
  lifeSteal: { name: "Life Steal", value: 5 },
};

const percentKeys = ["dodge", "lifeSteal", "critChance"];

export const upgradeOptions = Object.entries(upgradeConfig).map(
  ([key, { name, value }]) => {
    const suffix = percentKeys.includes(key) ? "%" : "";
    return {
      key,
      value,
      label: `+${value}${suffix} ${name}`,
    };
  }
);

export const bossEffects = {
  burn: {
    name: "Burning Weapon",
    type: "burn",
    damagePerStack: 5,
  },
  poison: {
    name: "Poison Blade",
    type: "poison",
    damagePerStack: 1,
  },
  stun: {
    name: "Stunning Blow",
    type: "stun",
    stunChance: 0.05,
  },
};

// Tự động tạo label từ thông tin gốc
export const bossEffectOptions = Object.entries(bossEffects).map(
  ([key, effect]) => {
    let desc = "";
    if (effect.damagePerStack) desc = `${effect.damagePerStack} dmg/round`;
    if (effect.stunChance) desc = `${effect.stunChance * 100}% chance`;
    return {
      key: "effect",
      value: key,
      label: `${effect.name} (${desc})`,
    };
  }
);

export function applyStatusEffects(effects, target, turn = 1) {
  const log = [];
  let stunned = false;

  Object.entries(effects).forEach(([key, stacks]) => {
    if (stacks <= 0) return;

    const effect = bossEffects[key];
    if (!effect) return;

    let dmg = stacks * effect.damagePerStack;

    // Áp dụng cộng dồn theo turn nếu là poison
    if (key === "poison") {
      dmg *= turn;
    }

    if (effect.damagePerStack) {
      target.health -= dmg;
      log.push({
        text: `${target.name} takes ${dmg} ${key} damage.`,
        type: "normal",
      });
    }

    if (effect.stunChance && Math.random() < effect.stunChance * stacks) {
      stunned = true;
      log.push({
        text: `${target.name} is stunned and skips its turn!`,
        type: "normal",
      });
    }
  });

  return { updatedTarget: target, stunned, log };
}

export const applyDamage = (target, damage) => {
  const result = { ...target };
  const reductionRatio = 100 / (100 + target.armor);
  const effectiveDamage = Math.ceil(damage * reductionRatio);
  result.health -= effectiveDamage;
  return result;
};

export const didDodge = (dodgeChance) => Math.random() * 100 < dodgeChance;
