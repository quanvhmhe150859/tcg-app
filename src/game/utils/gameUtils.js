export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateEnemy(level) {
  return {
    name: `Enemy Lv.${level}`,
    health: 50 + level * 10,
    minAttack: 3 + Math.floor(level * 0.5),
    maxAttack: 5 + Math.floor(level * 1.5),
    armor: Math.floor(Math.random() * level),
  };
}

export const upgradeOptions = [
  { label: "+100 Health", key: "health", value: 100 },
  { label: "+3 Min Attack", key: "minAttack", value: 3 },
  { label: "+3 Max Attack", key: "maxAttack", value: 3 },
  { label: "+3% Dodge", key: "dodge", value: 3 },
  { label: "+1 Regen", key: "regen", value: 1 },
  { label: "+5 Armor", key: "armor", value: 5 },
  { label: "+5% Life Steal", key: "lifeSteal", value: 5 },
  { label: "+3% Crit Chance", key: "critChance", value: 3 }
];
