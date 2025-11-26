import {
  initPlayer,
  initEnemy,
  generateUpgradeOptions,
  generateRareUpgradeOptions,
  resetEffects,
} from "../logic/initializers";
import {
  startTurn,
  playerTurn,
  playerSpecialTurn,
  enemyTurn,
} from "../logic/gameLogic";
import { addLog } from "../logic/utils";
import { useNavigate } from "react-router-dom";
import { SPECIALS } from "../constants/specials";
import { UPGRADE_STRATEGY, SHOP_STRATEGY } from "../configs/upgradeStrategies";

// === THÊM VÀO ĐẦU FILE (sau các import) ===

const EQUIPMENT_RARITIES = [
  { name: "common", weight: 50, color: "gray" },
  { name: "uncommon", weight: 30, color: "green" },
  { name: "rare", weight: 15, color: "blue" },
  { name: "epic", weight: 4, color: "purple" },
  { name: "legendary", weight: 1, color: "orange" },
];

const SLOT_TYPES = [
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

// Danh sách icon placeholder (bạn có thể thay bằng ảnh thật)
const ICON_POOL = {
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

// Hàm tạo trang bị ngẫu nhiên - PHIÊN BẢN CÂN BẰNG + DỄ CHỈNH
// === HÀM TẠO TRANG BỊ HOÀN CHỈNH - ĐÃ FIX LỖI + LUCK CỰC MẠNH ===
// === HÀM TẠO TRANG BỊ HOÀN CHỈNH - LUCK SIÊU MẠNH (luck=40 → 90%+ LEGENDARY) ===
// === HÀM TẠO TRANG BỊ HOÀN CHỈNH - ĐÃ THÊM ITEM LEVEL + LUCK ẢNH HƯỞNG VƯỢT CẤP ===
// === HÀM generateRandomEquipment ĐÃ ĐƯỢC CẬP NHẬT ===
// Thêm type: "normal" hoặc "twoHanded" (chỉ với weapon)
// twoHanded → stats ×1.5
const generateRandomEquipment = (playerLevel = 1, playerLuck = 0) => {
  // === CẤU HÌNH STAT (giữ nguyên) ===
  const STAT_CONFIG = {
    maxHealth: {
      base: 19,
      rand: 0.6,
      slots: ["armor", "helmet", "gloves", "belt", "boots", "necklace"],
    },
    armor: {
      base: 1,
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

  // === 1. ITEM LEVEL + LUCK SIÊU MẠNH ===
  const luckBonus = playerLuck * 0.15;
  const baseRoll = Math.random() + luckBonus / 10;
  const levelOffset = Math.floor(-3 + Math.pow(baseRoll, 2) * 10);
  const rawItemLevel = playerLevel + levelOffset;
  const itemLevel = Math.max(1, rawItemLevel);

  // === 2. RARITY + LUCK SIÊU MẠNH ===
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

  // === 3. SLOT ===
  const slot = SLOT_TYPES[Math.floor(Math.random() * SLOT_TYPES.length)];

  // === 4. XÁC ĐỊNH TYPE (twoHanded chỉ dành cho weapon) ===
  let type = "normal";
  if (slot.includes("weapon")) {
    if (Math.random() < 0.5) {
      // 20% chance trở thành two-handed
      type = "twoHanded";
    }
  }

  // === 5. TÊN ITEM ===
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

  // === 6. MULTIPLIER ===
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

  // Lấy danh sách stat hợp lệ với slot
  const currentSlotKey = slot.replace(/1|2$/, "");
  const possibleStats = Object.keys(STAT_CONFIG).filter((stat) =>
    STAT_CONFIG[stat].slots.some(
      (s) => s.includes(currentSlotKey) || currentSlotKey.includes(s)
    )
  );
  const finalPool =
    possibleStats.length > 0 ? possibleStats : Object.keys(STAT_CONFIG);

  // === TẠO AFFIXES + STATS ===
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

  // === ICON ===
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

  // === RETURN ===
  return {
    id: `eq_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    name,
    icon: getIcon(),
    slot,
    type, // ← MỚI: "normal" | "twoHanded"
    rarity: selectedRarity,
    rarityColor: rarityInfo?.color || "gray",
    stats,
    affixes,
    itemLevel,
  };
};

// Các thuộc tính cần hiển thị dưới dạng phần trăm
const PERCENTAGE_KEYS = [
  "critChance",
  "critDamage",
  "lifeSteal",
  "dodge",
  "stunChance",
  "counterattack",
  "swiftness",
];

/**
 * Định dạng giá trị cho log (thêm % nếu là thuộc tính phần trăm)
 * @param {string} key - Key của thuộc tính
 * @param {number} value - Giá trị cần định dạng
 * @returns {string} Giá trị đã định dạng
 */
const formatValueForLog = (key, value) => {
  return PERCENTAGE_KEYS.includes(key) ? `${value}%` : value;
};

/**
 * Xử lý cập nhật player state và tạo log khi mua hoặc nâng cấp
 * @param {Object} prevPlayer - Trạng thái player trước đó
 * @param {Object} option - Tùy chọn nâng cấp/mua
 * @param {Array} currentTurnLogs - Logs của turn hiện tại
 * @param {string} logType - Loại log (purchase/upgrade)
 * @param {boolean} isPurchase - Có phải hành động mua hàng không
 * @returns {Object} Player state mới
 */
const updatePlayerAndLog = (
  prevPlayer,
  option,
  currentTurnLogs,
  logType,
  isPurchase = false
) => {
  const newPlayer = { ...prevPlayer, rareStats: { ...prevPlayer.rareStats } };
  const value =
    PERCENTAGE_KEYS.includes(option.key) || option.key === "critDamage"
      ? option.value / 100
      : option.value;

  if (
    option.key === "minAttack" &&
    newPlayer.minAttack + value > newPlayer.maxAttack
  ) {
    newPlayer.maxAttack += value;
    addLog(
      `Player ${
        isPurchase ? "purchased" : "upgraded"
      } Max Attack by +${value} due to Min Attack exceeding Max Attack${
        isPurchase ? ` for ${option.price} gold` : ""
      }!`,
      logType,
      currentTurnLogs
    );
  } else if (option.key === "currentHealth") {
    newPlayer.currentHealth = Math.min(
      newPlayer.currentHealth + value,
      newPlayer.maxHealth
    );
    addLog(
      `Player ${isPurchase ? "purchased" : "healed"} for +${value} HP${
        isPurchase ? ` for ${option.price} gold` : ""
      }!`,
      logType,
      currentTurnLogs
    );
  } else if (option.key === "maxHealth") {
    newPlayer.maxHealth += value;
    newPlayer.currentHealth = Math.min(
      newPlayer.currentHealth + value,
      newPlayer.maxHealth
    );
    addLog(
      `Player ${isPurchase ? "purchased" : "upgraded"} ${
        option.name
      } by +${formatValueForLog(option.key, option.value)}${
        isPurchase ? ` for ${option.price} gold` : ""
      }!`,
      logType,
      currentTurnLogs
    );
  } else if (option.key in newPlayer.rareStats) {
    newPlayer.rareStats[option.key] += value;
    addLog(
      `Player ${isPurchase ? "purchased" : "upgraded"} ${
        option.name
      } by +${formatValueForLog(option.key, option.value)}${
        isPurchase ? ` for ${option.price} gold` : ""
      }!`,
      logType,
      currentTurnLogs
    );
  } else if (option.key === "consumable") {
    const { potionId, value: quantityToAdd } = option;

    // Đảm bảo consumables là object
    if (!newPlayer.consumables || Array.isArray(newPlayer.consumables)) {
      newPlayer.consumables = {};
    }

    // Cộng dồn hoặc tạo mới
    if (newPlayer.consumables[potionId]) {
      newPlayer.consumables[potionId] += quantityToAdd;
    } else {
      newPlayer.consumables[potionId] = quantityToAdd;
    }

    // Log mua potion
    addLog(
      `Player ${isPurchase ? "purchased" : "upgraded"} ${
        option.name
      } by +${formatValueForLog(option.key, option.value)}${
        isPurchase ? ` for ${option.price} gold` : ""
      }!`,
      logType,
      currentTurnLogs
    );
  } else {
    newPlayer[option.key] += value;
    addLog(
      `Player ${isPurchase ? "purchased" : "upgraded"} ${
        option.name
      } by +${formatValueForLog(option.key, option.value)}${
        isPurchase ? ` for ${option.price} gold` : ""
      }!`,
      logType,
      currentTurnLogs
    );
  }

  if (isPurchase) {
    newPlayer.gold -= option.price;
  }
  return newPlayer;
};

const useGameLogic = ({
  playerState,
  enemyState,
  gameState,
  shopState,
  earnTickets,
}) => {
  const { player, setPlayer } = playerState;
  const { enemy, setEnemy } = enemyState;
  const {
    turnLogs,
    setTurnLogs,
    gameOver,
    setGameOver,
    turnCount,
    setTurnCount,
    globalTurnCount,
    setGlobalTurnCount,
    logId,
    setLogId,
    level,
    setLevel,
    isAuto,
    setIsAuto,
    showUpgradeOptions,
    setShowUpgradeOptions,
  } = gameState;
  const {
    upgradeOptions,
    setUpgradeOptions,
    isRareUpgrade,
    setIsRareUpgrade,
    showShop,
    setShowShop,
    shopOptions,
    setShopOptions,
    rerollPrice,
    setRerollPrice,
    boughtOptions,
    setBoughtOptions,
  } = shopState;

  /**
   * Updates the turn logs with new entries, limiting to 20 logs.
   * @param {Array} currentTurnLogs - Logs for the current turn
   */
  const updateTurnLogs = (currentTurnLogs) => {
    setLogId((prev) => {
      const newLogId = prev + 1;
      setTurnLogs((prevLogs) => {
        const newTurnLogs = [
          ...prevLogs,
          {
            turnId: newLogId,
            turn: turnCount,
            level: level,
            logs: currentTurnLogs,
          },
        ];
        return newTurnLogs.length > 20 ? newTurnLogs.slice(1) : newTurnLogs;
      });
      return newLogId;
    });
  };

  /**
   * Resets shop-related states (reroll price and bought options).
   */
  const resetShopState = () => {
    setRerollPrice(50 + Math.floor(level * 1.5));
    setBoughtOptions([]);
  };

  /**
   * Increases the reroll price and resets bought options.
   */
  const increaseRerollPrice = () => {
    setRerollPrice((prev) => Math.floor(prev * 1.6));
    setBoughtOptions([]);
  };

  const endTurn = (newPlayer, newEnemy, currentTurnLogs, gameStatus) => {
    setPlayer(newPlayer);
    setEnemy(newEnemy);
    updateTurnLogs(currentTurnLogs);
    if (gameStatus.isOver) {
      endGame();
    }
    if (gameStatus.levelUp) {
      const isBossDefeated = level % 10 === 0;
      setIsRareUpgrade(isBossDefeated);
      setUpgradeOptions(
        isBossDefeated
          ? generateRareUpgradeOptions(player)
          : generateUpgradeOptions(player, UPGRADE_STRATEGY)
      );
      setShowUpgradeOptions(true);
    }
  };

  const handlePurchase = (option, index) => {
    if (player.gold < option.price || boughtOptions.includes(index)) return;

    setPlayer((prev) => {
      const currentTurnLogs = [];

      // DÙNG updatePlayerAndLog ĐỂ XỬ LÝ TẤT CẢ (bao gồm trừ tiền)
      const updatedPlayer = updatePlayerAndLog(
        prev,
        {
          ...option,
          key: option.key === "potion" ? "consumable" : option.key,
        },
        currentTurnLogs,
        "purchase",
        true // ← isPurchase = true → sẽ tự trừ tiền bên trong
      );

      updateTurnLogs(currentTurnLogs);
      return updatedPlayer; // ← KHÔNG CẦN TRỪ TIỀN NỮA!
    });

    setBoughtOptions((prev) => [...prev, index]);
  };

  /**
   * Rerolls shop options if player has enough gold.
   */
  /**
   * Rerolls shop options if player has enough gold.
   * → Nếu đã mua hết tất cả item trong shop → lần reroll tiếp theo MIỄN PHÍ
   */
  /**
   * Rerolls shop options.
   * Nếu đã mua hết tất cả item trong shop → reroll MIỄN PHÍ (giá = 0, không trừ vàng, không log gì thêm)
   */
  // === THAY TOÀN BỘ HÀM handleReroll BÊN TRONG useGameLogic.js ===

  const handleReroll = () => {
    const totalOptions = shopOptions.length;
    const boughtCount = boughtOptions.length;
    const isShopCleared = boughtCount >= totalOptions && totalOptions > 0;

    // Giá thật để reroll: nếu mua hết → 0
    const actualRerollPrice = isShopCleared ? 0 : rerollPrice;

    // Nếu không đủ tiền VÀ không được miễn phí → không cho reroll
    if (player.gold < actualRerollPrice) {
      return;
    }

    // Cập nhật gold (chỉ trừ khi có phí)
    setPlayer((prev) => {
      const newGold = prev.gold - actualRerollPrice;
      const logs = [];

      addLog(
        `Player rerolled shop for ${actualRerollPrice} gold!`,
        "purchase",
        logs
      );
      updateTurnLogs(logs);

      return { ...prev, gold: newGold };
    });

    // Tạo shop mới + reset danh sách đã mua
    setShopOptions(generateUpgradeOptions(player, SHOP_STRATEGY));
    setBoughtOptions([]);

    // Chỉ tăng giá reroll khi KHÔNG miễn phí
    // if (!isShopCleared) {
    increaseRerollPrice();
    // }
    // Nếu miễn phí → giá giữ nguyên → lần sau vẫn dễ clear tiếp
  };

  /**
   * Exits the shop and resets shop state.
   */
  const handleExitShop = () => {
    setShowShop(false);
    resetShopState();
  };

  const handleUpgrade = (option) => {
    setPlayer((prev) => {
      const currentTurnLogs = [];
      let newPlayer = { ...prev };

      if (option.key === "potion") {
        // XỬ LÝ POTION: CỘNG DỒN HOẶC TẠO MỚI (dạng object)
        const potionId = option.potionId;
        const quantityToAdd = option.value;

        // Đảm bảo consumables là object
        if (!newPlayer.consumables || Array.isArray(newPlayer.consumables)) {
          newPlayer.consumables = {};
        }

        // Cộng dồn nếu đã có, hoặc tạo mới
        if (newPlayer.consumables[potionId]) {
          newPlayer.consumables[potionId] += quantityToAdd;
        } else {
          newPlayer.consumables[potionId] = quantityToAdd;
        }
      } else {
        // XỬ LÝ STAT THƯỜNG
        newPlayer = updatePlayerAndLog(
          prev,
          option,
          currentTurnLogs,
          "upgrade"
        );
      }

      newPlayer.effects = resetEffects(newPlayer);
      updateTurnLogs(currentTurnLogs);
      return newPlayer;
    });

    setLevel((prev) => prev + 1);
    setEnemy(initEnemy(level + 1));
    setTurnCount(1);
    setShowUpgradeOptions(false);

    if (level % 10 === 9) {
      setShowShop(true);
      setShopOptions(generateUpgradeOptions(player, SHOP_STRATEGY));
      resetShopState();
    }
  };

  /**
   * Ends the game and awards tickets.
   */
  const endGame = () => {
    const gained = earnTickets(level);
    const currentTurnLogs = [];
    addLog("Game Over!", "gameOver", currentTurnLogs);
    addLog(`🎟️ You gained ${gained} tickets!`, "ticket", currentTurnLogs);
    updateTurnLogs(currentTurnLogs);
    setGameOver(true);
    setIsAuto(false);
  };

  /**
   * Ends the current run manually.
   */
  const handleEndRun = () => {
    const newPlayer = { ...player, rareStats: { ...player.rareStats } };
    const newEnemy = { ...enemy, rareStats: { ...enemy.rareStats } };
    const currentTurnLogs = [];
    const gameStatus = { isOver: true, levelUp: false };
    endTurn(newPlayer, newEnemy, currentTurnLogs, gameStatus);
  };

  /**
   * Handles a single attack turn for player and enemy.
   */
  const handleAttack = () => {
    if (gameOver || showUpgradeOptions || showShop) return;

    // ---------- 1. Clone state ----------
    let newPlayer = { ...player, rareStats: { ...player.rareStats } };
    let newEnemy = { ...enemy, rareStats: { ...enemy.rareStats } };
    const currentTurn = turnCount;
    const currentTurnLogs = [];

    // ---------- 2. Giảm cooldown "turn" ----------
    newPlayer = reduceTurnCooldowns(newPlayer);

    // ---------- 4. Turn thường ----------
    startTurn(currentTurn, level, currentTurnLogs);
    const enemyAlive = playerTurn(newPlayer, newEnemy, currentTurnLogs);

    // ---------- 5. Kiểm tra kết quả ----------
    let gameStatus = checkGameOver(newPlayer, newEnemy, currentTurnLogs, level);

    // Nếu có level-up hoặc game-over → giảm cooldown "level"
    if (gameStatus.levelUp) {
      newPlayer.level++;
      newPlayer = reduceLevelCooldowns(newPlayer);
    }

    // Enemy còn sống → lượt enemy
    if (enemyAlive && !gameStatus.isOver && !gameStatus.levelUp) {
      enemyTurn(newPlayer, newEnemy, currentTurnLogs);
      gameStatus = checkGameOver(newPlayer, newEnemy, currentTurnLogs, level);
    }

    // ---------- 6. END TURN (chỉ 1 lần) ----------
    endTurn(newPlayer, newEnemy, currentTurnLogs, gameStatus);

    // cập nhật turn counter
    setGlobalTurnCount((prev) => prev + 1);
    if (!gameStatus.levelUp) setTurnCount(currentTurn + 1);
  };

  const handleSpecial = (specialId) => {
    if (gameOver || showUpgradeOptions || showShop) return;

    let newPlayer = { ...player, rareStats: { ...player.rareStats } };
    let newEnemy = { ...enemy, rareStats: { ...enemy.rareStats } };
    const currentTurnLogs = [];

    const playerSpecial = player.specials.find(
      (s) => s.specialId === specialId
    );
    if (!playerSpecial || playerSpecial.currentCooldown > 0) return;

    const specialData = SPECIALS.find((s) => s.id === specialId);
    if (!specialData) return;

    // Thực hiện special
    playerSpecialTurn(specialId, newPlayer, newEnemy, currentTurnLogs);

    // ✅ SET SPECIAL ON COOLDOWN
    newPlayer.specials = newPlayer.specials.map((s) => {
      if (s.specialId === specialId) {
        const reduction = newPlayer.rareStats?.cooldownReduction || 0;
        const reduced = specialData.cooldown - reduction;
        const finalCooldown = Math.max(Math.ceil(reduced), 1); // không thấp hơn 1
        return { ...s, currentCooldown: finalCooldown };
      }
      return s;
    });

    let gameStatus = checkGameOver(newPlayer, newEnemy, currentTurnLogs, level);
    if (gameStatus.isOver || gameStatus.levelUp) {
      newPlayer.level++;
      // Giảm cooldown "level"
      newPlayer = reduceLevelCooldowns(newPlayer);
      endTurn(newPlayer, newEnemy, currentTurnLogs, gameStatus);
      return;
    }

    endTurn(newPlayer, newEnemy, currentTurnLogs, gameStatus);
  };

  const handleUseConsumable = (consumableId) => {
    const consumables = player.consumables;

    if (
      !consumables ||
      typeof consumables !== "object" ||
      Array.isArray(consumables) ||
      !consumables[consumableId] ||
      consumables[consumableId] <= 0
    ) {
      return;
    }

    const [type, rawValue, mode] = consumableId.split("_");
    const value = parseInt(rawValue, 10);
    const isPercent = mode === "percent";

    let healAmount = 0;
    if (type === "health") {
      healAmount = isPercent
        ? Math.floor((player.maxHealth * value) / 100)
        : value;
    }

    const newHealth = Math.min(
      player.maxHealth,
      player.currentHealth + healAmount
    );

    setPlayer((prev) => {
      const newConsumables = { ...prev.consumables };
      const newQuantity = newConsumables[consumableId] - 1;

      if (newQuantity <= 0) {
        delete newConsumables[consumableId]; // XÓA ITEM HOÀN TOÀN
      } else {
        newConsumables[consumableId] = newQuantity;
      }

      return {
        ...prev,
        currentHealth: newHealth,
        consumables: newConsumables,
      };
    });
  };

  const toggleAuto = () => {
    setIsAuto((prev) => !prev);
  };

  const navigate = useNavigate();

  const resetGame = () => {
    navigate("/character-selection");
  };

  // Giảm cooldown "turn"
  const reduceTurnCooldowns = (newPlayer) => {
    return {
      ...newPlayer,
      specials: newPlayer.specials.map((s) => {
        const specialData = SPECIALS.find((sp) => sp.id === s.specialId);
        if (specialData?.cooldownType === "turn" && s.currentCooldown > 0) {
          // console.log("call");
          return { ...s, currentCooldown: s.currentCooldown - 1 };
        }
        return s;
      }),
    };
  };

  // Giảm cooldown "level"
  const reduceLevelCooldowns = (newPlayer) => {
    return {
      ...newPlayer,
      specials: newPlayer.specials.map((s) => {
        const specialData = SPECIALS.find((sp) => sp.id === s.specialId);
        if (specialData?.cooldownType === "level" && s.currentCooldown > 0) {
          return { ...s, currentCooldown: s.currentCooldown - 1 };
        }
        return s;
      }),
    };
  };

  /**
   * Xử lý lượt tự động: ưu tiên special "auto" nếu có thể dùng, nếu không thì tấn công thường.
   */
  const handleAutoTurn = () => {
    if (gameOver || showUpgradeOptions || showShop) return;

    // Tìm special có usingType = "auto" và cooldown = 0
    const autoSpecial = player.specials.find((s) => {
      const specialData = SPECIALS.find((sp) => sp.id === s.specialId);
      return specialData?.usingType === "auto" && s.currentCooldown === 0;
    });

    if (autoSpecial) {
      handleSpecial(autoSpecial.specialId);
    } else {
      handleAttack();
    }
  };

  /**
   * Xử lý hồi sinh tự động khi player chết và có vật phẩm revive
   * @param {Object} newPlayer - Player state
   * @param {Object} newEnemy - Enemy state
   * @param {Array} currentTurnLogs - Logs hiện tại
   * @returns {Object} { revived: boolean, newPlayer }
   */
  const handleRevive = (newPlayer, newEnemy, currentTurnLogs) => {
    const consumables = newPlayer.consumables || {};
    let revived = false;
    let revivedPlayer = { ...newPlayer };

    // Duyệt qua các vật phẩm revive theo thứ tự ưu tiên (nếu có nhiều)
    for (const [key, quantity] of Object.entries(consumables)) {
      if (quantity <= 0 || !key.startsWith("revive_")) continue;

      const [, rawValue, mode] = key.split("_");
      const value = parseInt(rawValue, 10);
      const isPercent = mode === "percent";

      // Giảm 1 vật phẩm
      const newConsumables = { ...consumables };
      newConsumables[key] -= 1;
      if (newConsumables[key] <= 0) {
        delete newConsumables[key];
      }

      // Tính lượng máu hồi
      const healAmount = isPercent
        ? Math.floor((newPlayer.maxHealth * value) / 100)
        : value;

      const newHealth = Math.min(newPlayer.maxHealth, healAmount);

      // Cập nhật player
      revivedPlayer = {
        ...newPlayer,
        currentHealth: newHealth,
        consumables: newConsumables,
      };

      // Ghi log
      const itemName = isPercent
        ? `Revive (${value}% HP)`
        : `Revive (${value} HP)`;
      addLog(
        `Player used ${itemName}! Revived with ${healAmount} HP!`,
        "revive",
        currentTurnLogs
      );

      revived = true;
      break; // Chỉ dùng 1 lần revive mỗi lần chết
    }

    return { revived, newPlayer: revivedPlayer };
  };

  const checkGameOver = (newPlayer, newEnemy, currentTurnLogs, level) => {
    // 1. Kiểm tra enemy chết → level up
    if (newEnemy.currentHealth <= 0) {
      const goldGained = Math.floor(
        newEnemy.maxHealth +
          newEnemy.minAttack +
          newEnemy.maxAttack +
          newEnemy.critChance * 100 +
          newEnemy.critDamage * 100 +
          newEnemy.lifeSteal * 100 +
          newEnemy.regeneration +
          newEnemy.dodge * 100 +
          newEnemy.armor +
          newEnemy.rareStats.burn +
          newEnemy.rareStats.poison +
          newEnemy.rareStats.thorn +
          newEnemy.rareStats.counterattack * 100 +
          newEnemy.rareStats.stunChance * 100 +
          newEnemy.rareStats.swiftness * 100 +
          newEnemy.rareStats.shield +
          newEnemy.rareStats.barrier * 100
      );
      newPlayer.gold += goldGained;
      addLog(
        `Enemy defeated! Level up to ${level + 1}!`,
        "levelUp",
        currentTurnLogs
      );
      addLog(`Player gained ${goldGained} gold!`, "gold", currentTurnLogs);

      // === THAY ĐOẠN NÀY TRONG checkGameOver ===
      const dropChance = 0.25 + 0.1 * (newPlayer.luck || 0);
      if (Math.random() < dropChance) {
        const droppedItem = generateRandomEquipment(
          level + 1,
          newPlayer.luck || 0
        );

        // Đảm bảo inventory luôn tồn tại
        let currentInventory = newPlayer.inventory || [];

        const MAX_INVENTORY = 10;

        if (currentInventory.length >= MAX_INVENTORY) {
          // LẤY ITEM Ở CUỐI MẢNG (cũ nhất trong hiển thị) ĐỂ HỦY
          const destroyedItem = currentInventory[currentInventory.length - 1];

          addLog(
            `Inventory full! Destroyed oldest: ${destroyedItem.name} (${destroyedItem.rarity})`,
            "equipment",
            currentTurnLogs
          );

          // Xóa item cuối cùng
          currentInventory = currentInventory.slice(0, -1);
        }

        // THÊM ITEM MỚI VÀO ĐẦU MẢNG → hiện đầu tiên trong inventory
        currentInventory.unshift(droppedItem);
        newPlayer.inventory = currentInventory;

        addLog(
          `Found: ${droppedItem.name} (${droppedItem.rarity})`,
          "equipment",
          currentTurnLogs
        );
      }

      return { isOver: false, levelUp: true };
    }

    // 2. Kiểm tra player chết → thử revive
    if (newPlayer.currentHealth <= 0) {
      const { revived, newPlayer: revivedPlayer } = handleRevive(
        newPlayer,
        newEnemy,
        currentTurnLogs
      );

      if (revived) {
        // Player được hồi sinh → tiếp tục trận đấu
        // Cập nhật newPlayer để enemy vẫn có thể đánh tiếp nếu còn sống
        Object.assign(newPlayer, revivedPlayer);
        return { isOver: false, levelUp: false };
      } else {
        // Không có revive → game over
        addLog("Player defeated!", "gameOver", currentTurnLogs);
        return { isOver: true, levelUp: false };
      }
    }

    return { isOver: false, levelUp: false };
  };

  /**
   * Trang bị một item từ inventory vào slot tương ứng
   * Khi replace: HỦY LUÔN ITEM CŨ (không trả về túi)
   */
  /**
 * Trang bị item từ inventory
 * - Two-Handed Weapon: chiếm cả weapon1 + weapon2
 * - Thay thế: hủy luôn item cũ (không trả về túi)
 */
/**
 * handleEquipItem – ĐÃ FIX HOÀN TOÀN
 * - Two-Handed: chiếm cả 2 slot weapon
 * - Đổi từ Two-Handed → 1 tay: hủy luôn Two-Handed cũ
 * - Các trang bị khác (áo, giày, nhẫn...) hoạt động bình thường
 */
const handleEquipItem = (item, targetSlot) => {
  if (!item || !item.slot || !item.stats || !targetSlot) return;

  setPlayer((prev) => {
    const currentTurnLogs = [];
    const newPlayer = {
      ...prev,
      equipment: { ...prev.equipment },
      inventory: [...(prev.inventory || [])],
      rareStats: { ...prev.rareStats },
    };

    const isWeaponItem = item.slot.includes("weapon");
    const isWeaponSlot = targetSlot.includes("weapon");
    const isTwoHanded = item.type === "twoHanded";

    // =================================================================
    // 1. XỬ LÝ RIÊNG CHO WEAPON (có Two-Handed)
    // =================================================================
    if (isWeaponItem) {
      if (!isWeaponSlot) {
        addLog(`Cannot equip ${item.name} to ${getSlotDisplayName(targetSlot)}!`, "error", currentTurnLogs);
        updateTurnLogs(currentTurnLogs);
        return prev;
      }

      const w1 = newPlayer.equipment.weapon1;
      const w2 = newPlayer.equipment.weapon2;
      const currentlyTwoHanded = w1?.type === "twoHanded" && w1.id === w2?.id;

      // Danh sách item cũ cần bị hủy (tránh trùng)
      const oldItemsToRemove = new Set();

      if (isTwoHanded || currentlyTwoHanded) {
        // Nếu trang bị Two-Handed HOẶC đang có Two-Handed → xóa cả 2 slot
        if (w1) oldItemsToRemove.add(w1);
        if (w2 && w2.id !== w1?.id) oldItemsToRemove.add(w2);
      } else {
        // Chỉ thay 1 slot
        const oldInTarget = newPlayer.equipment[targetSlot];
        if (oldInTarget) oldItemsToRemove.add(oldInTarget);
      }

      // === TRỪ STATS CŨ - CHỈ 1 LẦN DUY NHẤT ===
      oldItemsToRemove.forEach((oldItem) => {
        if (oldItem && oldItem.id !== item.id) {
          Object.entries(oldItem.stats).forEach(([stat, val]) => {
            const v = PERCENTAGE_KEYS.includes(stat) ? val / 100 : val;
            if (stat in newPlayer) newPlayer[stat] -= v;
            else if (stat in newPlayer.rareStats) newPlayer.rareStats[stat] -= v;
          });

          addLog(
            `Destroyed old ${oldItem.name} (${oldItem.rarity})`,
            "equipment",
            currentTurnLogs
          );
        }
      });

      // === XÓA KHỎI EQUIPMENT ===
      if (isTwoHanded || currentlyTwoHanded) {
        delete newPlayer.equipment.weapon1;
        delete newPlayer.equipment.weapon2;
      } else {
        delete newPlayer.equipment[targetSlot];
      }

      // === TRANG BỊ MỚI ===
      if (isTwoHanded) {
        newPlayer.equipment.weapon1 = item;
        newPlayer.equipment.weapon2 = item;
        addLog(`Equipped ${item.name} (${item.rarity}) as Two-Handed Weapon! (Both slots)`, "equipment", currentTurnLogs);
      } else {
        newPlayer.equipment[targetSlot] = item;
        const action = currentlyTwoHanded ? "replaced Two-Handed with" : "equipped";
        addLog(`Player ${action} ${item.name} (${item.rarity}) to ${getSlotDisplayName(targetSlot)}!`, "equipment", currentTurnLogs);
      }
    }
    // =================================================================
    // 2. CÁC TRANG BỊ KHÁC (áo, giày, nhẫn...) - GIỮ NGUYÊN
    // =================================================================
    else {
      const normalizedItemSlot = item.slot.replace(/1|2$/, "");
      const normalizedTargetSlot = targetSlot.replace(/1|2$/, "");
      const isFlexible = normalizedItemSlot === "ring";

      if (!isFlexible && item.slot !== targetSlot) {
        addLog(`Cannot equip ${item.name} to ${getSlotDisplayName(targetSlot)}!`, "error", currentTurnLogs);
        updateTurnLogs(currentTurnLogs);
        return prev;
      }

      const oldItem = newPlayer.equipment[targetSlot];
      if (oldItem && oldItem.id !== item.id) {
        Object.entries(oldItem.stats).forEach(([stat, val]) => {
          const v = PERCENTAGE_KEYS.includes(stat) ? val / 100 : val;
          if (stat in newPlayer) newPlayer[stat] -= v;
          else if (stat in newPlayer.rareStats) newPlayer.rareStats[stat] -= v;
        });
        addLog(`Destroyed old ${oldItem.name} (${oldItem.rarity}) from ${getSlotDisplayName(targetSlot)}`, "equipment", currentTurnLogs);
      }

      newPlayer.equipment[targetSlot] = item;
      const action = oldItem ? "replaced" : "equipped";
      addLog(`Player ${action} ${item.name} (${item.rarity}) to ${getSlotDisplayName(targetSlot)}!`, "equipment", currentTurnLogs);
    }

    // =================================================================
    // 3. CỘNG STATS MỚI (chỉ 1 lần)
    // =================================================================
    Object.entries(item.stats).forEach(([stat, val]) => {
      const v = PERCENTAGE_KEYS.includes(stat) ? val / 100 : val;
      if (stat in newPlayer) newPlayer[stat] += v;
      else if (stat in newPlayer.rareStats) newPlayer.rareStats[stat] += v;
    });

    // Xóa khỏi túi
    newPlayer.inventory = newPlayer.inventory.filter((i) => i.id !== item.id);

    updateTurnLogs(currentTurnLogs);
    return newPlayer;
  });
};

  /**
   * Hủy item trong inventory - KHÔNG HIỆN CONFIRM NỮA
   * Hủy ngay lập tức, không hỏi lại
   */
  const handleDestroyItem = (item) => {
    setPlayer((prev) => {
      const currentTurnLogs = [];

      const newPlayer = {
        ...prev,
        inventory: prev.inventory.filter((i) => i.id !== item.id),
      };

      addLog(
        `Destroyed ${item.name} (${item.rarity})`,
        "equipment",
        currentTurnLogs
      );

      updateTurnLogs(currentTurnLogs);
      return newPlayer;
    });
  };

  // Hàm phụ trợ hiển thị tên slot đẹp (dùng chung)
  const getSlotDisplayName = (slot) => {
    const names = {
      weapon1: "Weapon 1",
      weapon2: "Weapon 2",
      helmet: "Helmet",
      armor: "Armor",
      gloves: "Gloves",
      belt: "Belt",
      boots: "Boots",
      necklace: "Necklace",
      ring1: "Ring 1",
      ring2: "Ring 2",
    };
    return names[slot] || slot;
  };

  return {
    handlePurchase,
    handleReroll,
    handleExitShop,
    handleUpgrade,
    handleEndRun,
    handleAttack,
    handleSpecial,
    handleAutoTurn,
    handleUseConsumable,
    toggleAuto,
    resetGame,

    handleEquipItem,
    handleDestroyItem,
  };
};

export default useGameLogic;
