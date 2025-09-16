import React, { useState, useEffect, useRef } from 'react';

// Initialize player with fixed stats
const initPlayer = () => ({
  health: 100,
  minAttack: 10,
  maxAttack: 100,
  critChance: 0.2, // 20% chance for critical hit
  critDamage: 2,   // 200% damage on critical hit
  lifeSteal: 0.3,  // 30% of damage dealt restored as health
  regeneration: 5, // 5 health restored per turn
  dodge: 0.1,      // 10% chance to dodge attacks
  armor: 50,       // 50 armor reduces damage by ~33.33%
  gold: 0,         // Gold earned from defeating enemies
});

// Initialize enemy with random stats based on level
const initEnemy = (level) => ({
  health: Math.floor(100 * level * (0.8 + Math.random() * 0.4)),
  minAttack: Math.floor(1 * level * (0.8 + Math.random() * 0.4)),
  maxAttack: Math.floor(10 * level * (0.8 + Math.random() * 0.4)),
  critChance: 0.2 * (0.8 + Math.random() * 0.4),
  critDamage: 2 * (0.8 + Math.random() * 0.4),
  lifeSteal: 0.3 * (0.8 + Math.random() * 0.4),
  regeneration: Math.floor(5 * level * (0.8 + Math.random() * 0.4)),
  dodge: 0.1 * (0.8 + Math.random() * 0.4),
  armor: Math.floor(50 * level * (0.8 + Math.random() * 0.4)),
});

