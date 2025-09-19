import React, { useState, useEffect, useRef } from "react";
import {
  initPlayer,
  initEnemy,
  generateUpgradeOptions,
  generateRareUpgradeOptions,
} from "./initializers";
import { playerTurn, enemyTurn, attackPhase } from "./gameLogic";
import { addLog, checkGameOver, startTurn } from "./utils";

import { useTickets } from "../../components/context/TicketContext";

const BattleGame = () => {
  const { earnTickets } = useTickets();

  const [player, setPlayer] = useState(initPlayer());
  const [enemy, setEnemy] = useState(initEnemy(1));
  const [turnLogs, setTurnLogs] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [turnCount, setTurnCount] = useState(1);
  const [globalTurnCount, setGlobalTurnCount] = useState(1);
  const [logId, setLogId] = useState(1);
  const [level, setLevel] = useState(1);
  const [isAuto, setIsAuto] = useState(false);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  const [upgradeOptions, setUpgradeOptions] = useState([]);
  const [isRareUpgrade, setIsRareUpgrade] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [shopOptions, setShopOptions] = useState([]);
  const [rerollPrice, setRerollPrice] = useState(50);
  const [boughtOptions, setBoughtOptions] = useState([]);
  const [playerEffects, setPlayerEffects] = useState({
    burnDot: 0,
    poisonBase: 0,
    poisonDot: 0,
    stunned: false,
  });
  const [enemyEffects, setEnemyEffects] = useState({
    burnDot: 0,
    poisonBase: 0,
    poisonDot: 0,
    stunned: false,
  });
  const [showRareStats, setShowRareStats] = useState(false);
  const logContainerRef = useRef(null);

  // Auto-scroll to the latest turn (top)
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [turnLogs]);

  // Handle auto-attack mode
  useEffect(() => {
    if (isAuto && !gameOver && !showUpgradeOptions && !showShop) {
      const interval = setInterval(() => {
        handleAttack();
      }, 150);
      return () => clearInterval(interval);
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

  // Reusable function to update turn logs
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

  // Reusable function to reset shop state
  const resetShopState = () => {
    setRerollPrice(50 + Math.floor(level * 1.5));
    setBoughtOptions([]);
  };

  const increaseRerollPrice = () => {
    setRerollPrice((prev) => Math.floor(prev * 1.5));
    setBoughtOptions([]);
  };

  // Toggle rare stats visibility
  const toggleRareStats = () => {
    setShowRareStats((prev) => !prev);
  };

  // End of a turn
  const endTurn = (
    newPlayer,
    newEnemy,
    currentTurnLogs,
    gameStatus,
    localPlayerEffects,
    localEnemyEffects
  ) => {
    setPlayer(newPlayer);
    setEnemy(newEnemy);
    setPlayerEffects(localPlayerEffects);
    setEnemyEffects(localEnemyEffects);
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

  // Handle shop purchase
  const handlePurchase = (option, index) => {
    if (player.gold < option.price || boughtOptions.includes(index)) return;
    setPlayer((prev) => {
      const newPlayer = { ...prev };
      const originalMinAttack = newPlayer.minAttack;
      const value = ["critChance", "lifeSteal", "dodge", "stunChance"].includes(
        option.key
      )
        ? option.value / 100
        : ["critDamage"].includes(option.key)
        ? option.value / 100
        : option.value;
      if (
        option.key === "minAttack" &&
        newPlayer.minAttack + value > newPlayer.maxAttack
      ) {
        newPlayer.minAttack = newPlayer.maxAttack;
      } else if (option.key in newPlayer.rareStats) {
        newPlayer.rareStats[option.key] += value;
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
      updateTurnLogs(currentTurnLogs);
      return newPlayer;
    });
    setBoughtOptions((prev) => [...prev, index]);
  };

  // Handle reroll shop
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

  // Handle exit shop
  const handleExitShop = () => {
    setShowShop(false);
    resetShopState();
  };

  // Handle upgrade selection
  const handleUpgrade = (option) => {
    setPlayer((prev) => {
      const newPlayer = { ...prev };
      const originalMinAttack = newPlayer.minAttack;
      const value = ["critChance", "lifeSteal", "dodge", "stunChance"].includes(
        option.key
      )
        ? option.value / 100
        : ["critDamage"].includes(option.key)
        ? option.value / 100
        : option.value;
      if (
        option.key === "minAttack" &&
        newPlayer.minAttack + value > newPlayer.maxAttack
      ) {
        newPlayer.minAttack = newPlayer.maxAttack;
      } else if (option.key in newPlayer.rareStats) {
        newPlayer.rareStats[option.key] += value;
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
      updateTurnLogs(currentTurnLogs);
      return newPlayer;
    });
    setLevel((prev) => prev + 1);
    setEnemy(initEnemy(level + 1));
    setEnemyEffects({
      burnDot: 0,
      poisonBase: 0,
      poisonDot: 0,
      stunned: false,
    });
    setPlayerEffects({
      burnDot: 0,
      poisonBase: 0,
      poisonDot: 0,
      stunned: false,
    });
    setTurnCount(1);
    setShowUpgradeOptions(false);
    if (level % 10 === 9) {
      setShowShop(true);
      setShopOptions(generateUpgradeOptions(player));
      resetShopState();
    }
  };

  // Centralized game over function
  const endGame = () => {
    const gained = earnTickets(level);
    const currentTurnLogs = [];
    addLog("Game Over!", "gameOver", currentTurnLogs);
    addLog(`🎟️ You gained ${gained} tickets!`, "ticket", currentTurnLogs);
    updateTurnLogs(currentTurnLogs);
    setGameOver(true);
    setIsAuto(false);
  };

  // Handle quit game
  const handleEndRun = () => {
    const newPlayer = { ...player, rareStats: { ...player.rareStats } };
    const newEnemy = { ...enemy, rareStats: { ...enemy.rareStats } };
    const currentTurnLogs = [];
    const gameStatus = { isOver: true, levelUp: false };
    endTurn(
      newPlayer,
      newEnemy,
      currentTurnLogs,
      gameStatus,
      playerEffects,
      enemyEffects
    );
  };

  const handleAttack = () => {
    if (gameOver || showUpgradeOptions || showShop) return;

    let newPlayer = { ...player, rareStats: { ...player.rareStats } };
    let newEnemy = { ...enemy, rareStats: { ...enemy.rareStats } };
    let localPlayerEffects = { ...playerEffects };
    let localEnemyEffects = { ...enemyEffects };
    const currentTurn = turnCount;
    const currentTurnLogs = [];

    startTurn(currentTurn, level, currentTurnLogs);

    const enemyAliveAfterPlayer = playerTurn(
      newPlayer,
      newEnemy,
      currentTurnLogs,
      localPlayerEffects,
      localEnemyEffects
    );
    let gameStatus = checkGameOver(newPlayer, newEnemy, currentTurnLogs, level);
    if (gameStatus.isOver || gameStatus.levelUp) {
      newPlayer.level++;
      // console.log("Player level increased to:", newPlayer.level);
      endTurn(
        newPlayer,
        newEnemy,
        currentTurnLogs,
        gameStatus,
        localPlayerEffects,
        localEnemyEffects
      );
      return;
    }

    if (enemyAliveAfterPlayer) {
      enemyTurn(
        newPlayer,
        newEnemy,
        currentTurnLogs,
        localPlayerEffects,
        localEnemyEffects
      );
      gameStatus = checkGameOver(newPlayer, newEnemy, currentTurnLogs, level);
    }

    endTurn(
      newPlayer,
      newEnemy,
      currentTurnLogs,
      gameStatus,
      localPlayerEffects,
      localEnemyEffects
    );

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
    resetShopState();
    setPlayerEffects({
      burnDot: 0,
      poisonBase: 0,
      poisonDot: 0,
      stunned: false,
    });
    setEnemyEffects({
      burnDot: 0,
      poisonBase: 0,
      poisonDot: 0,
      stunned: false,
    });
    setShowRareStats(false);
  };

  const renderStat = (name, value, isPercentage = false) => (
    <div className="flex justify-between text-sm">
      <span>{name}:</span>
      <span>{isPercentage ? `${(value * 100).toFixed(0)}%` : value}</span>
    </div>
  );

  const renderRareStat = (name, value, isPercentage = false) => (
    <div className="flex justify-between text-sm">
      <span>{name}:</span>
      <span>{isPercentage ? `${(value * 100).toFixed(0)}%` : value}</span>
    </div>
  );

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-100 rounded-lg bg-game">
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
          <div className="p-1">
            {renderStat("Health", player.health)}
            {renderStat("Regeneration", player.regeneration)}
            {renderStat("Armor", player.armor)}
            {/* {renderStat("Min Attack", player.minAttack)}
            {renderStat("Max Attack", player.maxAttack)} */}
            <div className="flex justify-between text-sm">
              <span>Attack:</span>
              <span>
                {player.minAttack} - {player.maxAttack}
              </span>
            </div>
            {renderStat("Crit Chance", player.critChance, true)}
            {renderStat("Crit Damage", player.critDamage, true)}
            {renderStat("Life Steal", player.lifeSteal, true)}
            {renderStat("Dodge", player.dodge < 0.6 ? player.dodge : 0.6, true)}
          </div>
          <div className="mt-2">
            {showRareStats && (
              <div className="bg-game-secondary">
                {renderRareStat("Burn", player.rareStats.burn)}
                {renderRareStat("Poison", player.rareStats.poison)}
                {renderRareStat(
                  "Stun Chance",
                  player.rareStats.stunChance,
                  true
                )}
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="font-semibold">Enemy Stats:</h2>
          <div className="p-1">
            {renderStat("Health", enemy.health)}
            {renderStat("Regeneration", enemy.regeneration)}
            {renderStat("Armor", enemy.armor)}
            {/* {renderStat("Min Attack", enemy.minAttack)}
            {renderStat("Max Attack", enemy.maxAttack)} */}
            <div className="flex justify-between text-sm">
              <span>Attack:</span>
              <span>
                {enemy.minAttack} - {enemy.maxAttack}
              </span>
            </div>
            {renderStat("Crit Chance", enemy.critChance, true)}
            {renderStat("Crit Damage", enemy.critDamage, true)}
            {renderStat("Life Steal", enemy.lifeSteal, true)}
            {renderStat("Dodge", enemy.dodge < 0.6 ? enemy.dodge : 0.6, true)}
          </div>
          <div className="mt-2">
            {showRareStats && (
              <div className="bg-game-secondary">
                {renderRareStat("Burn", enemy.rareStats.burn)}
                {renderRareStat("Poison", enemy.rareStats.poison)}
                {renderRareStat(
                  "Stun Chance",
                  enemy.rareStats.stunChance,
                  true
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={toggleRareStats}
          className="font-semibold flex items-center !border-0 !bg-transparent"
        >
          {showRareStats ? "➖" : "➕"}
        </button>
      </div>
      <p className="text-center text-yellow-500 mb-4">Gold: {player.gold}</p>
      {showUpgradeOptions && (
        <div className="mb-4">
          <h2 className="font-semibold">
            {isRareUpgrade ? "Choose a Rare Upgrade:" : "Choose an Upgrade:"}
          </h2>
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
          <button
            onClick={toggleAuto}
            className={`${isAuto ? "w-[100%]" : "w-[40%]"}`}
          >
            {isAuto ? "Stop Auto" : "Auto"}
          </button>
          {!isAuto && (
            <>
              <button onClick={handleAttack} className="w-[40%]">
                Next Turn
              </button>
              <button onClick={handleEndRun}>☠️</button>
            </>
          )}
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
      <div
        ref={logContainerRef}
        className="mt-2 max-h-64 overflow-y-auto bg-game-secondary"
      >
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
              {turnIndex < reversedArray.length - 1 &&
                turnEntry.logs.length > 0 && (
                  <hr className="my-2 border-gray-300" />
                )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default BattleGame;
