export const initPlayer = () => ({
  health: 100,
  minAttack: 10000,
  maxAttack: 10000,
  critChance: 0.2,
  critDamage: 2,
  lifeSteal: 0.3,
  regeneration: 5,
  dodge: 0.1,
  armor: 50,
  gold: 0,
  rareStats: {
    burn: 0,
    poison: 0,
    stunChance: 0,
  },
});

export const initEnemy = (level) => {
  const isBoss = level % 10 === 0;
  const baseFactor = 0.7 + Math.random() * 0.3;
  const bossMultiplier = isBoss ? 2 : 1;
  return {
    health: Math.floor(100 * level * baseFactor * bossMultiplier),
    minAttack: Math.floor(1 * level * baseFactor * bossMultiplier),
    maxAttack: Math.floor(10 * level * baseFactor * bossMultiplier),
    critChance: 0.2 * baseFactor,
    critDamage: 2 * baseFactor,
    lifeSteal: 0.3 * baseFactor,
    regeneration: Math.floor(5 * level * baseFactor * bossMultiplier),
    dodge: 0.1 * baseFactor,
    armor: Math.floor(50 * level * baseFactor * bossMultiplier),
    rareStats: {
      burn: 0,
      poison: 0,
      stunChance: 0,
    },
  };
};

export const generateUpgradeOptions = (player) => {
  const stats = [
    { key: "health", name: "Health", min: 20, max: 50, format: (val) => `+${val}` },
    { key: "minAttack", name: "Min Attack", min: 1, max: 3, format: (val) => `+${val}` },
    { key: "maxAttack", name: "Max Attack", min: 2, max: 5, format: (val) => `+${val}` },
    { key: "critChance", name: "Crit Chance", min: 1, max: 5, format: (val) => `+${val}%` },
    { key: "critDamage", name: "Crit Damage", min: 10, max: 50, format: (val) => `+${val}%` },
    { key: "lifeSteal", name: "Life Steal", min: 1, max: 5, format: (val) => `+${val}%` },
    { key: "regeneration", name: "Regeneration", min: 2, max: 5, format: (val) => `+${val}` },
    { key: "dodge", name: "Dodge", min: 1, max: 5, format: (val) => `+${val}%` },
    { key: "armor", name: "Armor", min: 10, max: 30, format: (val) => `+${val}` },
  ].filter((stat) => stat.key !== "minAttack" || player.minAttack !== player.maxAttack);
  const shuffled = stats.sort(() => Math.random() - 0.5).slice(0, 3);
  return shuffled.map((stat) => ({
    key: stat.key,
    name: stat.name,
    value: Math.floor(stat.min + Math.random() * (stat.max - stat.min + 1)),
    format: stat.format,
    price: Math.floor(50 + Math.random() * 100),
  }));
};

export const generateRareUpgradeOptions = (player) => {
  const rareStats = [
    { key: "burn", name: "Burn", min: 1, max: 3, format: (val) => `+${val}` },
    { key: "poison", name: "Poison", min: 1, max: 3, format: (val) => `+${val}` },
    { key: "stunChance", name: "Stun Chance", min: 1, max: 3, format: (val) => `+${val}%` },
  ];
  const shuffled = rareStats.sort(() => Math.random() - 0.5).slice(0, 3);
  return shuffled.map((stat) => ({
    key: stat.key,
    name: stat.name,
    value: Math.floor(stat.min + Math.random() * (stat.max - stat.min + 1)),
    format: stat.format,
  }));
};