import { CHARACTER_STATS } from "./constants/characterStats";

export const resetEffects = (entity) => {
  return {
    burnDot: 0,
    poisonBase: 0,
    poisonDot: 0,
    isStuned: false,
    shield: entity?.rareStats?.shield || 0,
    barrier: entity?.rareStats?.barrier || 0,
  };
};

export const initPlayer = (characterKey) => {
  const basePlayer = {
    level: 1,
    maxHealth: 1000,
    currentHealth: 1000,
    regeneration: 2,
    armor: 5,
    minAttack: 5,
    maxAttack: 10,
    critChance: 0.05,
    critDamage: 1.5,
    lifeSteal: 0.05,
    dodge: 0.01,
    gold: 0,
    rareStats: {
      burn: 0,
      poison: 0,
      thorn: 0,
      stunChance: 0,
      counterattack: 0,
      swiftness: 0,
      shield: 0,
      barrier: 0,
    },
  };

  if (!characterKey) {
    return {
      ...basePlayer,
      effects: resetEffects(basePlayer),
    };
  }

  // Extract character and variant (e.g., "alberon/holy_king" or "agathe")
  const [baseCharacter, variant = "default"] = characterKey.split("/");

  // Get character stats from CHARACTER_STATS
  const characterStats = CHARACTER_STATS[baseCharacter]?.[variant];

  if (!characterStats) {
    return {
      ...basePlayer,
      effects: resetEffects(basePlayer),
    };
  }

  // Add character-specific stats to base stats
  const updatedPlayer = {
    ...basePlayer,
    maxHealth: basePlayer.maxHealth + (characterStats.maxHealth || 0),
    regeneration: basePlayer.regeneration + (characterStats.regeneration || 0),
    armor: basePlayer.armor + (characterStats.armor || 0),
    minAttack: basePlayer.minAttack + (characterStats.minAttack || 0),
    maxAttack: basePlayer.maxAttack + (characterStats.maxAttack || 0),
    critChance: basePlayer.critChance + (characterStats.critChance || 0),
    critDamage: basePlayer.critDamage + (characterStats.critDamage || 0),
    lifeSteal: basePlayer.lifeSteal + (characterStats.lifeSteal || 0),
    dodge: basePlayer.dodge + (characterStats.dodge || 0),
    gold: basePlayer.gold + (characterStats.gold || 0),

    special: characterStats.special || basePlayer.special,
    rareStats: {
      ...basePlayer.rareStats,
      burn: basePlayer.rareStats.burn + (characterStats.rareStats?.burn || 0),
      poison:
        basePlayer.rareStats.poison + (characterStats.rareStats?.poison || 0),
      thorn:
        basePlayer.rareStats.thorn + (characterStats.rareStats?.thorn || 0),
      stunChance:
        basePlayer.rareStats.stunChance +
        (characterStats.rareStats?.stunChance || 0),
      counterattack:
        basePlayer.rareStats.counterattack +
        (characterStats.rareStats?.counterattack || 0),
      swiftness:
        basePlayer.rareStats.swiftness +
        (characterStats.rareStats?.swiftness || 0),
      shield:
        basePlayer.rareStats.shield + (characterStats.rareStats?.shield || 0),
      barrier:
        basePlayer.rareStats.barrier + (characterStats.rareStats?.barrier || 0),
    },
  };

  return {
    ...updatedPlayer,
    currentHealth: updatedPlayer.maxHealth, // Ensure currentHealth matches updated maxHealth
    effects: resetEffects(updatedPlayer),
  };
};

