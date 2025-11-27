// src/logic/generateRandomEquipment.js

// === CẤU HÌNH RARITY ===
export const EQUIPMENT_RARITIES = [
  { name: "common", weight: 50, color: "gray" },
  { name: "uncommon", weight: 30, color: "green" },
  { name: "rare", weight: 15, color: "blue" },
  { name: "epic", weight: 4, color: "purple" },
  { name: "legendary", weight: 1, color: "orange" },
];

export const SLOT_TYPES = [
  "weapon1",
  "weapon2",
  "helmet",
  "armor",
  "gloves",
  "belt",
  "boots",
  "necklace",
  "ring1",
  "ring2",
];

// === ICON POOL (có thể chuyển sang file riêng nếu muốn) ===
export const ICON_POOL = {
  weapon: [
    "/eq/weapons/Item__00.png",
    "/eq/weapons/Item__01.png",
    "/eq/weapons/Item__02.png",
    "/eq/weapons/Item__03.png",
    "/eq/weapons/Item__04.png",
    "/eq/weapons/Item__05.png",
    "/eq/weapons/Item__06.png",
    "/eq/weapons/Item__07.png",
    "/eq/weapons/Item__08.png",
    "/eq/weapons/Item__09.png",
  ],
  helmet: [
    "/eq/helmet/Item__44.png",
    "/eq/helmet/Item__45.png",
    "/eq/helmet/Item__46.png",
    "/eq/helmet/Item__47.png",
  ],
  armor: [
    "/eq/armor/Item__56.png",
    "/eq/armor/Item__57.png",
    "/eq/armor/Item__58.png",
    "/eq/armor/Item__59.png",
  ],
  gloves: [
    "/eq/gloves/Item__60.png",
    "/eq/gloves/Item__61.png",
    "/eq/gloves/Item__62.png",
    "/eq/gloves/Item__63.png",
  ],
  belt: ["/eq/belt/Item__40.png", "/eq/belt/Item__41.png"],
  boots: [
    "/eq/boots/Item__48.png",
    "/eq/boots/Item__49.png",
    "/eq/boots/Item__50.png",
    "/eq/boots/Item__51.png",
  ],
  necklace: [
    "/eq/necklace/Item__32.png",
    "/eq/necklace/Item__33.png",
    "/eq/necklace/Item__34.png",
    "/eq/necklace/Item__35.png",
  ],
  ring: [
    "/eq/ring/Item__40.png",
    "/eq/ring/Item__41.png",
    "/eq/ring/Item__42.png",
    "/eq/ring/Item__43.png",
  ],
};

