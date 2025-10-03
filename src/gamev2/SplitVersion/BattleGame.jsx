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
  const [openTips, setOpenTips] = useState(false);

  useEffect(() => {
    document.body.style.minWidth = "672px";

    return () => {
      document.body.style.minWidth = "";
    };
  }, []);

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
  const [showRareStats, setShowRareStats] = useState(true);
  const logContainerRef = useRef(null);
  const min = 100;
  const max = 1000;
  const step = 50;
  const [autoSpeed, setAutoSpeed] = useState(150);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [turnLogs]);

  useEffect(() => {
    if (isAuto && !gameOver && !showUpgradeOptions && !showShop) {
      const interval = setInterval(() => {
        handleAttack();
      }, autoSpeed);

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
    autoSpeed,
  ]);

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

  const resetShopState = () => {
    setRerollPrice(50 + Math.floor(level * 1.5));
    setBoughtOptions([]);
  };

  const increaseRerollPrice = () => {
    setRerollPrice((prev) => Math.floor(prev * 1.5));
    setBoughtOptions([]);
  };

  const toggleRareStats = () => {
    setShowRareStats((prev) => !prev);
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
          : generateUpgradeOptions(player)
      );
      setShowUpgradeOptions(true);
    }
  };

  const handlePurchase = (option, index) => {
    if (player.gold < option.price || boughtOptions.includes(index)) return;
    setPlayer((prev) => {
      const newPlayer = { ...prev, rareStats: { ...prev.rareStats } };
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

  const handleExitShop = () => {
    setShowShop(false);
    resetShopState();
  };

  const handleUpgrade = (option) => {
    setPlayer((prev) => {
      const newPlayer = { ...prev, rareStats: { ...prev.rareStats } };
      const originalMinAttack = newPlayer.minAttack;
      const value = [
        "critChance",
        "lifeSteal",
        "dodge",
        "stunChance",
        "counterattack",
      ].includes(option.key)
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
      newPlayer.effects = {
        burnDot: 0,
        poisonBase: 0,
        poisonDot: 0,
        isStuned: false,
      };
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
        "counterattack",
      ].includes(option.key)
        ? `Player upgraded ${option.name} by +${actualValue}%!`
        : `Player upgraded ${option.name} by +${actualValue}!`;
      addLog(logMessage, "upgrade", currentTurnLogs);
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

  const endGame = () => {
    const gained = earnTickets(level);
    const currentTurnLogs = [];
    addLog("Game Over!", "gameOver", currentTurnLogs);
    addLog(`🎟️ You gained ${gained} tickets!`, "ticket", currentTurnLogs);
    updateTurnLogs(currentTurnLogs);
    setGameOver(true);
    setIsAuto(false);
  };

  const handleEndRun = () => {
    const newPlayer = { ...player, rareStats: { ...player.rareStats } };
    const newEnemy = { ...enemy, rareStats: { ...enemy.rareStats } };
    const currentTurnLogs = [];
    const gameStatus = { isOver: true, levelUp: false };
    endTurn(newPlayer, newEnemy, currentTurnLogs, gameStatus);
  };

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

  const toggleAuto = () => {
    if (!showUpgradeOptions && !showShop) {
      setIsAuto((prev) => !prev);
    }
  };

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
    setShowRareStats(true);
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
      <div className="flex w-full">
        <div className="flex-1 text-left">
          <h1
            onClick={() => setOpenTips(true)}
            className="cursor-pointer"
            title="Click for info"
          >
            💡
          </h1>

          {openTips && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-game-secondary rounded-lg shadow-lg p-6 max-w-lg w-full relative">
                <button
                  onClick={() => setOpenTips(false)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-black"
                >
                  ✖
                </button>

                <h2 className="text-xl font-bold mb-4">Stats Explanation</h2>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>
                    <b>Health</b>: Maximum hit points. If it reaches 0, you die.
                  </li>
                  <li>
                    <b>Regeneration</b>: Amount of HP recovered each turn.
                  </li>
                  <li>
                    <b>Armor</b>: Reduces incoming physical damage.
                  </li>
                  <li>
                    <b>Attack</b>: Base damage dealt to enemies.
                  </li>
                  <li>
                    <b>Crit Chance</b>: Probability of landing a critical hit.
                  </li>
                  <li>
                    <b>Crit Damage</b>: Extra damage multiplier when a crit
                    occurs.
                  </li>
                  <li>
                    <b>Life Steal</b>: Portion of damage dealt returned as HP.
                  </li>
                  <li>
                    <b>Dodge</b>: Chance to completely avoid an attack.
                  </li>
                  <li>
                    <b>Gold</b>: Currency used to buy upgrades or items.
                  </li>
                  <li>
                    <b>Burn</b>: Deals fixed damage at the end of each turn.
                  </li>
                  <li>
                    <b>Poison</b>: Deals damage each turn and increases over
                    time.
                  </li>
                  <li>
                    <b>Thorn</b>: Deals fixed damage back to the attacker when
                    hit by an attack.
                  </li>
                  <li>
                    <b>Counterattack</b>: Chance to attack back at the attacker
                    when hit.
                  </li>
                  <li>
                    <b>Stun Chance</b>: Probability of disabling the enemy for
                    one turn.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {level % 10 === 0 ? (
              <>
                <span className="text-red-500">Boss</span> - Level {level}
              </>
            ) : (
              <>Level {level}</>
            )}
          </h1>
        </div>
        <div className="flex-1 text-right"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold">Player Stats:</h2>
          <div className="p-1">
            <div className="flex justify-between text-sm">
              <span>Health:</span>
              <span>
                {player.currentHealth} / {player.maxHealth}
              </span>
            </div>
            {renderStat("Regeneration", player.regeneration)}
            {renderStat("Armor", player.armor)}
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
                {renderRareStat("Thorn", player.rareStats.thorn)}
                {renderRareStat(
                  "Counterattack",
                  player.rareStats.counterattack,
                  true
                )}
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
            <div className="flex justify-between text-sm">
              <span>Health:</span>
              <span>
                {enemy.currentHealth} / {enemy.maxHealth}
              </span>
            </div>
            {renderStat("Regeneration", enemy.regeneration)}
            {renderStat("Armor", enemy.armor)}
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
                {renderRareStat("Thorn", enemy.rareStats.thorn)}
                {renderRareStat(
                  "Counterattack",
                  enemy.rareStats.counterattack,
                  true
                )}
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

      <div
        className="flex justify-center items-center space-x-2 mb-2"
        title={`Adjust Auto Speed: ${autoSpeed} ms`}
      >
        <span>Auto Speed:</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={max - autoSpeed + min}
          onChange={(e) => setAutoSpeed(max - Number(e.target.value) + min)}
        />
      </div>

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
                {option.name}: {option.format(option.value)} | Cost:{" "}
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
              Reroll Shop | Cost: {rerollPrice} gold
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
              <button onClick={handleEndRun} title="End Run">
                ☠️
              </button>
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