// Generate three random upgrade options
const generateUpgradeOptions = () => {
  const stats = [
    { key: 'health', name: 'Health', min: 20, max: 50, format: (val) => `+${val}` },
    { key: 'minAttack', name: 'Min Attack', min: 1, max: 3, format: (val) => `+${val}` },
    { key: 'maxAttack', name: 'Max Attack', min: 2, max: 5, format: (val) => `+${val}` },
    { key: 'critChance', name: 'Crit Chance', min: 1, max: 5, format: (val) => `+${val}%` },
    { key: 'critDamage', name: 'Crit Damage', min: 10, max: 50, format: (val) => `+${val}%` },
    { key: 'lifeSteal', name: 'Life Steal', min: 1, max: 5, format: (val) => `+${val}%` },
    { key: 'regeneration', name: 'Regeneration', min: 2, max: 5, format: (val) => `+${val}` },
    { key: 'dodge', name: 'Dodge', min: 1, max: 5, format: (val) => `+${val}%` },
    { key: 'armor', name: 'Armor', min: 10, max: 30, format: (val) => `+${val}` },
  ];
  // Shuffle stats and pick first three
  const shuffled = stats.sort(() => Math.random() - 0.5).slice(0, 3);
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
  const [level, setLevel] = useState(1);
  const [isAuto, setIsAuto] = useState(false);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);
  const [upgradeOptions, setUpgradeOptions] = useState([]);
  const logContainerRef = useRef(null);

  // Auto-scroll to the latest turn (top)
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0; // Scroll to top for newest turn
    }
  }, [turnLogs]);

  // Handle auto-attack mode
  useEffect(() => {
    if (isAuto && !gameOver && !showUpgradeOptions) {
      const interval = setInterval(() => {
        handleAttack();
      }, 100);
      return () => clearInterval(interval); // Cleanup interval
    }
  }, [isAuto, gameOver, showUpgradeOptions, player, enemy, turnCount, level]);

  // Add log to the current turn's log array
  const addLog = (message, type, currentTurnLogs) => {
    const colorMap = {
      turn: '',
      attackCritical: 'text-orange-500',
      lifeSteal: 'text-green-500',
      regeneration: 'text-green-500',
      gameOver: 'text-red-500',
      dodge: 'text-blue-500',
      levelUp: 'text-purple-500',
      upgrade: 'text-yellow-500',
      gold: 'text-yellow-500',
    };
    currentTurnLogs.push({ message, color: colorMap[type] || '' });
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
        newEnemy.armor
      );
      newPlayer.gold += goldGained;
      addLog(`Enemy defeated! Level up to ${level + 1}!`, 'levelUp', currentTurnLogs);
      addLog(`Player gained ${goldGained} gold!`, 'gold', currentTurnLogs);
      return { isOver: false, levelUp: true };
    }
    if (newPlayer.health <= 0) {
      addLog('Player defeated!', 'gameOver', currentTurnLogs);
      return { isOver: true, levelUp: false };
    }
    return { isOver: false, levelUp: false };
  };

  // Start of a turn
  const startTurn = (turn, level, currentTurnLogs) => {
    addLog(`Turn ${turn} (Level ${level})`, 'turn', currentTurnLogs);
  };

  // Consolidated attack phase for player or enemy
  const attackPhase = (attacker, defender, attackerName, currentTurnLogs) => {
    // Check for dodge
    if (Math.random() < defender.dodge) {
      addLog(`${attackerName === 'Player' ? 'Enemy' : 'Player'} dodges the attack!`, 'dodge', currentTurnLogs);
      return true; // Defender is alive
    }

    const baseDamage = Math.floor(Math.random() * (attacker.maxAttack - attacker.minAttack + 1)) + attacker.minAttack;
    const isCritical = Math.random() < attacker.critChance;
    const preArmorDamage = isCritical ? Math.floor(baseDamage * attacker.critDamage) : baseDamage;
    const finalDamage = Math.floor(preArmorDamage * (100 / (100 + defender.armor)));
    defender.health = Math.max(0, defender.health - finalDamage);
    addLog(
      `${attackerName} deals ${finalDamage} (${preArmorDamage}) damage to ${attackerName === 'Player' ? 'Enemy' : 'Player'}!${isCritical ? ' (Critical Hit)' : ''}`,
      isCritical ? 'attackCritical' : '',
      currentTurnLogs
    );

    // Life steal based on final damage
    if (attacker.lifeSteal > 0 && finalDamage > 0) {
      const healthRestored = Math.floor(finalDamage * attacker.lifeSteal);
      if (healthRestored > 0) {
        addLog(`${attackerName} restores ${healthRestored} health via life steal!`, 'lifeSteal', currentTurnLogs);
      }
    }

    return defender.health > 0; // Return true if defender is alive
  };

  // Player's turn phase
  const playerTurn = (newPlayer, newEnemy, currentTurnLogs) => {
    if (newPlayer.regeneration > 0) {
      newPlayer.health += newPlayer.regeneration;
      addLog(`Player regenerates ${newPlayer.regeneration} health!`, 'regeneration', currentTurnLogs);
    }
    return attackPhase(newPlayer, newEnemy, 'Player', currentTurnLogs);
  };

  // Enemy's turn phase
  const enemyTurn = (newPlayer, newEnemy, currentTurnLogs) => {
    if (newEnemy.regeneration > 0) {
      newEnemy.health += newEnemy.regeneration;
      addLog(`Enemy regenerates ${newEnemy.regeneration} health!`, 'regeneration', currentTurnLogs);
    }
    attackPhase(newEnemy, newPlayer, 'Enemy', currentTurnLogs);
  };

  // End of a turn
  const endTurn = (newPlayer, newEnemy, currentTurnLogs, gameStatus) => {
    setPlayer(newPlayer);
    setEnemy(newEnemy);
    setTurnLogs((prev) => {
      const newTurnLogs = [...prev, { turnId: globalTurnCount, turn: turnCount, level: level, logs: currentTurnLogs }];
      // Limit to 20 turns, remove oldest if necessary
      if (newTurnLogs.length > 20) {
        return newTurnLogs.slice(1);
      }
      return newTurnLogs;
    });
    if (gameStatus.isOver) {
      setGameOver(true);
      setIsAuto(false); // Stop auto mode on game over
    }
    if (gameStatus.levelUp) {
      setShowUpgradeOptions(true);
      setUpgradeOptions(generateUpgradeOptions());
    }
  };

  // Handle upgrade selection
  const handleUpgrade = (option) => {
    setGlobalTurnCount((prev) => prev + 1); // Increment before logging
    setPlayer((prev) => {
      const newPlayer = { ...prev };
      // Scale percentage stats by dividing by 100
      const value = ['critChance', 'lifeSteal', 'dodge'].includes(option.key)
        ? option.value / 100
        : ['critDamage'].includes(option.key)
        ? option.value / 100
        : option.value;
      newPlayer[option.key] += value;
      const currentTurnLogs = [];
      const logMessage = ['critChance', 'critDamage', 'lifeSteal', 'dodge'].includes(option.key)
        ? `Player upgraded ${option.name} by +${option.value}%!`
        : `Player upgraded ${option.name} by +${option.value}!`;
      addLog(logMessage, 'upgrade', currentTurnLogs);
      setTurnLogs((prev) => {
        const newTurnLogs = [...prev, { turnId: globalTurnCount + 1, turn: turnCount, level: level, logs: currentTurnLogs }];
        if (newTurnLogs.length > 20) {
          return newTurnLogs.slice(1);
        }
        return newTurnLogs;
      });
      return newPlayer;
    });
    setLevel((prev) => prev + 1);
    setEnemy(initEnemy(level + 1));
    setTurnCount(1);
    setGlobalTurnCount((prev) => prev + 1); // Increment after logging
    setShowUpgradeOptions(false);
  };

  const handleAttack = () => {
    if (gameOver || showUpgradeOptions) return;

    let newPlayer = { ...player };
    let newEnemy = { ...enemy };
    const currentTurn = turnCount;
    const currentGlobalTurn = globalTurnCount;
    const currentTurnLogs = []; // Logs for the current turn

    // Execute turn phases
    startTurn(currentTurn, level, currentTurnLogs);
    const enemyAlive = playerTurn(newPlayer, newEnemy, currentTurnLogs);
    const gameStatus = checkGameOver(newPlayer, newEnemy, currentTurnLogs);
    if (enemyAlive && !gameStatus.isOver) {
      enemyTurn(newPlayer, newEnemy, currentTurnLogs);
      const finalGameStatus = checkGameOver(newPlayer, newEnemy, currentTurnLogs);
      endTurn(newPlayer, newEnemy, currentTurnLogs, finalGameStatus);
    } else {
      endTurn(newPlayer, newEnemy, currentTurnLogs, gameStatus);
    }

    setGlobalTurnCount(currentGlobalTurn + 1);
    if (!gameStatus.levelUp) {
      setTurnCount(currentTurn + 1);
    }
  };

  const toggleAuto = () => {
    if (!showUpgradeOptions) {
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
    setLevel(1);
    setIsAuto(false);
    setShowUpgradeOptions(false);
    setUpgradeOptions([]);
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-100 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Turn-Based Battle Game - Level {level}</h1>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold">Player Stats:</h2>
          <p>Health: {player.health}</p>
          <p>Min Attack: {player.minAttack}</p>
          <p>Max Attack: {player.maxAttack}</p>
          <p>Crit Chance: {(player.critChance * 100).toFixed(0)}%</p>
          <p>Crit Damage: {(player.critDamage * 100).toFixed(0)}%</p>
          <p>Life Steal: {(player.lifeSteal * 100).toFixed(0)}%</p>
          <p>Regeneration: {player.regeneration}</p>
          <p>Dodge: {(player.dodge * 100).toFixed(0)}%</p>
          <p>Armor: {player.armor}</p>
          <p>Gold: {player.gold}</p>
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
          <p>Dodge: {(enemy.dodge * 100).toFixed(0)}%</p>
          <p>Armor: {enemy.armor}</p>
        </div>
      </div>
      {showUpgradeOptions && (
        <div className="mb-4">
          <h2 className="font-semibold">Choose an Upgrade:</h2>
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
      {!gameOver && !showUpgradeOptions && (
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
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
          >
            {isAuto ? 'Stop Auto' : 'Auto'}
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
      <div
        ref={logContainerRef}
        className="mt-2 max-h-64 overflow-y-auto"
      >
        {turnLogs.slice().reverse().map((turnEntry, turnIndex, reversedArray) => (
          <div key={turnEntry.turnId}>
            {turnEntry.logs.map((log, logIndex) => (
              <p key={`${turnEntry.turnId}-${logIndex}`} className={`text-sm ${log.color}`}>
                {log.message}
              </p>
            ))}
            {turnIndex < reversedArray.length - 1 && <hr className="my-2 border-gray-300" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattleGame;