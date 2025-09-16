import React, { useState, useEffect, useRef } from 'react';

// Initialize player with fixed stats
const initPlayer = () => ({
  health: 100,
  minAttack: 1,
  maxAttack: 10,
  critChance: 0.2, // 20% chance for critical hit
  critDamage: 2,   // 200% damage on critical hit
  lifeSteal: 0.3,  // 30% of damage dealt restored as health
  regeneration: 5, // 5 health restored per turn
});

// Initialize enemy with fixed stats
const initEnemy = () => ({
  health: 100,
  minAttack: 1,
  maxAttack: 10,
  critChance: 0.2, // 20% chance for critical hit
  critDamage: 2,   // 200% damage on critical hit
  lifeSteal: 0.3,  // 30% of damage dealt restored as health
  regeneration: 5, // 5 health restored per turn
});

const BattleGame = () => {
  const [player, setPlayer] = useState(initPlayer());
  const [enemy, setEnemy] = useState(initEnemy());
  const [gameLog, setGameLog] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [turnCount, setTurnCount] = useState(1);
  const [isAuto, setIsAuto] = useState(false);
  const logContainerRef = useRef(null);

  // Auto-scroll to the latest log entry
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [gameLog]);

  // Handle auto-attack mode
  useEffect(() => {
    if (isAuto && !gameOver) {
      const interval = setInterval(() => {
        handleAttack();
      }, 100);
      return () => clearInterval(interval); // Cleanup interval
    }
  }, [isAuto, gameOver, player, enemy, turnCount]);

  // Add log with color based on type
  const addLog = (message, type) => {
    const colorMap = {
      turn: '',
      attackCritical: 'text-orange-500',
      lifeSteal: 'text-green-500',
      regeneration: 'text-green-500',
      gameOver: 'text-red-500',
    };
    setGameLog((prev) => [...prev, { message, color: colorMap[type] || '' }]);
  };

  // Check if game is over (player or enemy health <= 0)
  const checkGameOver = (newPlayer, newEnemy) => {
    if (newEnemy.health <= 0) {
      addLog('Enemy defeated!', 'gameOver');
      return { isOver: true, winner: 'Player' };
    }
    if (newPlayer.health <= 0) {
      addLog('Player defeated!', 'gameOver');
      return { isOver: true, winner: 'Enemy' };
    }
    return { isOver: false, winner: null };
  };

  // Start of a turn
  const startTurn = (turn) => {
    addLog(`Turn ${turn}`, 'turn');
  };

  // Consolidated attack phase for player or enemy
  const attackPhase = (attacker, defender, attackerName) => {
    const baseDamage = Math.floor(Math.random() * (attacker.maxAttack - attacker.minAttack + 1)) + attacker.minAttack;
    const isCritical = Math.random() < attacker.critChance;
    const finalDamage = isCritical ? Math.floor(baseDamage * attacker.critDamage) : baseDamage;
    defender.health = Math.max(0, defender.health - finalDamage);
    addLog(
      `${attackerName} deals ${finalDamage} damage to ${attackerName === 'Player' ? 'Enemy' : 'Player'}!${isCritical ? ' (Critical Hit)' : ''}`,
      isCritical ? 'attackCritical' : ''
    );

    // Life steal
    if (attacker.lifeSteal > 0 && finalDamage > 0) {
      const healthRestored = Math.floor(finalDamage * attacker.lifeSteal);
      if (healthRestored > 0) {
        attacker.health += healthRestored;
        addLog(`${attackerName} restores ${healthRestored} health via life steal!`, 'lifeSteal');
      }
    }

    return defender.health > 0; // Return true if defender is still alive
  };

  // Player's turn phase
  const playerTurn = (newPlayer, newEnemy) => {
    if (newPlayer.regeneration > 0) {
      newPlayer.health += newPlayer.regeneration;
      addLog(`Player regenerates ${newPlayer.regeneration} health!`, 'regeneration');
    }
    return attackPhase(newPlayer, newEnemy, 'Player');
  };

  // Enemy's turn phase
  const enemyTurn = (newPlayer, newEnemy) => {
    if (newEnemy.regeneration > 0) {
      newEnemy.health += newEnemy.regeneration;
      addLog(`Enemy regenerates ${newEnemy.regeneration} health!`, 'regeneration');
    }
    attackPhase(newEnemy, newPlayer, 'Enemy');
  };

  // End of a turn
  const endTurn = (newPlayer, newEnemy, gameStatus) => {
    setPlayer(newPlayer);
    setEnemy(newEnemy);
    if (gameStatus.isOver) {
      setGameOver(true);
      setIsAuto(false); // Stop auto mode on game over
    }
  };

  const handleAttack = () => {
    if (gameOver) return;

    let newPlayer = { ...player };
    let newEnemy = { ...enemy };
    const currentTurn = turnCount;

    // Execute turn phases
    startTurn(currentTurn);
    const enemyAlive = playerTurn(newPlayer, newEnemy);
    const gameStatus = checkGameOver(newPlayer, newEnemy);
    if (enemyAlive && !gameStatus.isOver) {
      enemyTurn(newPlayer, newEnemy);
      const finalGameStatus = checkGameOver(newPlayer, newEnemy);
      endTurn(newPlayer, newEnemy, finalGameStatus);
    } else {
      endTurn(newPlayer, newEnemy, gameStatus);
    }

    setTurnCount(currentTurn + 1);
  };

  const toggleAuto = () => {
    setIsAuto((prev) => !prev);
  };

  const resetGame = () => {
    setPlayer(initPlayer());
    setEnemy(initEnemy());
    setGameLog([]);
    setGameOver(false);
    setTurnCount(1);
    setIsAuto(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-gray-100 rounded-lg bg-gray-900">
      <h1 className="text-2xl font-bold mb-4">Turn-Based Battle Game</h1>
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
        </div>
      </div>
      {!gameOver && (
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
      <div
        ref={logContainerRef}
        className="mt-4 max-h-40 overflow-y-auto"
      >
        <h2 className="font-semibold">Battle Log:</h2>
        {gameLog.map((log, index) => (
          <p key={index} className={`text-sm ${log.color}`}>
            {log.message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default BattleGame;