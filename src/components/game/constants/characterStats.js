export const CHARACTER_STATS = {
  agathe: {
    default: {
      armor: 8,
      maxAttack: 10,
      specialId: 1,
    },
    heretic_punisher_captain: {
      armor: 2,
      maxAttack: 20,
      specialId: 2,
    },
    undead: {
      maxHealth: -200,
      armor: -5,
      maxAttack: 10,
      lifeSteal: 0.15,
      specialId: 3,
    },
    pristine_winter: {
      armor: 15,
      maxAttack: 5,
      specialId: 4,
    },
    knight: {
      armor: 8,
      maxAttack: 10,
      dodge: 0.05,
      specialId: 5,
    },
  },
  bardrey: {
    default: {
      armor: 7,
      specialId: 6,
      rareStats: {
        burn: 10,
      },
    },
  },
  alberon: {
    default: {
      armor: 10,
      dodge: 0.05,
      specialId: 7,
    },
    holy_king: {
      armor: 12,
      dodge: 0.05,
      rareStats: {
        barrier: 1,
      },
      specialId: 8,
    },
  },
  esthea: {
    default: {
      regeneration: 5,
      rareStats: {
        shield: 50,
      },
      specialId: 9,
    },
    poison_apple: {
      armor: 2,
      dodge: 0.1,
      rareStats: {
        poison: 2,
      },
      specialId: 10,
    },
  },
  gidnil: {
    default: {
      armor: 9,
      critDamage: 1,
      specialId: 11,
    },
  },
  haerang: {
    default: {
      armor: 8,
      critChance: 0.05,
      critDamage: 0.5,
      specialId: 12,
    },
  },
  hansi: {
    default: {
      minAttack: 5,
      maxAttack: 15,
      specialId: 13,
    },
  },
  ian: {
    default: {
      maxAttack: 35,
      specialId: 14,
    },
  },
  bombie: {
    default: {
      minAttack: 5,
      maxAttack: 10,
      rareStats: {
        swiftness: 0.1,
      },
      specialId: 15,
    },
  },
  jol: {
    default: {
      specialId: 16,
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
      specialId: 17,
    },
  },
};
