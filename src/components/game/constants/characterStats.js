export const CHARACTER_STATS = {
  agathe: {
    default: {
      armor: 8,
      maxAttack: 10,
      //   special: "Fire Strike",
    },
    heretic_punisher_captain: {
      armor: 2,
      maxAttack: 20,
      //   special: "Flaming Barrage",
    },
    undead: {
      maxHealth: -200,
      armor: -5,
      maxAttack: 10,
      lifeSteal: 0.15,
      //   special: "Dark Cleave",
    },
    pristine_winter: {
      armor: 15,
      maxAttack: 5,
      //   special: "Frostbite Edge",
    },
    knight: {
      armor: 8,
      maxAttack: 10,
      dodge: 0.05,
      //   special: "Shield Bash",
    },
  },
  bardrey: {
    default: {
      armor: 7,
      //   special: "Wind Slash",
      rareStats: {
        burn: 10,
      },
    },
  },
  alberon: {
    default: {
      armor: 10,
      dodge: 0.05,
      //   special: "Holy Shield",
    },
    holy_king: {
      armor: 12,
      dodge: 0.05,
      rareStats: {
        barrier: 1,
      },
      //   special: "Divine Light",
    },
  },
  esthea: {
    default: {
      regeneration: 5,
      rareStats: {
        shield: 50,
      },
      //   special: "Swift Arrow",
    },
    poison_apple: {
      armor: 2,
      dodge: 0.1,
      rareStats: {
        poison: 2,
      },
      //   special: "Toxic Slam",
    },
  },
  gidnil: {
    default: {
      armor: 9,
      critDamage: 1,
      //   special: "Earth Smash",
    },
  },
  haerang: {
    default: {
      armor: 8,
      critChance: 0.05,
      critDamage: 0.5,
      //   special: "Thunder Kick",
    },
  },
  hansi: {
    default: {
      minAttack: 5,
      maxAttack: 15,
      //   special: "Shadow Blade",
    },
  },
  ian: {
    default: {
      maxAttack: 35,
      //   special: "Ice Lance",
    },
  },
  bombie: {
    default: {
      minAttack: 5,
      maxAttack: 10,
      rareStats: {
        swiftness: 0.1,
      },
      //   special: "Explosive Charge",
    },
  },
  jol: {
    default: {
      //   special: "Lightning Bolt",
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
      lifeSteal: 0.06
      //   special: "Stone Fist",
    },
  },
};
