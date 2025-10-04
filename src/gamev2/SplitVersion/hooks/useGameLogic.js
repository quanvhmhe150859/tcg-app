import {
  initPlayer,
  initEnemy,
  generateUpgradeOptions,
  generateRareUpgradeOptions,
} from "../initializers";
import { playerTurn, enemyTurn } from "../gameLogic";
import { addLog, checkGameOver, startTurn } from "../utils";

/**
 * Custom hook to manage game logic for BattleGame component.
 * @param {Object} params - State and setter functions grouped by context
 * @param {Object} params.playerState - Player state and setter
 * @param {Object} params.enemyState - Enemy state and setter
 * @param {Object} params.gameState - Game-related states and setters
 * @param {Object} params.shopState - Shop-related states and setters
 * @param {Function} params.earnTickets - Function to earn tickets from TicketContext
 * @returns {Object} Game logic functions
 */
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
        if (newTurnLogs.length > 20) {
          return newTurnLogs.slice(1);
        }
        return newTurnLogs;
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
    setRerollPrice((prev) => Math.floor(prev * 1.5));
    setBoughtOptions([]);
  };

  /**
   * Ends the current turn, updates player/enemy, and checks for game over or level up.
   * @param {Object} newPlayer - Updated player state
   * @param {Object} newEnemy - Updated enemy state
   * @param {Array} currentTurnLogs - Logs for the current turn
   * @param {Object} gameStatus - Game status (isOver, levelUp)
   */
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
          : generateUpgradeOptions(player)
      );
      setShowUpgradeOptions(true);
    }
  };

  /**
   * Handles purchasing an item from the shop.
   * @param {Object} option - The upgrade option to purchase
   * @param {number} index - Index of the option in shopOptions
   */
  const handlePurchase = (option, index) => {
    if (player.gold < option.price || boughtOptions.includes(index)) return;
    setPlayer((prev) => {
      const newPlayer = { ...prev, rareStats: { ...prev.rareStats } };
      const currentTurnLogs = [];
      const value = ["critChance", "lifeSteal", "dodge", "stunChance", "counterattack", "swiftness"].includes(option.key)
        ? option.value / 100
        : ["critDamage"].includes(option.key)
        ? option.value / 100
        : option.value;
      if (
        option.key === "minAttack" &&
        newPlayer.minAttack + value > newPlayer.maxAttack
      ) {
        newPlayer.maxAttack += value;
        addLog(
          `Player purchased Max Attack by +${value} due to Min Attack exceeding Max Attack for ${option.price} gold!`,
          "purchase",
          currentTurnLogs
        );
      } else if (option.key === "maxHealth") {
        newPlayer.maxHealth += value;
        newPlayer.currentHealth = Math.min(newPlayer.currentHealth + value, newPlayer.maxHealth);
        addLog(
          `Player purchased ${option.name} by +${value} for ${option.price} gold!`,
          "purchase",
          currentTurnLogs
        );
      } else if (option.key in newPlayer.rareStats) {
        newPlayer.rareStats[option.key] += value;
        addLog(
          ["critChance", "critDamage", "lifeSteal", "dodge", "stunChance", "counterattack", "swiftness"].includes(option.key)
            ? `Player purchased ${option.name} by +${option.value}% for ${option.price} gold!`
            : `Player purchased ${option.name} by +${option.value} for ${option.price} gold!`,
          "purchase",
          currentTurnLogs
        );
      } else {
        newPlayer[option.key] += value;
        addLog(
          ["critChance", "critDamage", "lifeSteal", "dodge", "stunChance", "counterattack", "swiftness"].includes(option.key)
            ? `Player purchased ${option.name} by +${option.value}% for ${option.price} gold!`
            : `Player purchased ${option.name} by +${option.value} for ${option.price} gold!`,
          "purchase",
          currentTurnLogs
        );
      }
      newPlayer.gold -= option.price;
      updateTurnLogs(currentTurnLogs);
      return newPlayer;
    });
    setBoughtOptions((prev) => [...prev, index]);
  };

  /**
   * Rerolls shop options if player has enough gold.
   */
  const handleReroll = () => {
    if (player.gold < rerollPrice) return;
    setPlayer((prev) => {
      const newPlayer = { ...prev, gold: prev.gold - rerollPrice };
      const currentTurnLogs = [];
      addLog(
        `Player rerolled shop for ${rerollPrice} gold!`,
        "purchase",
        currentTurnLogs
      );
      updateTurnLogs(currentTurnLogs);
      return newPlayer;
    });
    setShopOptions(generateUpgradeOptions(player));
    increaseRerollPrice();
  };

  /**
   * Exits the shop and resets shop state.
   */
  const handleExitShop = () => {
    setShowShop(false);
    resetShopState();
  };

  /**
   * Handles upgrading a player stat or ability.
   * @param {Object} option - The upgrade option to apply
   */
  const handleUpgrade = (option) => {
    setPlayer((prev) => {
      const newPlayer = { ...prev, rareStats: { ...prev.rareStats } };
      const currentTurnLogs = [];
      const value = [
        "critChance",
        "lifeSteal",
        "dodge",
        "stunChance",
        "counterattack",
        "swiftness",
      ].includes(option.key)
        ? option.value / 100
        : ["critDamage"].includes(option.key)
        ? option.value / 100
        : option.value;
      if (
        option.key === "minAttack" &&
        newPlayer.minAttack + value > newPlayer.maxAttack
      ) {
        newPlayer.maxAttack += value;
        addLog(
          `Player upgraded Max Attack by +${value} due to Min Attack exceeding Max Attack!`,
          "upgrade",
          currentTurnLogs
        );
      } else if (option.key === "maxHealth") {
        newPlayer.maxHealth += value;
        newPlayer.currentHealth = Math.min(newPlayer.currentHealth + value, newPlayer.maxHealth);
        addLog(
          `Player upgraded ${option.name} by +${option.value}!`,
          "upgrade",
          currentTurnLogs
        );
      } else if (option.key in newPlayer.rareStats) {
        newPlayer.rareStats[option.key] += value;
        addLog(
          ["critChance", "critDamage", "lifeSteal", "dodge", "stunChance", "counterattack", "swiftness"].includes(option.key)
            ? `Player upgraded ${option.name} by +${option.value}%!`
            : `Player upgraded ${option.name} by +${option.value}!`,
          "upgrade",
          currentTurnLogs
        );
      } else {
        newPlayer[option.key] += value;
        addLog(
          ["critChance", "critDamage", "lifeSteal", "dodge", "stunChance", "counterattack", "swiftness"].includes(option.key)
            ? `Player upgraded ${option.name} by +${option.value}%!`
            : `Player upgraded ${option.name} by +${option.value}!`,
          "upgrade",
          currentTurnLogs
        );
      }
      newPlayer.effects = {
        burnDot: 0,
        poisonBase: 0,
        poisonDot: 0,
        isStuned: false,
      };
      updateTurnLogs(currentTurnLogs);
      return newPlayer;
    });
    setLevel((prev) => prev + 1);
    setEnemy(initEnemy(level + 1));
    setTurnCount(1);
    setShowUpgradeOptions(false);
    if (level % 10 === 9) {
      setShowShop(true);
      setShopOptions(generateUpgradeOptions(player));
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

    let newPlayer = { ...player, rareStats: { ...player.rareStats } };
    let newEnemy = { ...enemy, rareStats: { ...enemy.rareStats } };
    const currentTurn = turnCount;
    const currentTurnLogs = [];

    startTurn(currentTurn, level, currentTurnLogs);

    const enemyAliveAfterPlayer = playerTurn(
      newPlayer,
      newEnemy,
      currentTurnLogs
    );
    let gameStatus = checkGameOver(newPlayer, newEnemy, currentTurnLogs, level);
    if (gameStatus.isOver || gameStatus.levelUp) {
      newPlayer.level++;
      endTurn(newPlayer, newEnemy, currentTurnLogs, gameStatus);
      return;
    }

    if (enemyAliveAfterPlayer) {
      enemyTurn(newPlayer, newEnemy, currentTurnLogs);
      gameStatus = checkGameOver(newPlayer, newEnemy, currentTurnLogs, level);
    }

    endTurn(newPlayer, newEnemy, currentTurnLogs, gameStatus);

    setGlobalTurnCount((prev) => prev + 1);
    if (!gameStatus.levelUp) {
      setTurnCount(currentTurn + 1);
    }
  };

  /**
   * Toggles auto-attack mode.
   */
  const toggleAuto = () => {
    if (!showUpgradeOptions && !showShop) {
      setIsAuto((prev) => !prev);
    }
  };

  /**
   * Resets the game to initial state.
   */
  const resetGame = () => {
    setPlayer({
      ...initPlayer(),
      effects: {
        burnDot: 0,
        poisonBase: 0,
        poisonDot: 0,
        isStuned: false,
      },
    });
    setEnemy({
      ...initEnemy(1),
      effects: {
        burnDot: 0,
        poisonBase: 0,
        poisonDot: 0,
        isStuned: false,
      },
    });
    setTurnLogs([]);
    setGameOver(false);
    setTurnCount(1);
    setGlobalTurnCount(1);
    setLogId(1);
    setLevel(1);
    setIsAuto(false);
    setShowUpgradeOptions(false);
    setUpgradeOptions([]);
    setIsRareUpgrade(false);
    setShowShop(false);
    setShopOptions([]);
    resetShopState();
  };

  return {
    handlePurchase,
    handleReroll,
    handleExitShop,
    handleUpgrade,
    endGame,
    handleEndRun,
    handleAttack,
    toggleAuto,
    resetGame,
  };
};

export default useGameLogic;