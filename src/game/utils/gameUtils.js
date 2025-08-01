export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getInitialStats = () => ({
  health: 500,
  regen: 5,
  armor: 5,
  minAttack: 5,
  maxAttack: 15,
  lifeSteal: 5,
  critChance: 7,
  dodge: 7,
  effects: { burn: 0, poison: 0, stun: 0 },
});

export const generateEnemy = (level) => {
  const isBoss = level % 10 === 0;

  // Dùng hàm mũ nhẹ cho scaling
  const scale = Math.pow(level, 1.25); // có thể chỉnh thành 1.2 - 1.4 tuỳ độ khó
  const random = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  if (isBoss) {
    return {
      name: `Boss Lv.${level}`,
      isBoss: true,
      health: random(200, 250) + Math.floor(scale * 10),
      armor: random(level, level * 2),
      minAttack: random(10, 15) + Math.floor(scale * 0.5),
      maxAttack: random(20, 30) + Math.floor(scale * 1),
    };
  }

  return {
    name: `Enemy Lv.${level}`,
    isBoss: false,
    health: random(80, 120) + Math.floor(scale * 3),
    armor: random(Math.floor(level / 2), level),
    minAttack: random(3, 7) + Math.floor(scale * 0.3),
    maxAttack: random(8, 15) + Math.floor(scale * 0.7),
  };
};

const upgradeConfig = {
  health: { name: "Health", value: 1000 },
  regen: { name: "Regen", value: 5 },
  minAttack: { name: "Min Attack", value: 5 },
  maxAttack: { name: "Max Attack", value: 5 },
  armor: { name: "Armor", value: 3 },
  dodge: { name: "Dodge", value: 3 },
  critChance: { name: "Crit Chance", value: 3 },
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