export const initEnemy = (level) => {
  const isBoss = level % 10 === 0;
  const baseFactor = 0.5 + Math.random() * 0.5;
  const bossMultiplier = isBoss ? 2 : 1;
  const health = Math.floor(12 * level * baseFactor * bossMultiplier);
  const enemy = {
    maxHealth: health,
    currentHealth: health,
    minAttack: Math.floor(3 * level * baseFactor * bossMultiplier),
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
        0.05 * (level >= 20 ? level : 0) * baseFactor * bossMultiplier
      ),
      thorn: Math.floor(
        0.1 * (level >= 20 ? level : 0) * baseFactor * bossMultiplier
      ),
      stunChance: 0.002 * (level >= 20 ? level : 0) * baseFactor,
      counterattack: 0.008 * (level >= 20 ? level : 0) * baseFactor,
      swiftness: 0.002 * (level >= 20 ? level : 0) * baseFactor,
      shield: Math.floor(
        0.5 * (level >= 20 ? level : 0) * baseFactor * bossMultiplier
      ),
      barrier: Math.floor(
        0.1 * (level >= 30 ? level : 0) * baseFactor * bossMultiplier
      ),
    },
  };
  return {
    ...enemy,
    effects: resetEffects(enemy),
  };
};

export const generateUpgradeOptions = (player) => {
  const stats = [
    {
      key: "maxHealth",
      name: "Max Health",
      basePrice: 0.05,
      min: 100,
      max: 300,
      format: (val) => `+${val}`,
    },
    {
      key: "currentHealth",
      name: "Current Health",
      basePrice: 0.05,
      min: 200,
      max: 500,
      format: (val) => `+${val}`,
    },
    {
      key: "regeneration",
      name: "Regeneration",
      basePrice: 6,
      min: player.level - 3 <= 0 ? 1 : (player.level - 3) / 2,
      max: (player.level + 3) / 2,
      format: (val) => `+${val}`,
    },
    {
      key: "armor",
      name: "Armor",
      basePrice: 6,
      min: 4,
      max: 6,
      format: (val) => `+${val}`,
    },
    {
      key: "minAttack",
      name: "Min Attack",
      basePrice: 8,
      min: 4,
      max: 7,
      format: (val) => `+${val}`,
    },
    {
      key: "maxAttack",
      name: "Max Attack",
      basePrice: 10,
      min: 5,
      max: 9,
      format: (val) => `+${val}`,
    },
    {
      key: "critChance",
      name: "Crit Chance",
      basePrice: 15,
      min: 4,
      max: 9,
      format: (val) => `+${val}%`,
    },
    {
      key: "critDamage",
      name: "Crit Damage",
      basePrice: 0.5,
      min: 10,
      max: 50,
      format: (val) => `+${val}%`,
    },
    {
      key: "lifeSteal",
      name: "Life Steal",
      basePrice: 18,
      min: 3,
      max: 5,
      format: (val) => `+${val}%`,
    },
    {
      key: "dodge",
      name: "Dodge",
      basePrice: 16,
      min: 3,
      max: 5,
      format: (val) => `+${val}%`,
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
      stat.basePrice * value * Math.floor((player.level / 2) * 1.05) + Math.random() * 100
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
    { key: "burn", name: "Burn", min: 7, max: 15, format: (val) => `+${val}` },
    {
      key: "poison",
      name: "Poison",
      min: 3,
      max: 5,
      format: (val) => `+${val}`,
    },
    {
      key: "thorn",
      name: "Thorn",
      min: 10,
      max: 20,
      format: (val) => `+${val}`,
    },
    {
      key: "stunChance",
      name: "Stun Chance",
      min: 2,
      max: 5,
      format: (val) => `+${val}%`,
    },
    {
      key: "counterattack",
      name: "Counterattack",
      min: 7,
      max: 15,
      format: (val) => `+${val}%`,
    },
    {
      key: "swiftness",
      name: "Swiftness",
      min: 5,
      max: 10,
      format: (val) => `+${val}%`,
    },
    {
      key: "shield",
      name: "Shield",
      min: 50,
      max: 100,
      format: (val) => `+${val}`,
    },
    {
      key: "barrier",
      name: "Barrier",
      min: 1,
      max: 3,
      format: (val) => `+${val}`,
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
