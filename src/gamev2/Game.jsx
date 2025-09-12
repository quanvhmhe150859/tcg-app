import React, { useState, useEffect } from "react";

// Helper functions
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Math.random() * (max - min) + min;

// Define initial player stats
const initialPlayerStats = {
  maxHealth: 100,
  health: 100,
  regeneration: 5,
  minAttack: 10,
  maxAttack: 20,
  critChance: 0.1,
  critDamage: 2,
  lifeSteal: 0.05,
  dodge: 0.05,
  shield: 0,
  armor: 5,
  gold: 0,
};

// Function to generate enemy stats based on level
const generateEnemy = (level) => ({
  health: 50 + level * 20,
  maxHealth: 50 + level * 20,
  regeneration: 2 + level * 1,
  minAttack: 5 + level * 2,
  maxAttack: 10 + level * 3,
  critChance: 0.05 + level * 0.01,
  critDamage: 1.5 + level * 0.1,
  lifeSteal: 0.02 + level * 0.01,
  dodge: 0.03 + level * 0.01,
  shield: 0,
  armor: 2 + level * 1,
  gold: 0, // Not used for enemy
});

// Function to calculate gold reward based on enemy stats
const calculateGoldReward = (enemy) => {
  return Math.floor(
    enemy.health +
      enemy.maxHealth +
      enemy.regeneration +
      enemy.minAttack +
      enemy.maxAttack +
      enemy.critChance * 100 + // Convert percentage to value
      (enemy.critDamage - 1) * 100 + // Convert percentage to value
      enemy.lifeSteal * 100 + // Convert percentage to value
      enemy.dodge * 100 + // Convert percentage to value
      enemy.shield +
      enemy.armor
  );
};

// Function to perform an attack from attacker to defender
const performAttack = (attacker, defender) => {
  let damage = randomInt(attacker.minAttack, attacker.maxAttack);
  const isCrit = Math.random() < attacker.critChance;

  // Check crit
  if (isCrit) {
    damage = Math.floor(damage * attacker.critDamage);
  }

  // Check dodge
  if (Math.random() < defender.dodge) {
    return { damage: 0, healed: 0, isCrit, isMiss: true };
  }

  // Apply armor
  damage = Math.max(0, damage - defender.armor);

  // Apply to shield first
  if (defender.shield > 0) {
    const shieldDamage = Math.min(damage, defender.shield);
    defender.shield -= shieldDamage;
    damage -= shieldDamage;
  }

  // Apply remaining to health
  defender.health = Math.max(0, defender.health - damage);

  // Life steal
  const healed = Math.floor(damage * attacker.lifeSteal);
  attacker.health = Math.min(attacker.maxHealth, attacker.health + healed);

  return { damage, healed, isCrit, isMiss: false };
};

// Function to apply regeneration
const applyRegeneration = (entity) => {
  entity.health = Math.min(
    entity.maxHealth,
    entity.health + entity.regeneration
  );
};

// Possible upgrades
const upgrades = [
  { name: "maxHealth", value: 20, label: "+20 Max Health" },
  { name: "regeneration", value: 2, label: "+2 Regeneration" },
  { name: "minAttack", value: 5, label: "+5 Min Attack" },
  { name: "maxAttack", value: 5, label: "+5 Max Attack" },
  { name: "critChance", value: 0.05, label: "+5% Crit Chance" },
  { name: "critDamage", value: 0.5, label: "+50% Crit Damage" },
  { name: "lifeSteal", value: 0.02, label: "+2% Life Steal" },
  { name: "dodge", value: 0.02, label: "+2% Dodge" },
  { name: "armor", value: 3, label: "+3 Armor" },
];

