// characterStats.js
export const CHARACTER_STATS = {
  agathe: {
    default: {
      maxAttack: 10,
      armor: 8,
    //   special: "Fire Strike",
    },
  },
  bardrey: {
    default: {
      armor: 7,
    //   special: "Wind Slash",
      rareStats: {
      burn: 10,
      }
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
    //   special: "Divine Light",
    },
  },
  esthea: {
    default: {
      armor: 6,
    //   special: "Swift Arrow",
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
      armor: 6,
    //   special: "Shadow Blade",
    },
  },
};