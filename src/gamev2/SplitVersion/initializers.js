export const initPlayer = () => ({
  health: 1000,
  minAttack: 5,
  maxAttack: 10,
  critChance: 0.05,
  critDamage: 2,
  lifeSteal: 0.05,
  regeneration: 2,
  dodge: 0.01,
  armor: 5,
  gold: 0,
  level: 0,
  rareStats: {
    burn: 0,
    poison: 0,
    stunChance: 0,
  },
});

export const initEnemy = (level) => {
  const isBoss = level % 10 === 0;
  const baseFactor = 0.5 + Math.random() * 0.2;
  const bossMultiplier = isBoss ? 2 : 1;
  return {
    health: Math.floor(5 * level * baseFactor * bossMultiplier),
    minAttack: Math.floor(1 * level * baseFactor * bossMultiplier),
    maxAttack: Math.floor(5 * level * baseFactor * bossMultiplier),
    critChance: 0.1 * baseFactor,
    critDamage: 2 * baseFactor,
    lifeSteal: 0.1 * baseFactor,
    regeneration: Math.floor(0.1 * level * baseFactor * bossMultiplier),
    dodge: 0.01 * baseFactor,
    armor: Math.floor(1 * level * baseFactor * bossMultiplier),
    rareStats: {
      burn: Math.floor(
        0.1 * (level >= 20 ? level : 0) * baseFactor * bossMultiplier
      ),
      poison: Math.floor(
        0.1 * (level >= 20 ? level : 0) * baseFactor * bossMultiplier
      ),
      stunChance: Math.floor(0.01 * (level >= 20 ? level : 0) * baseFactor),
    },
  };
};

export const generateUpgradeOptions = (player) => {
  const stats = [
    {
      key: "health",
      name: "Health",
      basePrice: 1,
      min: 200,
      max: 500,
      format: (val) => `+${val}`,
    },
    {
      key: "minAttack",
      name: "Min Attack",
      basePrice: 10,
      min: 1,
      max: 4,
      format: (val) => `+${val}`,
    },
    {
      key: "maxAttack",
      name: "Max Attack",
      basePrice: 12,
      min: 2,
      max: 5,
      format: (val) => `+${val}`,
    },
    {
      key: "critChance",
      name: "Crit Chance",
      basePrice: 15,
      min: 1,
      max: 5,
      format: (val) => `+${val}%`,
    },
    {
      key: "critDamage",
      name: "Crit Damage",
      basePrice: 4,
      min: 10,
      max: 50,
      format: (val) => `+${val}%`,
    },
    {
      key: "lifeSteal",
      name: "Life Steal",
      basePrice: 20,
      min: 1,
      max: 5,
      format: (val) => `+${val}%`,
    },
    {
      key: "regeneration",
      name: "Regeneration",
      basePrice: 8,
      min: 2,
      max: 5,
      format: (val) => `+${val}`,
    },
    {
      key: "dodge",
      name: "Dodge",
      basePrice: 18,
      min: 1,
      max: 5,
      format: (val) => `+${val}%`,
    },
    {
      key: "armor",
      name: "Armor",
      basePrice: 6,
      min: 2,
      max: 6,
      format: (val) => `+${val}`,
    },
  ].filter(
    (stat) => stat.key !== "minAttack" || player.minAttack !== player.maxAttack
  );

  const shuffled = stats.sort(() => Math.random() - 0.5).slice(0, 3);

  return shuffled.map((stat) => {
    const value = Math.floor(
      stat.min + Math.random() * (stat.max - stat.min + 1)
    );
    const price = Math.floor(
      stat.basePrice * value * player.level + Math.random() * 100
    );

    return {
      key: stat.key,
      name: stat.name,
      value,
      format: stat.format,
      price,
    };
  });
};

export const generateRareUpgradeOptions = (player) => {
  const rareStats = [
    { key: "burn", name: "Burn", min: 5, max: 10, format: (val) => `+${val}` },
    {
      key: "poison",
      name: "Poison",
      min: 1,
      max: 3,
      format: (val) => `+${val}`,
    },
    {
      key: "stunChance",
      name: "Stun Chance",
      min: 1,
      max: 3,
      format: (val) => `+${val}%`,
    },
  ];
  const shuffled = rareStats.sort(() => Math.random() - 0.5).slice(0, 3);
  return shuffled.map((stat) => ({
    key: stat.key,
    name: stat.name,
    value: Math.floor(stat.min + Math.random() * (stat.max - stat.min + 1)),
    format: stat.format,
  }));
};
