import React, { useState, useEffect, useRef } from "react";
import {
  initPlayer,
  initEnemy,
  generateUpgradeOptions,
  generateRareUpgradeOptions,
} from "./initializers";
import { playerTurn, enemyTurn, attackPhase } from "./gameLogic";
import { addLog, checkGameOver, startTurn } from "./utils";

const BattleGame = () => {
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

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [turnLogs]);

  useEffect(() => {
    if (isAuto && !gameOver && !showUpgradeOptions && !showShop) {
      const interval = setInterval(() => {
        handleAttack();
      }, 100);
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

  const toggleRareStats = () => {
    setShowRareStats((prev) => !prev);
  };

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
    setTurnLogs((prev) => {
      const newTurnLogs = [
        ...prev,
        { turnId: logId, turn: turnCount, level: level, logs: currentTurnLogs },
      ];
      if (newTurnLogs.length > 20) {
        return newTurnLogs.slice(1);
      }
      return newTurnLogs;
    });
    setLogId((prev) => prev + 1);
    if (gameStatus.isOver) {
      setGameOver(true);
      setIsAuto(false);
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

  const handlePurchase = (option, index) => {
    if (player.gold < option.price || boughtOptions.includes(index)) return;
    const newLogId = logId;
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
    setRerollPrice((prev) => prev + 50);
    setShopOptions(generateUpgradeOptions(player));
    setBoughtOptions([]);
    setLogId((prev) => prev + 1);
  };

  const handleExitShop = () => {
    setShowShop(false);
    setRerollPrice(50);
    setBoughtOptions([]);
  };

  const handleUpgrade = (option) => {
    const newLogId = logId;
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
      setRerollPrice(50);
      setBoughtOptions([]);
    }
    setLogId((prev) => prev + 1);
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
    setRerollPrice(50);
    setBoughtOptions([]);
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

  return (
    <div className="p-4 max-w-md mx-auto rounded-lg bg-game">
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
          <h2 className="font-semibold mb-2">Player Stats:</h2>
          <div>
            <div className="space-y-1 p-1">
              <div className="flex justify-between">
                <span>Health:</span>
                <span>{player.health}</span>  
              </div>
              <div className="flex justify-between">
                <span>Min Attack:</span>
                <span>{player.minAttack}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Attack:</span>
                <span>{player.maxAttack}</span>
              </div>
              <div className="flex justify-between">
                <span>Crit Chance:</span>
                <span>{(player.critChance * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Crit Damage:</span>
                <span>{(player.critDamage * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Life Steal:</span>
                <span>{(player.lifeSteal * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Regeneration:</span>
                <span>{player.regeneration}</span>
              </div>
              <div className="flex justify-between">
                <span>Dodge:</span>
                <span>
                  {player.dodge < 0.6
                    ? `${(player.dodge * 100).toFixed(0)}%`
                    : `${(player.dodge * 100).toFixed(0)}% / 60%`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Armor:</span>
                <span>{player.armor}</span>
              </div>
            </div>
            <div className="mt-2">
              {showRareStats && (
                <div className="space-y-1 bg-game-secondary">
                  <div className="flex justify-between">
                    <span>Burn:</span>
                    <span>{player.rareStats.burn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Poison:</span>
                    <span>{player.rareStats.poison}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stun Chance:</span>
                    <span>
                      {(player.rareStats.stunChance * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Enemy Stats:</h2>
          <div>
            <div className="space-y-1 p-1">
              <div className="flex justify-between">
                <span>Health:</span>
                <span>{enemy.health}</span>
              </div>
              <div className="flex justify-between">
                <span>Min Attack:</span>
                <span>{enemy.minAttack}</span>
              </div>
              <div className="flex justify-between">
                <span>Max Attack:</span>
                <span>{enemy.maxAttack}</span>
              </div>
              <div className="flex justify-between">
                <span>Crit Chance:</span>
                <span>{(enemy.critChance * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Crit Damage:</span>
                <span>{(enemy.critDamage * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Life Steal:</span>
                <span>{(enemy.lifeSteal * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Regeneration:</span>
                <span>{enemy.regeneration}</span>
              </div>
              <div className="flex justify-between">
                <span>Dodge:</span>
                <span>
                  {enemy.dodge < 0.6
                    ? `${(enemy.dodge * 100).toFixed(0)}%`
                    : `${(enemy.dodge * 100).toFixed(0)}% / 60%`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Armor:</span>
                <span>{enemy.armor}</span>
              </div>
            </div>
            <div className="mt-2">
              {showRareStats && (
                <div className="space-y-1 bg-game-secondary">
                  <div className="flex justify-between">
                    <span>Burn:</span>
                    <span>{enemy.rareStats.burn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Poison:</span>
                    <span>{enemy.rareStats.poison}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stun Chance:</span>
                    <span>
                      {(enemy.rareStats.stunChance * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
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
            className={`px-4 py-2 rounded ${
              isAuto
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-yellow-500 hover:bg-yellow-600 text-white"
            }`}
          >
            {isAuto ? "Stop Auto" : "Auto"}
          </button>
          {!isAuto && (
            <button
              onClick={handleAttack}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Next Turn
            </button>
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
