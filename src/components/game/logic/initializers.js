import { CHARACTER_STATS } from "../constants/characters";

export const resetEffects = (entity) => {
  return {
    isBurnAttack: true,
    burnDot: 0,
    isPoisonAttack: true,
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
    luck: 0,
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
      cooldownReduction: 0,
    },
    consumables: {},
    buffs: [],
    debuffs: [],
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
    luck: basePlayer.luck + (characterStats.luck || 0),
    gold: basePlayer.gold + (characterStats.gold || 0),

    specials: characterStats.specials || basePlayer.specials,
    consumables: { ...characterStats.consumables },
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
      cooldownReduction:
        basePlayer.rareStats.cooldownReduction +
        (characterStats.rareStats?.cooldownReduction || 0),
    },
  };

  return {
    ...updatedPlayer,
    currentHealth: updatedPlayer.maxHealth, // Ensure currentHealth matches updated maxHealth
    effects: resetEffects(updatedPlayer),
  };
};

export const initEnemy = (level) => {
  const scale = Math.pow(level, 1.1);
  const isBoss = level % 10 === 0;
  const baseFactor = 0.5 + Math.random() * 0.5;
  const bossMultiplier = (isBoss ? 1 : 0) + (level > 30 ? 2 : 1);
  const health = Math.floor(9 * scale * baseFactor * bossMultiplier);
  const enemy = {
    maxHealth: health,
    currentHealth: health,
    regeneration: Math.floor(0.1 * scale * baseFactor * bossMultiplier),
    armor: Math.floor(0.4 * scale * baseFactor * bossMultiplier),
    minAttack: Math.floor(0.7 * scale * baseFactor * bossMultiplier),
    maxAttack: Math.floor(2 * scale * baseFactor * bossMultiplier),
    critChance: 0.005 * scale * baseFactor,
    critDamage: 1 + 0.05 * scale * baseFactor,
    lifeSteal: 0.003 * scale * baseFactor,
    dodge: 0.001 * scale * baseFactor,
    rareStats: {
      burn: Math.floor(
        0.08 * (level >= 10 ? scale : 0) * baseFactor * bossMultiplier
      ),
      poison: Math.floor(
        0.05 * (level >= 10 ? scale : 0) * baseFactor * bossMultiplier
      ),
      thorn: Math.floor(
        0.08 * (level >= 10 ? scale : 0) * baseFactor * bossMultiplier
      ),
      stunChance: 0.002 * (level >= 20 ? scale : 0) * baseFactor,
      counterattack: 0.002 * (level >= 20 ? scale : 0) * baseFactor,
      swiftness: 0.0015 * (level >= 20 ? scale : 0) * baseFactor,
      shield: Math.floor(
        0.9 * (level >= 30 ? scale : 0) * baseFactor * bossMultiplier
      ),
      barrier: Math.floor(
        0.05 * (level >= 30 ? scale : 0) * baseFactor * bossMultiplier
      ),
      cooldownReduction: 0,
    },
    buffs: [],
    debuffs: [],
  };
  return {
    ...enemy,
    effects: resetEffects(enemy),
  };
};

