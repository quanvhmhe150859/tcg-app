export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const getInitialStats = () => ({
  health: 500,
  regen: 5,
  armor: 5,
  minAttack: 1,
  maxAttack: 10,
  lifeSteal: 15,
  critChance: 5,
  dodge: 5,
  effects: { burn: 0, poison: 0, stun: 0 }
});

export const generateEnemy = (level) => {
  const isBoss = level % 10 === 0;
  if (isBoss) {
    return {
      name: `Boss Lv.${level}`,
      health: 100 + level * 10,
      armor: 0 + level,
      minAttack: 5 + Math.floor(level * 1),
      maxAttack: 10 + Math.floor(level * 1.5),
      isBoss: true,
    };
  }

  return {
    name: `Enemy Lv.${level}`,
    health: 50 + level * 10,
    minAttack: 3 + Math.floor(level * 0.5),
    maxAttack: 5 + Math.floor(level * 1.5),
    armor: Math.floor(Math.random() * level),
    isBoss: false,
  };
};


const upgradeConfig = {
  health: { name: "Health", value: 100 },
  regen: { name: "Regen", value: 3 },
  minAttack: { name: "Min Attack", value: 3 },
  maxAttack: { name: "Max Attack", value: 3 },
  armor: { name: "Armor", value: 3 },
  dodge: { name: "Dodge", value: 3 },
  critChance: { name: "Crit Chance", value: 3 },
  lifeSteal: { name: "Life Steal", value: 5 },
};

const percentKeys = ["dodge", "lifeSteal", "critChance"];

export const upgradeOptions = Object.entries(upgradeConfig).map(([key, { name, value }]) => {
  const suffix = percentKeys.includes(key) ? "%" : "";
  return {
    key,
    value,
    label: `+${value}${suffix} ${name}`
  };
});

export const bossEffects = {
  burn: {
    name: "Burning Weapon",
    type: "burn",
    damagePerStack: 5
  },
  poison: {
    name: "Poison Blade",
    type: "poison",
    damagePerStack: 1
  },
  stun: {
    name: "Stunning Blow",
    type: "stun",
    stunChance: 0.05
  }
};

// Tự động tạo label từ thông tin gốc
export const bossEffectOptions = Object.entries(bossEffects).map(([key, effect]) => {
  let desc = "";
  if (effect.damagePerStack) desc = `${effect.damagePerStack} dmg/round`;
  if (effect.stunChance) desc = `${effect.stunChance * 100}% chance`;
  return {
    key: "effect",
    value: key,
    label: `${effect.name} (${desc})`
  };
});

export function applyStatusEffects(effects, target) {
  const log = [];
  let stunned = false;

  Object.entries(effects).forEach(([key, stacks]) => {
    if (stacks <= 0) return;

    const effect = bossEffects[key];
    if (!effect) return;

    if (effect.damagePerStack) {
      const dmg = stacks * effect.damagePerStack;
      target.health -= dmg;
      log.push({ text: `${target.name} takes ${dmg} ${key} damage.`, type: "normal" });
    }

    if (effect.stunChance && Math.random() < effect.stunChance * stacks) {
      stunned = true;
      log.push({ text: `${target.name} is stunned and skips its turn!`, type: "normal" });
    }
  });

  return { updatedTarget: target, stunned, log };
}