// === HÀM CHÍNH: TẠO TRANG BỊ NGẪU NHIÊN ===
const generateRandomEquipment = (playerLevel = 1, playerLuck = 0) => {
  const STAT_CONFIG = {
    maxHealth: {
      base: 19,
      rand: 0.6,
      slots: ["armor", "helmet", "gloves", "belt", "boots", "necklace"],
    },
    armor: {
      base: 0.7,
      rand: 0.7,
      slots: ["armor", "helmet", "gloves", "boots"],
    },
    regeneration: {
      base: 0.2,
      rand: 0.5,
      slots: ["armor", "helmet", "belt", "necklace"],
    },
    minAttack: { base: 0.4, rand: 0.6, slots: ["weapon"] },
    maxAttack: { base: 1.4, rand: 0.6, slots: ["weapon"] },
    critChance: {
      base: 0.15,
      rand: 0.5,
      slots: ["weapon", "ring", "gloves", "necklace"],
    },
    critDamage: { base: 5, rand: 0.5, slots: ["weapon", "ring", "helmet"] },
    dodge: { base: 0.1, rand: 0.6, slots: ["boots", "belt", "gloves"] },
    thorn: { base: 0.08, rand: 0.7, slots: ["armor"] },
    lifeSteal: {
      base: 0.15,
      rand: 0.7,
      slots: ["weapon", "necklace", "armor"],
    },
    luck: { base: 0.04, rand: 0.5, slots: ["ring", "necklace"] },
  };

  // 1. Item Level + Luck mạnh
  const luckBonus = playerLuck * 0.15;
  const baseRoll = Math.random() + luckBonus / 10;
  const levelOffset = Math.floor(-3 + Math.pow(baseRoll, 2) * 10);
  const rawItemLevel = playerLevel + levelOffset;
  const itemLevel = Math.max(1, rawItemLevel);

  // 2. Rarity + Luck siêu mạnh
  const weights = {
    common: 50 * Math.pow(0.85, playerLuck),
    uncommon: 30 * Math.pow(0.9, playerLuck),
    rare: 15 * Math.pow(0.95, playerLuck),
    epic: 4 * Math.pow(1.5, playerLuck / 10),
    legendary: 1 * Math.pow(4.5, playerLuck / 10),
  };
  Object.keys(weights).forEach(
    (k) => (weights[k] = Math.min(weights[k], 1e12))
  );
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;

  let selectedRarity;
  if (roll < weights.legendary) selectedRarity = "legendary";
  else {
    roll -= weights.legendary;
    if (roll < weights.epic) selectedRarity = "epic";
    else {
      roll -= weights.epic;
      if (roll < weights.rare) selectedRarity = "rare";
      else {
        roll -= weights.rare;
        if (roll < weights.uncommon) selectedRarity = "uncommon";
        else selectedRarity = "common";
      }
    }
  }

  const rarityInfo = EQUIPMENT_RARITIES.find((r) => r.name === selectedRarity);

  // 3. Slot
  const slot = SLOT_TYPES[Math.floor(Math.random() * SLOT_TYPES.length)];

  // 4. Type (twoHanded chỉ cho weapon)
  let type = "normal";
  if (slot.includes("weapon") && Math.random() < 0.2) {
    type = "twoHanded";
  }

  // 5. Tên
  const baseName =
    {
      weapon1: "Weapon",
      weapon2: "Weapon",
      helmet: "Helmet",
      armor: "Armor",
      gloves: "Gloves",
      belt: "Belt",
      boots: "Boots",
      necklace: "Necklace",
      ring1: "Ring",
      ring2: "Ring",
    }[slot] || "Item";

  const typeSuffix = type === "twoHanded" ? " (Two-Handed)" : "";
  const name = `${
    selectedRarity.charAt(0).toUpperCase() + selectedRarity.slice(1)
  } ${baseName}${typeSuffix}`;

  // 6. Multiplier
  const rarityMultiplier = {
    common: 0.5,
    uncommon: 1.0,
    rare: 1.8,
    epic: 3.2,
    legendary: 5.5,
  }[selectedRarity];
  const typeMultiplier = type === "twoHanded" ? 1.5 : 1.0;
  const finalMultiplier = rarityMultiplier * typeMultiplier;

  const statCount =
    selectedRarity === "legendary"
      ? 4
      : selectedRarity === "epic"
      ? 3
      : selectedRarity === "rare"
      ? 2
      : 1;

  // Lọc stat phù hợp với slot
  const currentSlotKey = slot.replace(/1|2$/, "");
  const possibleStats = Object.keys(STAT_CONFIG).filter((stat) =>
    STAT_CONFIG[stat].slots.some(
      (s) => s.includes(currentSlotKey) || currentSlotKey.includes(s)
    )
  );
  const finalPool =
    possibleStats.length > 0 ? possibleStats : Object.keys(STAT_CONFIG);

  // Tạo affixes
  const affixes = [];
  for (let i = 0; i < statCount; i++) {
    if (finalPool.length === 0) continue;
    const stat = finalPool[Math.floor(Math.random() * finalPool.length)];
    const cfg = STAT_CONFIG[stat];

    let value =
      itemLevel *
      cfg.base *
      finalMultiplier *
      (1 - cfg.rand / 2 + Math.random() * cfg.rand);
    value = Math.round(value);
    value = Math.max(1, value);

    affixes.push({ key: stat, value });
  }

  const stats = {};
  affixes.forEach((a) => (stats[a.key] = (stats[a.key] || 0) + a.value));

  // Icon
  const getIcon = () => {
    if (slot.includes("weapon"))
      return ICON_POOL.weapon[
        Math.floor(Math.random() * ICON_POOL.weapon.length)
      ];
    if (slot.includes("ring"))
      return ICON_POOL.ring[Math.floor(Math.random() * ICON_POOL.ring.length)];
    const key = slot.replace(/1|2$/, "");
    const pool = ICON_POOL[key] || [];
    return pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : "/eq/default.png";
  };

  return {
    id: `eq_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    name,
    icon: getIcon(),
    slot,
    type,
    rarity: selectedRarity,
    rarityColor: rarityInfo?.color || "gray",
    stats,
    affixes,
    itemLevel,
  };
};

export default generateRandomEquipment;
