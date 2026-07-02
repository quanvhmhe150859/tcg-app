import React, { useState, useEffect, useRef } from "react";

// Initialize player with fixed stats
const initPlayer = () => ({
  health: 10000,
  minAttack: 10,
  maxAttack: 10,
  critChance: 0.2, // 20% chance for critical hit
  critDamage: 2, // 200% damage on critical hit
  lifeSteal: 0.3, // 30% of damage dealt restored as health
  regeneration: 5, // 5 health restored per turn
  dodge: 0.1, // 10% chance to dodge attacks
  armor: 50, // 50 armor reduces damage by ~33.33%
  gold: 0, // Gold earned from defeating enemies
  burn: 50,
  poison: 50,
  stunChance: 0.5,
});

// Initialize enemy with random stats based on level, with boss scaling at levels 10, 20, 30, ...
const initEnemy = (level) => {
  const isBoss = level % 10 === 0;
  const baseFactor = 0.7 + Math.random() * 0.3; // Reduced scaling factor
  const bossMultiplier = isBoss ? 2 : 1; // Double certain stats for bosses
  return {
    health: Math.floor(100 * level * baseFactor * bossMultiplier),
    minAttack: Math.floor(1 * level * baseFactor * bossMultiplier),
    maxAttack: Math.floor(10 * level * baseFactor * bossMultiplier),
    critChance: 0.2 * baseFactor,
    critDamage: 2 * baseFactor,
    lifeSteal: 0.3 * baseFactor,
    regeneration: Math.floor(5 * level * baseFactor * bossMultiplier),
    dodge: 0.1 * baseFactor,
    armor: Math.floor(50 * level * baseFactor * bossMultiplier),
    burn: 0,
    poison: 0,
    stunChance: 0,
  };
};

// Generate three random upgrade options, excluding minAttack if minAttack equals maxAttack
const generateUpgradeOptions = (player) => {
  const stats = [
    {
      key: "health",
      name: "Health",
      min: 20,
      max: 50,
      format: (val) => `+${val}`,
    },
    {
      key: "minAttack",
      name: "Min Attack",
      min: 1,
      max: 3,
      format: (val) => `+${val}`,
    },
    {
      key: "maxAttack",
      name: "Max Attack",
      min: 2,
      max: 5,
      format: (val) => `+${val}`,
    },
    {
      key: "critChance",
      name: "Crit Chance",
      min: 1,
      max: 5,
      format: (val) => `+${val}%`,
    },
    {
      key: "critDamage",
      name: "Crit Damage",
      min: 10,
      max: 50,
      format: (val) => `+${val}%`,
    },
    {
      key: "lifeSteal",
      name: "Life Steal",
      min: 1,
      max: 5,
      format: (val) => `+${val}%`,
    },
    {
      key: "regeneration",
      name: "Regeneration",
      min: 2,
      max: 5,
      format: (val) => `+${val}`,
    },
    {
      key: "dodge",
      name: "Dodge",
      min: 1,
      max: 5,
      format: (val) => `+${val}%`,
    },
    {
      key: "armor",
      name: "Armor",
      min: 10,
      max: 30,
      format: (val) => `+${val}`,
    },
  ].filter(
    (stat) => stat.key !== "minAttack" || player.minAttack !== player.maxAttack
  );
  // Shuffle stats and pick first three
  const shuffled = stats.sort(() => Math.random() - 0.5).slice(0, 3);
  return shuffled.map((stat) => ({
    key: stat.key,
    name: stat.name,
    value: Math.floor(stat.min + Math.random() * (stat.max - stat.min + 1)),
    format: stat.format,
    price: Math.floor(50 + Math.random() * 100), // Random price between 50 and 150 gold
  }));
};

const generateRareUpgradeOptions = (player) => {
  const rareStats = [
    {
      key: "burn",
      name: "Burn",
      min: 1,
      max: 3,
      format: (val) => `+${val}`,
    },
    {
      key: "poison",
      name: "Poison",
      min: 1,
      max: 3,
      format: (val) => `+${val}`,
    },
    {
      key: "stunChance",
      name: "Stun Chance",
      min: 1,
      max: 3,
      format: (val) => `+${val}%`,
    },
  ];
  // Shuffle stats and pick first three
  const shuffled = rareStats.sort(() => Math.random() - 0.5).slice(0, 3);
  return shuffled.map((stat) => ({
    key: stat.key,
    name: stat.name,
    value: Math.floor(stat.min + Math.random() * (stat.max - stat.min + 1)),
    format: stat.format,
  }));
};

