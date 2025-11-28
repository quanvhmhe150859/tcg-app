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
import generateRandomEquipment from "../logic/generateRandomEquipment";

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
      const dropChance = 0.3 + 0.1 * (newPlayer.luck || 0);
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
  /**
   * Trang bị item từ inventory
   * - Nếu item có stats.attack → cộng vào cả minAttack và maxAttack
   * - Two-Handed Weapon: chiếm cả 2 slot weapon
   * - Thay thế: hủy luôn item cũ (không trả về túi)
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
        // Đảm bảo luôn có minAttack / maxAttack (tránh undefined)
        minAttack: prev.minAttack || 0,
        maxAttack: prev.maxAttack || 0,
      };

      const isWeaponItem = item.slot.includes("weapon");
      const isWeaponSlot = targetSlot.includes("weapon");
      const isTwoHanded = item.type === "twoHanded";

      // =================================================================
      // 1. XỬ LÝ WEAPON (có Two-Handed)
      // =================================================================
      if (isWeaponItem) {
        if (!isWeaponSlot) {
          addLog(
            `Cannot equip ${item.name} to ${getSlotDisplayName(targetSlot)}!`,
            "error",
            currentTurnLogs
          );
          updateTurnLogs(currentTurnLogs);
          return prev;
        }

        const w1 = newPlayer.equipment.weapon1;
        const w2 = newPlayer.equipment.weapon2;
        const currentlyTwoHanded = w1?.type === "twoHanded" && w1.id === w2?.id;

        const oldItemsToRemove = new Set();

        if (isTwoHanded || currentlyTwoHanded) {
          if (w1) oldItemsToRemove.add(w1);
          if (w2 && w2.id !== w1?.id) oldItemsToRemove.add(w2);
        } else {
          const oldInTarget = newPlayer.equipment[targetSlot];
          if (oldInTarget) oldItemsToRemove.add(oldInTarget);
        }

        // === TRỪ STATS CŨ ===
        oldItemsToRemove.forEach((oldItem) => {
          if (oldItem && oldItem.id !== item.id) {
            Object.entries(oldItem.stats).forEach(([stat, val]) => {
              // Đặc biệt xử lý attack → trừ cả minAttack và maxAttack
              if (stat === "attack") {
                newPlayer.minAttack -= val;
                newPlayer.maxAttack -= val;
              } else {
                const v = PERCENTAGE_KEYS.includes(stat) ? val / 100 : val;
                if (stat in newPlayer) newPlayer[stat] -= v;
                else if (stat in newPlayer.rareStats)
                  newPlayer.rareStats[stat] -= v;
              }
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
          addLog(
            `Equipped ${item.name} (${item.rarity}) as Two-Handed Weapon! (Both slots)`,
            "equipment",
            currentTurnLogs
          );
        } else {
          newPlayer.equipment[targetSlot] = item;
          const action = currentlyTwoHanded
            ? "replaced Two-Handed with"
            : "equipped";
          addLog(
            `Player ${action} ${item.name} (${
              item.rarity
            }) to ${getSlotDisplayName(targetSlot)}!`,
            "equipment",
            currentTurnLogs
          );
        }
      }
      // =================================================================
      // 2. CÁC TRANG BỊ KHÁC (không phải weapon)
      // =================================================================
      else {
        const oldItem = newPlayer.equipment[targetSlot];

        // Trừ stats cũ
        if (oldItem && oldItem.id !== item.id) {
          Object.entries(oldItem.stats).forEach(([stat, val]) => {
            if (stat === "attack") {
              newPlayer.minAttack -= val;
              newPlayer.maxAttack -= val;
            } else {
              const v = PERCENTAGE_KEYS.includes(stat) ? val / 100 : val;
              if (stat in newPlayer) newPlayer[stat] -= v;
              else if (stat in newPlayer.rareStats)
                newPlayer.rareStats[stat] -= v;
            }
          });
          addLog(
            `Destroyed old ${oldItem.name} (${
              oldItem.rarity
            }) from ${getSlotDisplayName(targetSlot)}`,
            "equipment",
            currentTurnLogs
          );
        }

        newPlayer.equipment[targetSlot] = item;
        const action = oldItem ? "replaced" : "equipped";
        addLog(
          `Player ${action} ${item.name} (${
            item.rarity
          }) to ${getSlotDisplayName(targetSlot)}!`,
          "equipment",
          currentTurnLogs
        );
      }

      // =================================================================
      // 3. CỘNG STATS MỚI (chỉ 1 lần duy nhất)
      // =================================================================
      Object.entries(item.stats).forEach(([stat, val]) => {
        // Nếu item cho "attack" → cộng vào cả minAttack và maxAttack
        if (stat === "attack") {
          newPlayer.minAttack += val;
          newPlayer.maxAttack += val;
        } else {
          const v = PERCENTAGE_KEYS.includes(stat) ? val / 100 : val;
          if (stat in newPlayer) newPlayer[stat] += v;
          else if (stat in newPlayer.rareStats) newPlayer.rareStats[stat] += v;
        }
      });

      // Xóa khỏi inventory
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