export const generateUpgradeOptions = (player) => {
  // Tính xác suất potion xuất hiện: 50% + (luck * 10)%
  const potionChance = 0.1 + player.luck * 0.1;
  const includePotion = Math.random() < potionChance;

  const stats = [
    {
      key: "maxHealth",
      name: "Max Health",
      basePrice: 0.1,
      min: 100,
      max: 300 + player.luck * 20,
      format: (val) => `+${val}`,
    },
    {
      key: "currentHealth",
      name: "Current Health",
      basePrice: 0.1,
      min: 200,
      max: 500 + player.luck * 30,
      format: (val) => `+${val}`,
    },
    {
      key: "regeneration",
      name: "Regeneration",
      basePrice: 10,
      min: player.level - 6 <= 0 ? 1 : (player.level - 6) / 2,
      max: (player.level + 0) / 2 + player.luck,
      format: (val) => `+${val}`,
    },
    {
      key: "armor",
      name: "Armor",
      basePrice: 10,
      min: 3,
      max: 5 + player.luck,
      format: (val) => `+${val}`,
    },
    {
      key: "minAttack",
      name: "Min Attack",
      basePrice: 10,
      min: 5,
      max: 7 + player.luck,
      format: (val) => `+${val}`,
    },
    {
      key: "maxAttack",
      name: "Max Attack",
      basePrice: 12,
      min: 6,
      max: 11 + player.luck,
      format: (val) => `+${val}`,
    },
    {
      key: "critChance",
      name: "Crit Chance",
      basePrice: 20,
      min: 5,
      max: 7 + Math.floor(player.luck / 2),
      format: (val) => `+${val}%`,
    },
    {
      key: "critDamage",
      name: "Crit Damage",
      basePrice: 1,
      min: 20,
      max: 30 + player.luck * 5,
      format: (val) => `+${val}%`,
    },
    {
      key: "lifeSteal",
      name: "Life Steal",
      basePrice: 20,
      min: 2,
      max: 4 + Math.floor(player.luck / 2),
      format: (val) => `+${val}%`,
    },
    {
      key: "dodge",
      name: "Dodge",
      basePrice: 20,
      min: 3,
      max: 5 + Math.floor(player.luck / 2),
      format: (val) => `+${val}%`,
    },
  ].filter(
    (stat) => stat.key !== "minAttack" || player.minAttack !== player.maxAttack
  );

  // Chỉ thêm potion nếu thỏa điều kiện xác suất
  if (includePotion) {
    stats.push(
      {
        key: "potion",
        name: "🧋 Health 500 Potion",
        potionId: "health_500_fixed",
        basePrice: 500,
        format: () => "+1",
      },
      {
        key: "potion",
        name: "🧃 Revive 500 Potion",
        potionId: "revive_500_fixed",
        basePrice: 1000,
        format: () => "+1",
      }
    );
  }

  // Trộn ngẫu nhiên và lấy 3 phần tử
  const shuffled = stats.sort(() => Math.random() - 0.5).slice(0, 3);

  return shuffled.map((stat) => {
    let value, price, format;

    if (stat.key === "potion") {
      value = 1;
      price = stat.basePrice + Math.floor(Math.random() * 30);
      format = stat.format;
    } else {
      value = Math.floor(stat.min + Math.random() * (stat.max - stat.min + 1));
      price = Math.floor(
        stat.basePrice * value * Math.floor((player.level / 2) * 1.05) +
          Math.random() * 100
      );
      format = stat.format;
    }

    return {
      key: stat.key,
      name: stat.name,
      value,
      format,
      price,
      potionId: stat.potionId,
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
      max: 5 + player.luck,
      format: (val) => `+${val}`,
    },
    {
      key: "thorn",
      name: "Thorn",
      min: 10,
      max: 20 + player.luck,
      format: (val) => `+${val}`,
    },
    {
      key: "stunChance",
      name: "Stun Chance",
      min: 2,
      max: 5 + Math.floor(player.luck / 2),
      format: (val) => `+${val}%`,
    },
    {
      key: "counterattack",
      name: "Counterattack",
      min: 7,
      max: 15 + Math.floor(player.luck / 2),
      format: (val) => `+${val}%`,
    },
    {
      key: "swiftness",
      name: "Swiftness",
      min: 5,
      max: 10 + Math.floor(player.luck / 2),
      format: (val) => `+${val}%`,
    },
    {
      key: "shield",
      name: "Shield",
      min: 50,
      max: 100 + player.luck * 10,
      format: (val) => `+${val}`,
    },
    {
      key: "barrier",
      name: "Barrier",
      min: 2,
      max: 4 + Math.floor(player.luck / 2),
      format: (val) => `+${val}`,
    },
    {
      key: "luck",
      name: "Luck",
      min: 5,
      max: 10 + Math.floor(player.luck / 2),
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