// Function to get 3 random upgrades
const getRandomUpgrades = () => {
  const shuffled = [...upgrades].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

const GameComponent = () => {
  const [player, setPlayer] = useState({ ...initialPlayerStats });
  const [enemy, setEnemy] = useState(null);
  const [level, setLevel] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [choosingUpgrade, setChoosingUpgrade] = useState(false);
  const [upgradesOptions, setUpgradesOptions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [turn, setTurn] = useState(0);
  const [isAuto, setIsAuto] = useState(false);

  const addLog = (
    message,
    type = "default",
    turnNumber,
    isPlayerAction = false
  ) => {
    setLogs((prev) =>
      [{ message, type, turn: turnNumber, isPlayerAction }, ...prev].slice(
        0,
        20
      )
    ); // Latest log first, max 20
  };

  const startGame = () => {
    setPlayer({ ...initialPlayerStats });
    setEnemy(generateEnemy(1));
    setLevel(1);
    setGameStarted(true);
    setChoosingUpgrade(false);
    setLogs([]);
    setTurn(0);
    setIsAuto(false);
    addLog("Game started! Enemy appeared.", "default", 0);
  };

  const restartGame = () => {
    startGame();
  };

  const toggleAuto = () => {
    setIsAuto((prev) => !prev);
  };

  const nextRound = () => {
    if (!enemy || player.health <= 0 || enemy.health <= 0) return;

    const newPlayer = { ...player };
    const newEnemy = { ...enemy };
    const currentTurn = turn + 1;
    setTurn(currentTurn);

    // Player attacks enemy
    const playerAttack = performAttack(newPlayer, newEnemy);
    if (playerAttack.isMiss) {
      addLog("Player missed the enemy!", "default", currentTurn, true);
    } else {
      const critText = playerAttack.isCrit ? " (Critical Hit!)" : "";
      const healText =
        playerAttack.healed > 0 ? ` Healed ${playerAttack.healed}.` : "";
      addLog(
        `Player attacked enemy for ${playerAttack.damage} damage${critText}.${healText}`,
        playerAttack.healed > 0
          ? "heal"
          : playerAttack.isCrit
          ? "crit"
          : "default",
        currentTurn,
        true
      );
    }

    // Check if enemy dead
    if (newEnemy.health <= 0) {
      const goldEarned = calculateGoldReward(newEnemy);
      newPlayer.gold += goldEarned;
      addLog(`Enemy defeated! Gained ${goldEarned} gold.`, "gold", currentTurn);
      setEnemy(newEnemy);
      setPlayer(newPlayer);
      setChoosingUpgrade(true);
      setUpgradesOptions(getRandomUpgrades());
      return;
    }

    // Enemy attacks player
    const enemyAttack = performAttack(newEnemy, newPlayer);
    if (enemyAttack.isMiss) {
      addLog("Enemy missed the player!", "default", currentTurn, false);
    } else {
      const critText = enemyAttack.isCrit ? " (Critical Hit!)" : "";
      const healText =
        enemyAttack.healed > 0 ? ` Healed ${enemyAttack.healed}.` : "";
      addLog(
        `Enemy attacked player for ${enemyAttack.damage} damage${critText}.${healText}`,
        enemyAttack.healed > 0
          ? "heal"
          : enemyAttack.isCrit
          ? "crit"
          : "default",
        currentTurn,
        false
      );
    }

    // Check if player dead
    if (newPlayer.health <= 0) {
      addLog("Player defeated!", "death", currentTurn);
      setPlayer(newPlayer);
      setEnemy(newEnemy);
      setIsAuto(false); // Stop auto mode when player dies
      return; // Stop further actions
    }

    // Apply regeneration
    if (newPlayer.regeneration > 0) {
      applyRegeneration(newPlayer);
      addLog(
        `Player regenerated ${newPlayer.regeneration} health.`,
        "heal",
        currentTurn,
        true
      );
    }
    if (newEnemy.regeneration > 0) {
      applyRegeneration(newEnemy);
      addLog(
        `Enemy regenerated ${newEnemy.regeneration} health.`,
        "heal",
        currentTurn,
        false
      );
    }

    setPlayer(newPlayer);
    setEnemy(newEnemy);
  };

  useEffect(() => {
    let interval;
    if (
      isAuto &&
      enemy &&
      player.health > 0 &&
      enemy.health > 0 &&
      !choosingUpgrade
    ) {
      interval = setInterval(() => {
        nextRound();
      }, 100); // Auto triggers every 1 second
    }
    return () => clearInterval(interval); // Cleanup interval on unmount or state change
  }, [isAuto, enemy, player.health, choosingUpgrade]);

  const chooseUpgrade = (upgrade) => {
    const newPlayer = { ...player };
    newPlayer[upgrade.name] += upgrade.value;
    if (upgrade.name === "maxHealth") {
      newPlayer.health += upgrade.value;
    }
    setPlayer(newPlayer);
    setLevel((prev) => prev + 1);
    setEnemy(generateEnemy(level + 1));
    setChoosingUpgrade(false);
    setTurn(0); // Reset turn for new enemy
    addLog(`Upgraded ${upgrade.label}. New enemy appeared.`, "default", 0);
    // Auto mode continues if it was active
  };

  const renderStats = (entity, title) => (
    <div>
      <h3>{title}</h3>
      <p>
        Health: {entity.health}/{entity.maxHealth}
      </p>
      <p>Regeneration: {entity.regeneration}</p>
      <p>
        Attack: {entity.minAttack}-{entity.maxAttack}
      </p>
      <p>Crit Chance: {(entity.critChance * 100).toFixed(0)}%</p>
      <p>Crit Damage: {((entity.critDamage - 1) * 100).toFixed(0)}%</p>
      <p>Life Steal: {(entity.lifeSteal * 100).toFixed(0)}%</p>
      <p>Dodge: {(entity.dodge * 100).toFixed(0)}%</p>
      <p>Shield: {entity.shield}</p>
      <p>Armor: {entity.armor}</p>
      {title === "Player" && <p>Gold: {entity.gold}</p>}
    </div>
  );

  const getLogClass = (type) => {
    switch (type) {
      case "heal":
        return "text-green-500";
      case "crit":
        return "text-orange-500";
      case "death":
        return "text-red-500";
      case "gold":
        return "text-yellow-500";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold">Simple Combat Game</h1>
      {!gameStarted ? (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={startGame}
        >
          Start
        </button>
      ) : player.health <= 0 ? (
        <div className="text-center">
          <p className="text-red-500 font-bold">Game Over!</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={restartGame}
          >
            Restart
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-around w-full">
            {renderStats(player, "Player")}
            {enemy && renderStats(enemy, "Enemy")}
          </div>
          {choosingUpgrade ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold">Choose an Upgrade:</h3>
              <div className="flex gap-2 mt-2">
                {upgradesOptions.map((opt, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() => chooseUpgrade(opt)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ) : enemy && enemy.health > 0 ? (
            <div className="flex gap-2 mt-4">
              {!isAuto && (
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={nextRound}
                >
                  Next Round
                </button>
              )}
              <button
                className={`px-4 py-2 ${
                  isAuto
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white rounded`}
                onClick={toggleAuto}
              >
                {isAuto ? "Stop Auto" : "Start Auto"}
              </button>
            </div>
          ) : null}
          <div className="mt-4 w-4/5 border border-gray-300 p-4">
            <h3 className="text-lg font-semibold">Combat Logs (Last 20)</h3>
            {logs
              .reduce((acc, log) => {
                const turnGroup = acc.find(
                  (group) => group.turn === log.turn
                ) || { turn: log.turn, logs: [] };
                turnGroup.logs.push({
                  message: log.message,
                  type: log.type,
                  isPlayerAction: log.isPlayerAction,
                });
                if (!acc.some((group) => group.turn === log.turn)) {
                  acc.push(turnGroup);
                }
                return acc;
              }, [])
              .map((group, index) => (
                <div key={index} className="mb-2">
                  <p className="font-bold">Turn {group.turn}:</p>
                  {group.logs
                    .sort((a, b) =>
                      b.isPlayerAction === a.isPlayerAction
                        ? 0
                        : b.isPlayerAction
                        ? 1
                        : -1
                    )
                    .map((log, logIndex) => (
                      <p
                        key={logIndex}
                        className={getLogClass(log.type)}
                        style={{ marginLeft: "1rem" }}
                      >
                        {log.message}
                      </p>
                    ))}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GameComponent;