const BattleGame = () => {
  const [player, setPlayer] = useState(initPlayer());
  const [enemy, setEnemy] = useState(initEnemy(1));
  const [turnLogs, setTurnLogs] = useState([]); // Array of { turnId: number, turn: number, level: number, logs: [{ message, color }] }
  const [gameOver, setGameOver] = useState(false);
  const [turnCount, setTurnCount] = useState(1);
  const [globalTurnCount, setGlobalTurnCount] = useState(1);
  const [logId, setLogId] = useState(1); // Unique ID for turnLogs entries
  const [level, setLevel] = useState(1);
  const [isAuto, setIsAuto] = useState(false);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  const [upgradeOptions, setUpgradeOptions] = useState([]);
  const [isRareUpgrade, setIsRareUpgrade] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [shopOptions, setShopOptions] = useState([]);
  const [rerollPrice, setRerollPrice] = useState(50); // Initial reroll price
  const [boughtOptions, setBoughtOptions] = useState([]); // Array of indices of bought options
  const [playerEffects, setPlayerEffects] = useState({ burnDot: 0, poisonBase: 0, poisonDot: 0, stunned: false });
  const [enemyEffects, setEnemyEffects] = useState({ burnDot: 0, poisonBase: 0, poisonDot: 0, stunned: false });
  const logContainerRef = useRef(null);

  // Auto-scroll to the latest turn (top)
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0; // Scroll to top for newest turn
    }
  }, [turnLogs]);

  // Handle auto-attack mode
  useEffect(() => {
    if (isAuto && !gameOver && !showUpgradeOptions && !showShop) {
      const interval = setInterval(() => {
        handleAttack();
      }, 100);
      return () => clearInterval(interval); // Cleanup interval
    }
  }, [
    isAuto,
    gameOver,
    showUpgradeOptions,
    showShop,
    player,
    enemy,
    turnCount,
    level,
  ]);

  // Add log to the current turn's log array
  const addLog = (message, type, currentTurnLogs) => {
    const colorMap = {
      turn: "",
      attackCritical: "text-orange-500",
      lifeSteal: "text-green-500",
      regeneration: "text-green-500",
      gameOver: "text-red-500",
      dodge: "text-blue-500",
      stun: "text-blue-500",
      burn: "text-orange-500",
      poison: "text-purple-500",
      levelUp: "text-purple-500",
      upgrade: "text-yellow-500",
      purchase: "text-yellow-500",
      gold: "text-yellow-500",
    };
    currentTurnLogs.push({ message, color: colorMap[type] || "" });
  };

  // Check if game is over or level up (player or enemy health <= 0)
  const checkGameOver = (newPlayer, newEnemy, currentTurnLogs) => {
    if (newEnemy.health <= 0) {
      // Calculate gold as sum of enemy stats
      const goldGained = Math.floor(
        newEnemy.health +
          newEnemy.minAttack +
          newEnemy.maxAttack +
          newEnemy.critChance * 100 +
          newEnemy.critDamage * 100 +
          newEnemy.lifeSteal * 100 +
          newEnemy.regeneration +
          newEnemy.dodge * 100 +
          newEnemy.armor +
          newEnemy.burn +
          newEnemy.poison +
          newEnemy.stunChance * 100
      );
      newPlayer.gold += goldGained;
      addLog(
        `Enemy defeated! Level up to ${level + 1}!`,
        "levelUp",
        currentTurnLogs
      );
      addLog(`Player gained ${goldGained} gold!`, "gold", currentTurnLogs);
      return { isOver: false, levelUp: true };
    }
    if (newPlayer.health <= 0) {
      addLog("Player defeated!", "gameOver", currentTurnLogs);
      return { isOver: true, levelUp: false };
    }
    return { isOver: false, levelUp: false };
  };

  // Start of a turn
  const startTurn = (turn, level, currentTurnLogs) => {
    addLog(`Turn ${turn} (Level ${level})`, "turn", currentTurnLogs);
  };

  // Consolidated attack phase for player or enemy
  const attackPhase = (attacker, defender, attackerName, currentTurnLogs, attackerEffects, defenderEffects) => {
    // Check for dodge, capped at 60%
    if (Math.random() < Math.min(defender.dodge, 0.6)) {
      addLog(
        `${attackerName === "Player" ? "Enemy" : "Player"} dodges the attack!`,
        "dodge",
        currentTurnLogs
      );
      return true; // Defender is alive
    }

    const baseDamage =
      Math.floor(
        Math.random() * (attacker.maxAttack - attacker.minAttack + 1)
      ) + attacker.minAttack;
    const isCritical = Math.random() < attacker.critChance;
    const preArmorDamage = isCritical
      ? Math.floor(baseDamage * attacker.critDamage)
      : baseDamage;
    const finalDamage = Math.floor(
      preArmorDamage * (100 / (100 + defender.armor))
    );
    defender.health = Math.max(0, defender.health - finalDamage);
    addLog(
      `${attackerName} deals ${finalDamage} (${preArmorDamage}) damage to ${
        attackerName === "Player" ? "Enemy" : "Player"
      }!${isCritical ? " (Critical Hit)" : ""}`,
      isCritical ? "attackCritical" : "",
      currentTurnLogs
    );

    // Life steal based on final damage
    if (attacker.lifeSteal > 0 && finalDamage > 0) {
      const healthRestored = Math.floor(finalDamage * attacker.lifeSteal);
      if (healthRestored > 0) {
        attacker.health += healthRestored;
        addLog(
          `${attackerName} restores ${healthRestored} health via life steal!`,
          "lifeSteal",
          currentTurnLogs
        );
      }
    }

    // Apply stun
    if (Math.random() < attacker.stunChance) {
      defenderEffects.stunned = true;
      addLog(`${attackerName === "Player" ? "Enemy" : "Player"} is stunned!`, "stun", currentTurnLogs);
    }

    // Apply burn and poison to defender
    if (attacker.burn > 0) {
      defenderEffects.burnDot = attacker.burn;
    }
    if (attacker.poison > 0 && defenderEffects.poisonBase === 0) {
      defenderEffects.poisonBase = attacker.poison;
      defenderEffects.poisonDot = attacker.poison;
    }

    return defender.health > 0; // Return true if defender is alive
  };

  // Apply burn and check death
  const applyBurn = (entity, entityName, currentTurnLogs, effects) => {
    if (effects.burnDot > 0) {
      const damage = effects.burnDot;
      entity.health = Math.max(0, entity.health - damage);
      addLog(`${entityName} takes ${damage} burn damage!`, "burn", currentTurnLogs);
      if (entity.health <= 0) {
        return false;
      }
    }
    return true;
  };

  // Apply poison and check death, then increase for next turn
  const applyPoison = (entity, entityName, currentTurnLogs, effects) => {
    if (effects.poisonDot > 0) {
      const damage = effects.poisonDot;
      entity.health = Math.max(0, entity.health - damage);
      addLog(`${entityName} takes ${damage} poison damage!`, "poison", currentTurnLogs);
      // Increase poisonDot by poisonBase for next turn
      effects.poisonDot += effects.poisonBase;
      if (entity.health <= 0) {
        return false;
      }
    }
    return true;
  };

  // Player's turn phase
  const playerTurn = (newPlayer, newEnemy, currentTurnLogs, localPlayerEffects, localEnemyEffects) => {
    if (!applyBurn(newPlayer, "Player", currentTurnLogs, localPlayerEffects)) {
      return false; // Player dead
    }

    if (newPlayer.regeneration > 0) {
      newPlayer.health += newPlayer.regeneration;
      addLog(
        `Player regenerates ${newPlayer.regeneration} health!`,
        "regeneration",
        currentTurnLogs
      );
    }

    if (localPlayerEffects.stunned) {
      addLog(`Player is stunned and misses the turn!`, "stun", currentTurnLogs);
      localPlayerEffects.stunned = false;
    } else {
      attackPhase(newPlayer, newEnemy, "Player", currentTurnLogs, localPlayerEffects, localEnemyEffects);
    }

    if (!applyPoison(newPlayer, "Player", currentTurnLogs, localPlayerEffects)) {
      return false; // Player dead
    }

    return newEnemy.health > 0;
  };

  // Enemy's turn phase
  const enemyTurn = (newPlayer, newEnemy, currentTurnLogs, localPlayerEffects, localEnemyEffects) => {
    if (!applyBurn(newEnemy, "Enemy", currentTurnLogs, localEnemyEffects)) {
      return;
    }

    if (newEnemy.regeneration > 0) {
      newEnemy.health += newEnemy.regeneration;
      addLog(
        `Enemy regenerates ${newEnemy.regeneration} health!`,
        "regeneration",
        currentTurnLogs
      );
    }

    if (localEnemyEffects.stunned) {
      addLog(`Enemy is stunned and misses the turn!`, "stun", currentTurnLogs);
      localEnemyEffects.stunned = false;
    } else {
      attackPhase(newEnemy, newPlayer, "Enemy", currentTurnLogs, localEnemyEffects, localPlayerEffects);
    }

    applyPoison(newEnemy, "Enemy", currentTurnLogs, localEnemyEffects);
  };

  // End of a turn
  const endTurn = (newPlayer, newEnemy, currentTurnLogs, gameStatus, localPlayerEffects, localEnemyEffects) => {
    setPlayer(newPlayer);
    setEnemy(newEnemy);
    setPlayerEffects(localPlayerEffects);
    setEnemyEffects(localEnemyEffects);
    setTurnLogs((prev) => {
      const newTurnLogs = [
        ...prev,
        { turnId: logId, turn: turnCount, level: level, logs: currentTurnLogs },
      ];
      // Limit to 20 turns, remove oldest if necessary
      if (newTurnLogs.length > 20) {
        return newTurnLogs.slice(1);
      }
      return newTurnLogs;
    });
    setLogId((prev) => prev + 1);
    if (gameStatus.isOver) {
      setGameOver(true);
      setIsAuto(false); // Stop auto mode on game over
    }
    if (gameStatus.levelUp) {
      const isBossDefeated = level % 10 === 0;
      setIsRareUpgrade(isBossDefeated);
      setUpgradeOptions(isBossDefeated ? generateRareUpgradeOptions(player) : generateUpgradeOptions(player));
      setShowUpgradeOptions(true);
    }
  };

  // Handle shop purchase
  const handlePurchase = (option, index) => {
    if (player.gold < option.price || boughtOptions.includes(index)) return;
    const newLogId = logId;
    setPlayer((prev) => {
      const newPlayer = { ...prev };
      const originalMinAttack = newPlayer.minAttack;
      // Scale percentage stats by dividing by 100
      const value = ["critChance", "lifeSteal", "dodge", "stunChance"].includes(option.key)
        ? option.value / 100
        : ["critDamage"].includes(option.key)
        ? option.value / 100
        : option.value;
      // Cap minAttack to maxAttack
      if (
        option.key === "minAttack" &&
        newPlayer.minAttack + value > newPlayer.maxAttack
      ) {
        newPlayer.minAttack = newPlayer.maxAttack;
      } else {
        newPlayer[option.key] += value;
      }
      newPlayer.gold -= option.price;
      const currentTurnLogs = [];
      const actualValue =
        option.key === "minAttack"
          ? newPlayer.minAttack - originalMinAttack
          : option.value;
      const logMessage = [
        "critChance",
        "critDamage",
        "lifeSteal",
        "dodge",
        "stunChance",
      ].includes(option.key)
        ? `Player purchased ${option.name} by +${actualValue}% for ${option.price} gold!`
        : `Player purchased ${option.name} by +${actualValue} for ${option.price} gold!`;
      addLog(logMessage, "purchase", currentTurnLogs);
      setTurnLogs((prev) => {
        const newTurnLogs = [
          ...prev,
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
      return newPlayer;
    });
    setBoughtOptions((prev) => [...prev, index]);
    setLogId((prev) => prev + 1);
  };

  // Handle reroll shop
  const handleReroll = () => {
    if (player.gold < rerollPrice) return;
    const newLogId = logId;
    setPlayer((prev) => {
      const newPlayer = { ...prev, gold: prev.gold - rerollPrice };
      const currentTurnLogs = [];
      addLog(
        `Player rerolled shop for ${rerollPrice} gold!`,
        "purchase",
        currentTurnLogs
      );
      setTurnLogs((prev) => {
        const newTurnLogs = [
          ...prev,
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
      return newPlayer;
    });
    setRerollPrice((prev) => prev + 50); // Increase price by 50 each reroll
    setShopOptions(generateUpgradeOptions(player)); // Generate new options
    setBoughtOptions([]); // Reset bought options for new shop
    setLogId((prev) => prev + 1);
  };

  // Handle exit shop
  const handleExitShop = () => {
    setShowShop(false);
    setRerollPrice(50); // Reset reroll price for next shop
    setBoughtOptions([]);
  };

  // Handle upgrade selection
  const handleUpgrade = (option) => {
    const newLogId = logId;
    setPlayer((prev) => {
      const newPlayer = { ...prev };
      const originalMinAttack = newPlayer.minAttack;
      // Scale percentage stats by dividing by 100
      const value = ["critChance", "lifeSteal", "dodge", "stunChance"].includes(option.key)
        ? option.value / 100
        : ["critDamage"].includes(option.key)
        ? option.value / 100
        : option.value;
      // Cap minAttack to maxAttack
      if (
        option.key === "minAttack" &&
        newPlayer.minAttack + value > newPlayer.maxAttack
      ) {
        newPlayer.minAttack = newPlayer.maxAttack;
      } else {
        newPlayer[option.key] += value;
      }
      const currentTurnLogs = [];
      const actualValue =
        option.key === "minAttack"
          ? newPlayer.minAttack - originalMinAttack
          : option.value;
      const logMessage = [
        "critChance",
        "critDamage",
        "lifeSteal",
        "dodge",
        "stunChance",
      ].includes(option.key)
        ? `Player upgraded ${option.name} by +${actualValue}%!`
        : `Player upgraded ${option.name} by +${actualValue}!`;
      addLog(logMessage, "upgrade", currentTurnLogs);
      setTurnLogs((prev) => {
        const newTurnLogs = [
          ...prev,
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
      return newPlayer;
    });
    setLevel((prev) => prev + 1);
    setEnemy(initEnemy(level + 1));
    setEnemyEffects({ burnDot: 0, poisonBase: 0, poisonDot: 0, stunned: false });
    setPlayerEffects({ burnDot: 0, poisonBase: 0, poisonDot: 0, stunned: false });
    setTurnCount(1);
    setShowUpgradeOptions(false);
    if (level % 10 === 9) {
      // Show shop after upgrade on levels 9, 19, 29, ...
      setShowShop(true);
      setShopOptions(generateUpgradeOptions(player));
      setRerollPrice(50);
      setBoughtOptions([]);
    }
    setLogId((prev) => prev + 1);
  };

  const handleAttack = () => {
    if (gameOver || showUpgradeOptions || showShop) return;

    let newPlayer = { ...player };
    let newEnemy = { ...enemy };
    let localPlayerEffects = { ...playerEffects };
    let localEnemyEffects = { ...enemyEffects };
    const currentTurn = turnCount;
    const currentTurnLogs = []; // Logs for the current turn

    // Execute turn phases
    startTurn(currentTurn, level, currentTurnLogs);

    const enemyAliveAfterPlayer = playerTurn(newPlayer, newEnemy, currentTurnLogs, localPlayerEffects, localEnemyEffects);
    let gameStatus = checkGameOver(newPlayer, newEnemy, currentTurnLogs);
    if (gameStatus.isOver || gameStatus.levelUp) {
      endTurn(newPlayer, newEnemy, currentTurnLogs, gameStatus, localPlayerEffects, localEnemyEffects);
      return;
    }

    if (enemyAliveAfterPlayer) {
      enemyTurn(newPlayer, newEnemy, currentTurnLogs, localPlayerEffects, localEnemyEffects);
      gameStatus = checkGameOver(newPlayer, newEnemy, currentTurnLogs);
    }

    endTurn(newPlayer, newEnemy, currentTurnLogs, gameStatus, localPlayerEffects, localEnemyEffects);

    setGlobalTurnCount((prev) => prev + 1);
    if (!gameStatus.levelUp) {
      setTurnCount(currentTurn + 1);
    }
  };

  const toggleAuto = () => {
    if (!showUpgradeOptions && !showShop) {
      setIsAuto((prev) => !prev);
    }
  };

  const resetGame = () => {
    setPlayer(initPlayer());
    setEnemy(initEnemy(1));
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
    setRerollPrice(50);
    setBoughtOptions([]);
    setPlayerEffects({ burnDot: 0, poisonBase: 0, poisonDot: 0, stunned: false });
    setEnemyEffects({ burnDot: 0, poisonBase: 0, poisonDot: 0, stunned: false });
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-100 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">
        {level % 10 === 0 ? (
          <>
            <span className="text-red-500">Boss</span> - Level {level}
          </>
        ) : (
          <>Level {level}</>
        )}
      </h1>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold">Player Stats:</h2>
          <p>Health: {player.health}</p>
          <p>Min Attack: {player.minAttack}</p>
          <p>Max Attack: {player.maxAttack}</p>
          <p>Crit Chance: {(player.critChance * 100).toFixed(0)}%</p>
          <p>Crit Damage: {(player.critDamage * 100).toFixed(0)}%</p>
          <p>Life Steal: {(player.lifeSteal * 100).toFixed(0)}%</p>
          <p>Regeneration: {player.regeneration}</p>
          <p>
            Dodge:{" "}
            {player.dodge < 0.6
              ? `${(player.dodge * 100).toFixed(0)}%`
              : `${(player.dodge * 100).toFixed(0)}% / 60%`}
          </p>
          <p>Armor: {player.armor}</p>
          <p>Burn: {player.burn}</p>
          <p>Poison: {player.poison}</p>
          <p>Stun Chance: {(player.stunChance * 100).toFixed(0)}%</p>
        </div>
        <div>
          <h2 className="font-semibold">Enemy Stats:</h2>
          <p>Health: {enemy.health}</p>
          <p>Min Attack: {enemy.minAttack}</p>
          <p>Max Attack: {enemy.maxAttack}</p>
          <p>Crit Chance: {(enemy.critChance * 100).toFixed(0)}%</p>
          <p>Crit Damage: {(enemy.critDamage * 100).toFixed(0)}%</p>
          <p>Life Steal: {(enemy.lifeSteal * 100).toFixed(0)}%</p>
          <p>Regeneration: {enemy.regeneration}</p>
          <p>
            Dodge:{" "}
            {enemy.dodge < 0.6
              ? `${(enemy.dodge * 100).toFixed(0)}%`
              : `${(enemy.dodge * 100).toFixed(0)}% / 60%`}
          </p>
          <p>Armor: {enemy.armor}</p>
          <p>Burn: {enemy.burn}</p>
          <p>Poison: {enemy.poison}</p>
          <p>Stun Chance: {(enemy.stunChance * 100).toFixed(0)}%</p>
        </div>
      </div>
      <p className="text-center text-yellow-500 mb-4">Gold: {player.gold}</p>
      {showUpgradeOptions && (
        <div className="mb-4">
          <h2 className="font-semibold">{isRareUpgrade ? "Choose a Rare Upgrade:" : "Choose an Upgrade:"}</h2>
          <div className="space-y-2">
            {upgradeOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handleUpgrade(option)}
                className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded"
              >
                {option.name}: {option.format(option.value)}
              </button>
            ))}
          </div>
        </div>
      )}
      {showShop && (
        <div className="mb-4">
          <h2 className="font-semibold">Shop:</h2>
          <div className="space-y-2">
            {shopOptions.map((option, index) => (
              <button
                key={index}
                onClick={() => handlePurchase(option, index)}
                className={`w-full px-4 py-2 rounded text-white ${
                  boughtOptions.includes(index) || player.gold < option.price
                    ? "bg-gray-500 opacity-50 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {option.name}: {option.format(option.value)} - Cost:{" "}
                {option.price} gold
              </button>
            ))}
            <button
              onClick={handleReroll}
              className={`w-full px-4 py-2 mt-2 rounded text-white ${
                player.gold < rerollPrice
                  ? "bg-gray-500 opacity-50 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              Reroll Shop - Cost: {rerollPrice} gold
            </button>
            <button
              onClick={handleExitShop}
              className="w-full px-4 py-2 mt-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              Exit Shop
            </button>
          </div>
        </div>
      )}
      {!gameOver && !showUpgradeOptions && !showShop && (
        <div className="space-x-2">
          {!isAuto && (
            <button
              onClick={handleAttack}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Attack
            </button>
          )}
          <button
            onClick={toggleAuto}
            className={`px-4 py-2 rounded ${
              isAuto
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-yellow-500 hover:bg-yellow-600 text-white"
            }`}
          >
            {isAuto ? "Stop Auto" : "Auto"}
          </button>
        </div>
      )}
      {gameOver && (
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
        >
          Restart Game
        </button>
      )}
      <h2 className="font-semibold mt-4">Battle Log:</h2>
      <div ref={logContainerRef} className="mt-2 max-h-64 overflow-y-auto">
        {turnLogs
          .slice()
          .reverse()
          .map((turnEntry, turnIndex, reversedArray) => (
            <div key={turnEntry.turnId}>
              {turnEntry.logs.map((log, logIndex) => (
                <p
                  key={`${turnEntry.turnId}-${logIndex}`}
                  className={`text-sm ${log.color}`}
                >
                  {log.message}
                </p>
              ))}
              {turnIndex < reversedArray.length - 1 && (
                <hr className="my-2 border-gray-300" />
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default BattleGame;