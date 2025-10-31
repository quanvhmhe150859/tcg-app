export const CHARACTER_STATS = {
  agathe: {
    default: {
      maxAttack: 1,
      rareStats: {
        cooldownReduction: 1,
      },
      specials: [{ specialId: 1, currentCooldown: 0 }],
    },
    heretic_punisher_captain: {
      armor: 2,
      maxAttack: 20,
      specials: [{ specialId: 2, currentCooldown: 0 }],
    },
    undead: {
      maxHealth: -200,
      armor: -5,
      maxAttack: 10,
      lifeSteal: 0.15,
      specials: [{ specialId: 3, currentCooldown: 0 }],
    },
    pristine_winter: {
      armor: 15,
      maxAttack: 5,
      specials: [{ specialId: 4, currentCooldown: 0 }],
    },
    knight: {
      armor: 8,
      maxAttack: 10,
      dodge: 0.05,
      specials: [{ specialId: 5, currentCooldown: 0 }],
    },
  },
  bardrey: {
    default: {
      armor: 7,
      specials: [{ specialId: 6, currentCooldown: 0 }],
      rareStats: {
        burn: 10,
      },
    },
  },
  alberon: {
    default: {
      armor: 10,
      dodge: 0.05,
      specials: [{ specialId: 7, currentCooldown: 0 }],
    },
    holy_king: {
      armor: 12,
      dodge: 0.05,
      rareStats: {
        barrier: 1,
      },
      specials: [{ specialId: 8, currentCooldown: 0 }],
    },
  },
  esthea: {
    default: {
      regeneration: 5,
      rareStats: {
        shield: 50,
      },
      specials: [{ specialId: 9, currentCooldown: 0 }],
    },
    poison_apple: {
      armor: 2,
      dodge: 0.1,
      rareStats: {
        poison: 2,
      },
      specials: [{ specialId: 10, currentCooldown: 0 }],
    },
  },
  gidnil: {
    default: {
      armor: 9,
      critDamage: 1,
      specials: [{ specialId: 11, currentCooldown: 0 }],
    },
  },
  haerang: {
    default: {
      armor: 8,
      critChance: 0.05,
      critDamage: 0.5,
      specials: [{ specialId: 12, currentCooldown: 0 }],
    },
  },
  hansi: {
    default: {
      minAttack: 5,
      maxAttack: 15,
      specials: [{ specialId: 13, currentCooldown: 0 }],
    },
  },
  ian: {
    default: {
      maxAttack: 35,
      specials: [{ specialId: 14, currentCooldown: 0 }],
    },
  },
  bombie: {
    default: {
      minAttack: 5,
      maxAttack: 10,
      rareStats: {
        swiftness: 0.1,
      },
      specials: [{ specialId: 15, currentCooldown: 0 }],
    },
  },
  jol: {
    default: {
      specials: [{ specialId: 16, currentCooldown: 0 }],
      rareStats: {
        swiftness: 0.15,
      },
    },
  },
  kanak: {
    default: {
      maxHealth: -600,
      armor: 6,
      minAttack: 6,
      maxAttack: 6,
      critChance: 0.06,
      critDamage: 0.6,
      lifeSteal: 0.06,
      specials: [{ specialId: 17, currentCooldown: 0 }],
    },
  },
};
